import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketAPI, adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiUserPlus, FiArrowRight } from 'react-icons/fi';

const TicketManagement = () => {
  const { isAdmin } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [assignModal, setAssignModal] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const ticketRes = isAdmin()
        ? await ticketAPI.getAll()
        : await ticketAPI.getAssigned();
      setTickets(ticketRes.data.data || []);

      if (isAdmin()) {
        try {
          const techRes = await adminAPI.getUsersByRole('TECHNICIAN');
          setTechnicians(techRes.data.data || []);
        } catch { /* ignore */ }
      }
    } catch (err) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (ticketId, techId) => {
    try {
      await ticketAPI.assign(ticketId, techId);
      toast.success('Technician assigned');
      setAssignModal(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assign failed');
    }
  };

  const handleStatusUpdate = async (ticketId, status) => {
    try {
      const data = { status };
      if (resolutionNotes) data.resolutionNotes = resolutionNotes;
      await ticketAPI.updateStatus(ticketId, data);
      toast.success(`Ticket status updated to ${status}`);
      setStatusModal(null);
      setResolutionNotes('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
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

  const getNextStatuses = (currentStatus) => {
    const transitions = {
      OPEN: ['IN_PROGRESS', 'REJECTED'],
      IN_PROGRESS: ['RESOLVED', 'REJECTED'],
      RESOLVED: ['CLOSED'],
    };
    return transitions[currentStatus] || [];
  };

  const filtered = filterStatus ? tickets.filter(t => t.status === filterStatus) : tickets;

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {isAdmin() ? 'Ticket Management' : 'Assigned Tickets'}
      </h1>
      <p className="text-gray-500 text-sm mb-6">Manage and resolve maintenance tickets</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}>
            {s ? s.replace(/_/g, ' ') : 'All'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-400">No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Link to={`/tickets/${ticket.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                      {ticket.title}
                    </Link>
                    <FiAlertTriangle className={`w-4 h-4 ${priorityColor(ticket.priority)}`} />
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(ticket.status)}`}>
                      {ticket.status?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{ticket.description?.substring(0, 100)}...</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                    <span>By: {ticket.reporterName}</span>
                    <span>{ticket.category}</span>
                    <span className={`font-medium ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
                    {ticket.assignedTechnicianName && <span>Assigned: {ticket.assignedTechnicianName}</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {isAdmin() && !ticket.assignedTechnicianId && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
                    <button onClick={() => setAssignModal(ticket.id)}
                      className="flex items-center space-x-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-lg hover:bg-purple-100">
                      <FiUserPlus className="w-3 h-3" /> <span>Assign</span>
                    </button>
                  )}
                  {getNextStatuses(ticket.status).length > 0 && (
                    <button onClick={() => setStatusModal(ticket)}
                      className="flex items-center space-x-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-100">
                      <FiArrowRight className="w-3 h-3" /> <span>Update</span>
                    </button>
                  )}
                  <Link to={`/tickets/${ticket.id}`} className="text-xs text-blue-600 hover:underline">View</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Assign Technician</h2>
            {technicians.length === 0 ? (
              <p className="text-gray-500">No technicians available</p>
            ) : (
              <div className="space-y-2">
                {technicians.map(tech => (
                  <button key={tech.id} onClick={() => handleAssign(assignModal, tech.id)}
                    className="w-full text-left p-3 border rounded-lg hover:bg-blue-50">
                    <p className="font-medium">{tech.name}</p>
                    <p className="text-sm text-gray-500">{tech.email}</p>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setAssignModal(null)}
              className="mt-4 w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Update Ticket Status</h2>
            <p className="text-sm text-gray-500 mb-2">Current: {statusModal.status?.replace(/_/g, ' ')}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes</label>
              <textarea value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)}
                rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Optional notes..." />
            </div>
            <div className="space-y-2">
              {getNextStatuses(statusModal.status).map(status => (
                <button key={status} onClick={() => handleStatusUpdate(statusModal.id, status)}
                  className={`w-full py-2 rounded-lg font-medium text-white ${
                    status === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' :
                    status === 'RESOLVED' ? 'bg-green-600 hover:bg-green-700' :
                    status === 'CLOSED' ? 'bg-gray-600 hover:bg-gray-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}>
                  {status.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
            <button onClick={() => { setStatusModal(null); setResolutionNotes(''); }}
              className="mt-4 w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketManagement;
