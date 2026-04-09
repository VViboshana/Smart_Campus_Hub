import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiXCircle } from 'react-icons/fi';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.getMyBookings();
      setBookings(res.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingAPI.cancel(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancel failed');
    }
  };

  const statusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredBookings = filterStatus ? bookings.filter(b => b.status === filterStatus) : bookings;

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your resource bookings</p>
        </div>
        <Link to="/bookings/create" className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <FiPlus className="w-4 h-4" /> <span>New Booking</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-4">
        {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-400">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{booking.resourceName}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{booking.bookingDate}</span>
                    <span>{booking.startTime} - {booking.endTime}</span>
                    {booking.expectedAttendees && <span>{booking.expectedAttendees} attendees</span>}
                  </div>
                  {booking.purpose && <p className="text-sm text-gray-600 mt-2">{booking.purpose}</p>}
                  {booking.adminRemarks && (
                    <p className="text-sm text-gray-500 mt-2 italic">Admin: {booking.adminRemarks}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  {booking.status === 'PENDING' && (
                    <button onClick={() => handleCancel(booking.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Cancel">
                      <FiXCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
