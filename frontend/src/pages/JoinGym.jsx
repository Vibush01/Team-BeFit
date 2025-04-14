import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const JoinGym = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'member') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === 'member') {
      const fetchGyms = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/gyms', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setGyms(response.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Error fetching gyms');
        }
      };

      fetchGyms();
    }
  }, [user, token]);

  const handleJoin = async (gymId) => {
    try {
      const response = await axios.post('http://localhost:5000/api/requests', {
        gymId,
        type: 'join',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Join request sent successfully');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error sending join request');
      setSuccess('');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Join a Gym</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <div className="w-full max-w-2xl">
        {gyms.length === 0 ? (
          <p className="text-gray-600">No gyms found.</p>
        ) : (
          gyms.map(gym => (
            <div key={gym._id} className="bg-white p-4 rounded-lg shadow-md mb-4">
              <h2 className="text-lg font-semibold text-gray-800">{gym.name}</h2>
              <p className="text-gray-600">{gym.address}</p>
              <div className="mt-2">
                {gym.photos.map((photo, index) => (
                  <img
                    key={`${gym._id}-${index}-${photo}`}
                    src={photo}
                    alt={`Gym Photo ${index}`}
                    className="w-24 h-24 object-cover inline-block mr-2"
                  />
                ))}
              </div>
              <button
                onClick={() => handleJoin(gym._id)}
                className="mt-2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
              >
                Join Gym
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JoinGym;