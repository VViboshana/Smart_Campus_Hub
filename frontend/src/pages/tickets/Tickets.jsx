import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ticketAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiAlertTriangle } from 'react-icons/fi';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const res = await ticketAPI.getMyTickets();
      setTickets(res.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (status) => {
    const colors = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const priorityColor = (priority) => {
    const colors = {
      LOW: 'text-green-600',
      MEDIUM: 'text-yellow-600',
      HIGH: 'text-orange-600',
      CRITICAL: 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  const filtered = filterStatus ? tickets.filter(t => t.status === filterStatus) : tickets;

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">Track your maintenance and incident reports</p>
        </div>
        <Link to="/tickets/create" className="flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
          <FiPlus className="w-4 h-4" /> <span>Report Issue</span>
        </Link>
      </div>

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
            <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="block bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                    <FiAlertTriangle className={`w-4 h-4 ${priorityColor(ticket.priority)}`} />
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                    <span>{ticket.category}</span>
                    <span className={`font-medium ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
                    {ticket.resourceName && <span>Resource: {ticket.resourceName}</span>}
                    {ticket.assignedTechnicianName && <span>Assigned: {ticket.assignedTechnicianName}</span>}
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap ${statusColor(ticket.status)}`}>
                  {ticket.status?.replace(/_/g, ' ')}
                </span>
              </div>
              {ticket.attachmentUrls?.length > 0 && (
                <div className="mt-2 text-xs text-gray-400">{ticket.attachmentUrls.length} attachment(s)</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tickets;
