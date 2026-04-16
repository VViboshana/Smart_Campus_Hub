import { useState, useEffect } from 'react';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiCheck, FiX } from 'react-icons/fi';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [reviewModal, setReviewModal] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    try {
      const res = await bookingAPI.getAll();
      setBookings(res.data.data || []);
    } catch (err) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      await bookingAPI.review(id, { status, remarks });
      toast.success(`Booking ${status.toLowerCase()}`);
      setReviewModal(null);
      setRemarks('');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Review failed');
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

  const filtered = filterStatus ? bookings.filter(b => b.status === filterStatus) : bookings;

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Booking Management</h1>
      <p className="text-gray-500 text-sm mb-6">Approve or reject booking requests</p>

      <div className="flex space-x-2 mb-4">
        {['', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === s ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border'}`}>
            {s || 'All'} {s === 'PENDING' && `(${bookings.filter(b => b.status === 'PENDING').length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-400">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(booking => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{booking.resourceName}</h3>
                  <p className="text-sm text-gray-500 mt-1">Requested by: {booking.userName}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{booking.bookingDate}</span>
                    <span>{booking.startTime} - {booking.endTime}</span>
                    {booking.expectedAttendees > 0 && <span>{booking.expectedAttendees} attendees</span>}
                  </div>
                  {booking.purpose && <p className="text-sm text-gray-600 mt-2">{booking.purpose}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                  {booking.status === 'PENDING' && (
                    <div className="flex space-x-1">
                      <button onClick={() => { setReviewModal({ id: booking.id, action: 'APPROVED' }); setRemarks(''); }}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Approve">
                        <FiCheck className="w-5 h-5" />
                      </button>
                      <button onClick={() => { setReviewModal({ id: booking.id, action: 'REJECTED' }); setRemarks(''); }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Reject">
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900">
              {reviewModal.action === 'APPROVED' ? 'Approve Booking' : 'Reject Booking'}
            </h2>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (optional)</label>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Add a note..." />
            </div>
            <div className="flex space-x-3 mt-4">
              <button onClick={() => handleReview(reviewModal.id, reviewModal.action)}
                className={`flex-1 py-2 rounded-lg text-white font-medium ${reviewModal.action === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {reviewModal.action === 'APPROVED' ? 'Approve' : 'Reject'}
              </button>
              <button onClick={() => setReviewModal(null)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
