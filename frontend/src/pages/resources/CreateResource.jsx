import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { resourceAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft } from 'react-icons/fi';

const CreateResource = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', type: 'LECTURE_HALL', capacity: '',
    location: '', building: '', floor: '', status: 'ACTIVE',
    amenities: '', imageUrl: ''
  });

  const resourceTypes = ['LECTURE_HALL', 'LABORATORY', 'MEETING_ROOM', 'SPORTS_FACILITY', 'LIBRARY_ROOM', 'AUDITORIUM', 'EQUIPMENT', 'OTHER'];
  const statusOptions = ['ACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...form,
        capacity: parseInt(form.capacity) || 0,
        amenities: form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : []
      };
      await resourceAPI.create(data);
      toast.success('Resource created successfully');
      navigate('/resources');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/resources" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 mb-4">
        <FiArrowLeft /> <span>Back to Resources</span>
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Resource</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Main Lecture Hall A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                {resourceTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the resource..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input type="number" min="0" value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Block A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
              <input type="text" value={form.building}
                onChange={(e) => setForm({ ...form, building: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Engineering Building" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
              <input type="text" value={form.floor}
                onChange={(e) => setForm({ ...form, floor: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 2nd Floor" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input type="url" value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="https://..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
              <input type="text" value={form.amenities}
                onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Comma-separated: Projector, Whiteboard, AC, Wi-Fi" />
              <p className="text-xs text-gray-400 mt-1">Separate amenities with commas</p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Resource'}
            </button>
            <button type="button" onClick={() => navigate('/resources')}
              className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateResource;
