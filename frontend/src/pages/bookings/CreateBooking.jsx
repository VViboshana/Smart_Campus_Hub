import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { resourceAPI, bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';

const CreateBooking = () => {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    resourceId: resourceId || '',
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: ''
  });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await resourceAPI.getAll();
        const active = (res.data.data || []).filter(r => r.status === 'ACTIVE');
        setResources(active);
      } catch (err) {
        toast.error('Failed to load resources');
      }
    };
    fetchResources();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.startTime >= form.endTime) {
      toast.error('End time must be after start time');
      return;
    }
    setLoading(true);
    try {
      const data = {
        ...form,
        expectedAttendees: parseInt(form.expectedAttendees) || 0
      };
      await bookingAPI.create(data);
      toast.success('Booking created! Awaiting admin approval.');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link to="/bookings" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 mb-4">
        <FiArrowLeft /> <span>Back to Bookings</span>
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Booking</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource *</label>
            <select required value={form.resourceId} onChange={(e) => setForm({ ...form, resourceId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
              <option value="">Select a resource...</option>
              {resources.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.type?.replace(/_/g, ' ')} - Cap: {r.capacity})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input type="date" required min={today} value={form.bookingDate}
              onChange={(e) => setForm({ ...form, bookingDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
              <input type="time" required value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
              <input type="time" required value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
            <textarea value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Reason for booking..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Attendees</label>
            <input type="number" min="0" value={form.expectedAttendees}
              onChange={(e) => setForm({ ...form, expectedAttendees: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Number of attendees" />
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Booking'}
            </button>
            <button type="button" onClick={() => navigate('/bookings')}
              className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBooking;
