import { useEffect, useState } from 'react';
import api from '../services/api';

const TYPE_EMOJI = {
  LECTURE_HALL: '🏫',
  LAB: '🔬',
  MEETING_ROOM: '🤝',
  PROJECTOR: '📽',
  CAMERA: '📷',
  EQUIPMENT: '🔧',
};

const ResourceHeatmap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHeatmap = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/heatmap/resources', { params: { date: selectedDate } });
        setHeatmapData(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load heatmap data');
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmap();
  }, [selectedDate]);

  const groupedByBuilding = heatmapData.reduce((acc, resource) => {
    const key = resource.building || 'Other';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(resource);
    return acc;
  }, {});

  const getCardBackground = (resource) => {
    if (resource.status === 'OUT_OF_SERVICE') return 'bg-gray-400';
    if (resource.bookingDensity <= 0.3) return 'bg-green-400';
    if (resource.bookingDensity <= 0.6) return 'bg-yellow-400';
    if (resource.bookingDensity <= 0.8) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900">🗺️ Campus Resource Heatmap</h1>
      <p className="text-gray-600 mt-1">Live booking density for campus resources</p>

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Select Date:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2"
        />
      </div>

      <div className="flex flex-wrap gap-4 mt-4 mb-6 text-sm">
        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-green-400 rounded"></span><span>Low (0-30%)</span></div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-yellow-400 rounded"></span><span>Medium (30-60%)</span></div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-orange-400 rounded"></span><span>High (60-80%)</span></div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-red-500 rounded"></span><span>Full (80-100%)</span></div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 bg-gray-400 rounded"></span><span>Out of Service</span></div>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && <p className="text-red-600 font-medium mb-4">{error}</p>}

      {!loading && !error && Object.entries(groupedByBuilding).map(([building, resources]) => (
        <div key={building}>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">{building}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {resources.map((resource) => {
              const bgClass = getCardBackground(resource);
              const densityPercent = Math.round((resource.bookingDensity || 0) * 100);

              return (
                <div
                  key={resource.resourceId}
                  className={bgClass + ' rounded-xl p-4 text-white shadow-md cursor-default transition-transform hover:scale-105'}
                >
                  <div className="text-2xl mb-2">{TYPE_EMOJI[resource.type] || '📌'}</div>
                  <h3 className="font-bold text-lg leading-tight">{resource.name}</h3>
                  <p className="text-sm opacity-90 mt-1">{resource.building || 'Other'} • {resource.location || 'N/A'}</p>
                  <p className="text-sm opacity-90">Capacity: {resource.capacity}</p>
                  <p className="text-sm font-semibold mt-2">
                    {resource.status === 'OUT_OF_SERVICE' ? 'Out of Service' : `${densityPercent}% booked`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResourceHeatmap;
