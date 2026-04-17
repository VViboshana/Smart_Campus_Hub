import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resourceAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiTrash2, FiCalendar, FiMapPin, FiUsers, FiArrowLeft, FiClock } from 'react-icons/fi';

const ResourceDetail = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      const res = await resourceAPI.getById(id);
      setResource(res.data.data);
      setForm(res.data.data);
    } catch (err) {
      toast.error('Resource not found');
      navigate('/resources');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        name: form.name,
        description: form.description,
        type: form.type,
        capacity: form.capacity,
        location: form.location,
        building: form.building,
        floor: form.floor,
        status: form.status,
        amenities: form.amenities,
        imageUrl: form.imageUrl
      };
      await resourceAPI.update(id, updateData);
      toast.success('Resource updated successfully');
      setEditing(false);
      fetchResource();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await resourceAPI.delete(id);
      toast.success('Resource deleted');
      navigate('/resources');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const statusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      UNDER_MAINTENANCE: 'bg-yellow-100 text-yellow-800',
      OUT_OF_SERVICE: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const resourceTypes = ['LECTURE_HALL', 'LABORATORY', 'MEETING_ROOM', 'SPORTS_FACILITY', 'LIBRARY_ROOM', 'AUDITORIUM', 'EQUIPMENT', 'OTHER'];
  const statusOptions = ['ACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'];

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!resource) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/resources" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 mb-4">
        <FiArrowLeft /> <span>Back to Resources</span>
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6">
        {!editing ? (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{resource.name}</h1>
                <p className="text-gray-500 mt-1">{resource.type?.replace(/_/g, ' ')}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusColor(resource.status)}`}>
                  {resource.status?.replace(/_/g, ' ')}
                </span>
                {isAdmin() && (
                  <>
                    <button onClick={() => setEditing(true)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                      <FiEdit2 />
                    </button>
                    <button onClick={handleDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                      <FiTrash2 />
                    </button>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-700 mt-4">{resource.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {resource.location && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiMapPin className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-400">Location</p>
                    <p className="text-sm font-medium">{resource.location}</p>
                  </div>
                </div>
              )}
              {resource.building && (
                <div>
                  <p className="text-xs text-gray-400">Building</p>
                  <p className="text-sm font-medium text-gray-900">{resource.building}</p>
                </div>
              )}
              {resource.floor && (
                <div>
                  <p className="text-xs text-gray-400">Floor</p>
                  <p className="text-sm font-medium text-gray-900">{resource.floor}</p>
                </div>
              )}
              {resource.capacity && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <FiUsers className="text-green-500" />
                  <div>
                    <p className="text-xs text-gray-400">Capacity</p>
                    <p className="text-sm font-medium">{resource.capacity}</p>
                  </div>
                </div>
              )}
            </div>

            {resource.amenities?.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-2">
                  {resource.amenities.map((a, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}

            {resource.availabilityWindows?.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-2">Availability Schedule</p>
                <div className="space-y-1">
                  {resource.availabilityWindows.map((w, i) => (
                    <div key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                      <FiClock className="w-3 h-3" />
                      <span>{w.dayOfWeek}: {w.startTime} - {w.endTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {resource.status === 'ACTIVE' && (
              <Link
                to={`/bookings/create/${resource.id}`}
                className="mt-6 inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FiCalendar /> <span>Book This Resource</span>
              </Link>
            )}
          </>
        ) : (
          <form onSubmit={handleUpdate} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Edit Resource</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.type || ''} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  {resourceTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="3" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input type="number" value={form.capacity || ''} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Building</label>
                <input type="text" value={form.building || ''} onChange={(e) => setForm({ ...form, building: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                <input type="text" value={form.floor || ''} onChange={(e) => setForm({ ...form, floor: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status || ''} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                  {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Save Changes</button>
              <button type="button" onClick={() => { setEditing(false); setForm(resource); }} className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResourceDetail;
