import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketAPI, commentAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSend, FiTrash2, FiEdit2, FiAlertTriangle, FiMapPin } from 'react-icons/fi';

const TicketDetail = () => {
  const { id } = useParams();
  const { user, isAdmin, isTechnician } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [ticketRes, commentsRes] = await Promise.all([
        ticketAPI.getById(id),
        commentAPI.getByTicket(id)
      ]);
      setTicket(ticketRes.data.data);
      setComments(commentsRes.data.data || []);
    } catch (err) {
      toast.error('Ticket not found');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await commentAPI.create(id, { content: newComment });
      setNewComment('');
      fetchData();
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentAPI.delete(id, commentId);
      fetchData();
      toast.success('Comment deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await commentAPI.update(id, commentId, { content: editText });
      setEditingComment(null);
      fetchData();
      toast.success('Comment updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm('Delete this ticket permanently?')) return;
    try {
      await ticketAPI.delete(id);
      toast.success('Ticket deleted');
      navigate('/tickets');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const statusColor = (status) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-800', IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      RESOLVED: 'bg-green-100 text-green-800', CLOSED: 'bg-gray-100 text-gray-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const priorityColor = (priority) => {
    const colors = { LOW: 'text-green-600', MEDIUM: 'text-yellow-600', HIGH: 'text-orange-600', CRITICAL: 'text-red-600' };
    return colors[priority] || 'text-gray-600';
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!ticket) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/tickets" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 mb-4">
        <FiArrowLeft /> <span>Back to Tickets</span>
      </Link>

      {/* Ticket Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
              <FiAlertTriangle className={`w-5 h-5 ${priorityColor(ticket.priority)}`} />
            </div>
            <div className="flex items-center space-x-3 mt-2">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(ticket.status)}`}>
                {ticket.status?.replace(/_/g, ' ')}
              </span>
              <span className="text-sm text-gray-500">{ticket.category}</span>
              <span className={`text-sm font-medium ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
            </div>
          </div>
          {(ticket.reporterId === user?.id || isAdmin()) && (
            <button onClick={handleDeleteTicket} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
              <FiTrash2 />
            </button>
          )}
        </div>

        <p className="text-gray-700 mt-4">{ticket.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 text-sm">
          <div><p className="text-gray-400">Reporter</p><p className="font-medium">{ticket.reporterName}</p></div>
          {ticket.assignedTechnicianName && (
            <div><p className="text-gray-400">Assigned Technician</p><p className="font-medium">{ticket.assignedTechnicianName}</p></div>
          )}
          {ticket.resourceName && (
            <div><p className="text-gray-400">Resource</p><p className="font-medium">{ticket.resourceName}</p></div>
          )}
          {ticket.location && (
            <div className="flex items-start space-x-1">
              <FiMapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div><p className="text-gray-400">Location</p><p className="font-medium">{ticket.location}</p></div>
            </div>
          )}
          {ticket.contactEmail && (
            <div><p className="text-gray-400">Contact Email</p><p className="font-medium">{ticket.contactEmail}</p></div>
          )}
          {ticket.contactPhone && (
            <div><p className="text-gray-400">Contact Phone</p><p className="font-medium">{ticket.contactPhone}</p></div>
          )}
          {ticket.resolutionNotes && (
            <div className="col-span-full"><p className="text-gray-400">Resolution Notes</p><p className="font-medium">{ticket.resolutionNotes}</p></div>
          )}
          {ticket.createdAt && (
            <div><p className="text-gray-400">Created</p><p className="font-medium">{new Date(ticket.createdAt).toLocaleString()}</p></div>
          )}
        </div>

        {/* Attachments */}
        {ticket.attachmentUrls?.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Attachments</p>
            <div className="flex flex-wrap gap-3">
              {ticket.attachmentUrls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                  <img src={url} alt={`Attachment ${i + 1}`} className="w-32 h-32 object-cover rounded-lg border hover:opacity-80" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Comments ({comments.length})</h2>

        {comments.length === 0 ? (
          <p className="text-gray-400 text-sm mb-4">No comments yet. Be the first to comment.</p>
        ) : (
          <div className="space-y-4 mb-6">
            {comments.map(comment => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                      <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                    </div>
                    {editingComment === comment.id ? (
                      <div className="mt-2 flex space-x-2">
                        <input value={editText} onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-1 text-sm" />
                        <button onClick={() => handleUpdateComment(comment.id)} className="text-sm text-blue-600 hover:text-blue-700">Save</button>
                        <button onClick={() => setEditingComment(null)} className="text-sm text-gray-500">Cancel</button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                    )}
                  </div>
                  {(comment.authorId === user?.id || isAdmin()) && (
                    <div className="flex space-x-1">
                      {comment.authorId === user?.id && (
                        <button onClick={() => { setEditingComment(comment.id); setEditText(comment.content); }}
                          className="p-1 text-gray-400 hover:text-blue-600"><FiEdit2 className="w-3 h-3" /></button>
                      )}
                      <button onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-gray-400 hover:text-red-600"><FiTrash2 className="w-3 h-3" /></button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="flex space-x-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <FiSend className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketDetail;
