import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TYPE_EMOJI = {
  LECTURE_HALL: '🏫',
  LAB: '🔬',
  MEETING_ROOM: '🤝',
  PROJECTOR: '📽',
  CAMERA: '📷',
  EQUIPMENT: '🔧',
};

const SmartBookingAssistant = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [capacity, setCapacity] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/recommendations/resources', {
        params: {
          userId: user.id,
          requiredCapacity: capacity,
          date,
          startTime,
          endTime,
        },
      });

      setResults(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch recommendations');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookResource = (resourceId) => {
    navigate('/bookings/create/' + resourceId);
    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 left-6 z-50 bg-purple-600 text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center text-2xl cursor-pointer"
        title="Smart Resource Finder"
      >
        🎯
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">🎯 Smart Resource Finder</h2>
              <button className="text-gray-500 hover:text-gray-700 text-lg" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <label className="block text-sm font-medium text-gray-700">Required Capacity</label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="border rounded-lg px-3 py-2 w-full mt-1 mb-3"
            />

            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full mt-1 mb-3"
            />

            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full mt-1 mb-3"
            />

            <label className="block text-sm font-medium text-gray-700">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full mt-1 mb-3"
            />

            <button
              onClick={fetchRecommendations}
              disabled={loading || !user?.id}
              className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              Find Best Resources 🔍
            </button>

            {loading && (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            )}

            {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

            <div className="mt-4 space-y-3">
              {results.map((item) => (
                <div key={item.resourceId} className="border border-gray-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">{item.resourceName}</h3>
                    <span className="text-xl">{TYPE_EMOJI[item.resourceType] || '📌'}</span>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    {item.location || 'N/A'} • Capacity: {item.capacity}
                  </p>

                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 rounded-full h-2" style={{ width: item.score + '%' }}></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Score: {item.score}</p>
                  </div>

                  <p className="text-xs italic text-gray-500 mt-2">{item.reason || 'No reason available'}</p>

                  <button
                    onClick={() => handleBookResource(item.resourceId)}
                    className="mt-3 text-sm text-purple-700 font-medium hover:text-purple-900"
                  >
                    Book This →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartBookingAssistant;
