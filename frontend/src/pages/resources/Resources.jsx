import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { resourceAPI } from '../../services/api';
import { FiPlus, FiSearch, FiFilter, FiMapPin, FiUsers } from 'react-icons/fi';

const Resources = () => {
  const { isAdmin } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const resourceTypes = ['LECTURE_HALL', 'LABORATORY', 'MEETING_ROOM', 'SPORTS_FACILITY', 'LIBRARY_ROOM', 'AUDITORIUM', 'EQUIPMENT', 'OTHER'];
  const statusOptions = ['ACTIVE', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE'];

  useEffect(() => {
    fetchResources();
  }, [filterType, filterStatus]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      let res;
      if (search) {
        res = await resourceAPI.search({ name: search, type: filterType || undefined, status: filterStatus || undefined });
      } else if (filterType && filterStatus) {
        res = await resourceAPI.search({ type: filterType, status: filterStatus });
      } else if (filterType) {
        res = await resourceAPI.search({ type: filterType });
      } else if (filterStatus) {
        res = await resourceAPI.search({ status: filterStatus });
      } else {
        res = await resourceAPI.getAll();
      }
      setResources(res.data.data || []);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const statusColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      UNDER_MAINTENANCE: 'bg-yellow-100 text-yellow-800',
      OUT_OF_SERVICE: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const typeIcon = (type) => {
    const icons = {
      LECTURE_HALL: '🏫', LABORATORY: '🔬', MEETING_ROOM: '🤝',
      SPORTS_FACILITY: '⚽', LIBRARY_ROOM: '📚', AUDITORIUM: '🎭',
      EQUIPMENT: '🔧', OTHER: '📦'
    };
    return icons[type] || '📦';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facilities & Assets</h1>
          <p className="text-gray-500 text-sm mt-1">Browse and manage campus resources</p>
        </div>
        {isAdmin() && (
          <Link to="/resources/create" className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <FiPlus className="w-4 h-4" />
            <span>Add Resource</span>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {resourceTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <FiFilter className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <p className="text-gray-400 text-lg">No resources found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(resource => (
            <Link key={resource.id} to={`/resources/${resource.id}`} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{typeIcon(resource.type)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{resource.name}</h3>
                      <p className="text-xs text-gray-500">{resource.type?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(resource.status)}`}>
                    {resource.status?.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{resource.description}</p>
                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  {resource.location && (
                    <span className="flex items-center space-x-1">
                      <FiMapPin className="w-3 h-3" /> <span>{resource.location}</span>
                    </span>
                  )}
                  {resource.capacity && (
                    <span className="flex items-center space-x-1">
                      <FiUsers className="w-3 h-3" /> <span>{resource.capacity}</span>
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;
