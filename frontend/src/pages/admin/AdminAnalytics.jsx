import { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/analytics/summary');
        setAnalytics(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  const bookingsByResourceType = analytics?.bookingsByResourceType || {};
  const ticketsByPriority = analytics?.ticketsByPriority || {};
  const bookingsByStatus = analytics?.bookingsByStatus || {};

  const maxTypeCount = Math.max(1, ...Object.values(bookingsByResourceType));
  const maxPriorityCount = Math.max(1, ...Object.values(ticketsByPriority));
  const maxStatusCount = Math.max(1, ...Object.values(bookingsByStatus));

  const priorityLabelColor = (priority) => {
    if (priority === 'CRITICAL') return 'text-red-600';
    if (priority === 'HIGH') return 'text-orange-600';
    if (priority === 'MEDIUM') return 'text-yellow-600';
    if (priority === 'LOW') return 'text-green-600';
    return 'text-gray-700';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">📊 Platform Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Total Resources</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-3xl font-bold text-gray-900">{analytics?.totalResources ?? 0}</p>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">🏢</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Active Resources</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-3xl font-bold text-gray-900">{analytics?.activeResources ?? 0}</p>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-3xl font-bold text-gray-900">{analytics?.totalBookings ?? 0}</p>
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">📅</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Pending Bookings</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-3xl font-bold text-gray-900">{analytics?.pendingBookings ?? 0}</p>
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-yellow-600">⏳</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Total Tickets</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-3xl font-bold text-gray-900">{analytics?.totalTickets ?? 0}</p>
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">🎫</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500">Open Tickets</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-3xl font-bold text-gray-900">{analytics?.openTickets ?? 0}</p>
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600">🚨</div>
          </div>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🏆 Top Booked Resources</h2>
        <ol className="list-decimal list-inside space-y-2">
          {(analytics?.topBookedResources || []).map((name, idx) => (
            <li key={`${name}-${idx}`} className="text-gray-700">
              <span className="font-medium">{name}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📅 Bookings by Resource Type</h2>
        <div className="space-y-3">
          {Object.entries(bookingsByResourceType).map(([type, count]) => (
            <div key={type} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-3 text-sm font-medium text-gray-700">{type}</div>
              <div className="col-span-7 bg-gray-200 rounded h-4">
                <div className="bg-blue-500 rounded h-4" style={{ width: `${(count / maxTypeCount) * 100}%` }}></div>
              </div>
              <div className="col-span-2 text-sm text-right text-gray-700">{count}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🎫 Tickets by Priority</h2>
        <div className="space-y-3">
          {Object.entries(ticketsByPriority).map(([priority, count]) => (
            <div key={priority} className="grid grid-cols-12 gap-3 items-center">
              <div className={`col-span-3 text-sm font-medium ${priorityLabelColor(priority)}`}>{priority}</div>
              <div className="col-span-7 bg-gray-200 rounded h-4">
                <div className="bg-orange-500 rounded h-4" style={{ width: `${(count / maxPriorityCount) * 100}%` }}></div>
              </div>
              <div className="col-span-2 text-sm text-right text-gray-700">{count}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Bookings by Status</h2>
        <div className="space-y-3">
          {Object.entries(bookingsByStatus).map(([status, count]) => (
            <div key={status} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-3 text-sm font-medium text-gray-700">{status}</div>
              <div className="col-span-7 bg-gray-200 rounded h-4">
                <div className="bg-green-500 rounded h-4" style={{ width: `${(count / maxStatusCount) * 100}%` }}></div>
              </div>
              <div className="col-span-2 text-sm text-right text-gray-700">{count}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminAnalytics;
