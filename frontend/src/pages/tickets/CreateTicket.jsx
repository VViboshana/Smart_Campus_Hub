import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ticketAPI, resourceAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiUpload, FiX } from 'react-icons/fi';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const [files, setFiles] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', category: 'MAINTENANCE',
    priority: 'MEDIUM', resourceId: '', location: '',
    contactEmail: '', contactPhone: ''
  });

  const categories = ['MAINTENANCE', 'ELECTRICAL', 'PLUMBING', 'HVAC', 'CLEANING', 'SECURITY', 'IT_SUPPORT', 'OTHER'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await resourceAPI.getAll();
        setResources(res.data.data || []);
      } catch { /* ignore */ }
    };
    fetchResources();
  }, []);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    if (files.length + selected.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    // Validate file types
    const valid = selected.filter(f => f.type.startsWith('image/'));
    if (valid.length !== selected.length) {
      toast.error('Only image files are allowed');
    }
    setFiles([...files, ...valid].slice(0, 3));
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();

      // Append ticket data fields
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      // Append images
      files.forEach(file => {
        formData.append('images', file);
      });

      await ticketAPI.create(formData);
      toast.success('Ticket created successfully');
      navigate('/tickets');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <Link to="/tickets" className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 mb-4">
        <FiArrowLeft /> <span>Back to Tickets</span>
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Report an Issue</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Brief summary of the issue" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea required value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows="4" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the issue..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                {categories.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Related Resource</label>
              <select value={form.resourceId} onChange={(e) => setForm({ ...form, resourceId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                <option value="">None</option>
                {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Where is the issue?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input type="email" value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input type="tel" value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (max 3 images)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {files.length < 3 && (
                <label className="flex items-center justify-center space-x-2 cursor-pointer text-gray-500 hover:text-blue-600">
                  <FiUpload />
                  <span>Click to upload images</span>
                  <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />
                </label>
              )}
              {files.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-3">
                  {files.map((file, i) => (
                    <div key={i} className="relative">
                      <img src={URL.createObjectURL(file)} alt="" className="w-20 h-20 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeFile(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button type="submit" disabled={loading}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50">
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
            <button type="button" onClick={() => navigate('/tickets')}
              className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;
