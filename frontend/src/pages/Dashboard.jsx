import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resourceAPI, bookingAPI, ticketAPI, notificationAPI } from '../services/api';
import { FiGrid, FiCalendar, FiAlertCircle, FiBell, FiPlus, FiArrowRight } from 'react-icons/fi';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({ resources: 0, bookings: 0, tickets: 0, notifications: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resourcesRes, bookingsRes, ticketsRes, notifRes] = await Promise.all([
          resourceAPI.getAll(),
          bookingAPI.getMyBookings(),
          ticketAPI.getMyTickets(),
          notificationAPI.getUnreadCount()
        ]);
        setStats({
          resources: resourcesRes.data.data?.length || 0,
          bookings: bookingsRes.data.data?.length || 0,
          tickets: ticketsRes.data.data?.length || 0,
          notifications: notifRes.data.data?.count ?? 0
        });
        setRecentBookings((bookingsRes.data.data || []).slice(0, 5));
        setRecentTickets((ticketsRes.data.data || []).slice(0, 5));
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Resources', value: stats.resources, icon: <FiGrid className="w-6 h-6" />, color: 'bg-blue-500', link: '/resources' },
    { label: 'My Bookings', value: stats.bookings, icon: <FiCalendar className="w-6 h-6" />, color: 'bg-green-500', link: '/bookings' },
    { label: 'My Tickets', value: stats.tickets, icon: <FiAlertCircle className="w-6 h-6" />, color: 'bg-orange-500', link: '/tickets' },
    { label: 'Unread Alerts', value: stats.notifications, icon: <FiBell className="w-6 h-6" />, color: 'bg-purple-500', link: '/notifications' },
  ];

  const statusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-500 mt-1">Here's what's happening on campus today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <Link key={card.label} to={card.link} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-lg text-white`}>
                {card.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/bookings/create" className="flex items-center space-x-3 bg-blue-600 text-white rounded-xl p-4 hover:bg-blue-700 transition-colors">
          <FiPlus className="w-5 h-5" />
          <span className="font-medium">New Booking</span>
        </Link>
        <Link to="/tickets/create" className="flex items-center space-x-3 bg-orange-600 text-white rounded-xl p-4 hover:bg-orange-700 transition-colors">
          <FiPlus className="w-5 h-5" />
          <span className="font-medium">Report Issue</span>
        </Link>
        <Link to="/resources" className="flex items-center space-x-3 bg-green-600 text-white rounded-xl p-4 hover:bg-green-700 transition-colors">
          <FiGrid className="w-5 h-5" />
          <span className="font-medium">Browse Resources</span>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
            <Link to="/bookings" className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1">
              <span>View all</span><FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentBookings.length === 0 ? (
            <p className="text-gray-400 text-sm">No bookings yet</p>
          ) : (
            <div className="space-y-3">
              {recentBookings.map(b => (
                <div key={b.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{b.resourceName}</p>
                    <p className="text-xs text-gray-500">{b.bookingDate} · {b.startTime} - {b.endTime}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(b.status)}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
            <Link to="/tickets" className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1">
              <span>View all</span><FiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {recentTickets.length === 0 ? (
            <p className="text-gray-400 text-sm">No tickets yet</p>
          ) : (
            <div className="space-y-3">
              {recentTickets.map(t => (
                <Link key={t.id} to={`/tickets/${t.id}`} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.title}</p>
                    <p className="text-xs text-gray-500">{t.category} · {t.priority}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(t.status)}`}>
                    {t.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
