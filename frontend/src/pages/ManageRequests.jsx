import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const ManageRequests = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);
  const [selectedGymId, setSelectedGymId] = useState('');
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'gym_owner') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === 'gym_owner') {
      const fetchGyms = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/gyms/my-gyms', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setGyms(response.data);
          if (response.data.length > 0) {
            setSelectedGymId(response.data[0]._id); // Default to first gym
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Error fetching gyms');
        }
      };

      fetchGyms();
    }
  }, [user, token]);

  useEffect(() => {
    if (selectedGymId) {
      const fetchRequests = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/requests/gym/${selectedGymId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setRequests(response.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Error fetching requests');
        }
      };

      fetchRequests();
    }
  }, [selectedGymId, token]);

  const handleApprove = async (requestId) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/requests/approve/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(requests.map(r => (r._id === requestId ? response.data.request : r)));
      setSuccess('Request approved');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error approving request');
      setSuccess('');
    }
  };

  const handleDeny = async (requestId) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/requests/deny/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(requests.map(r => (r._id === requestId ? response.data.request : r)));
      setSuccess('Request denied');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error denying request');
      setSuccess('');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Requests</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <div className="w-full max-w-md mb-6">
        <label className="block text-gray-700 mb-2">Select Gym</label>
        <select
          value={selectedGymId}
          onChange={(e) => setSelectedGymId(e.target.value)}
          className="w-full p-2 border rounded-md"
        >
          {gyms.map(gym => (
            <option key={gym._id} value={gym._id}>{gym.name}</option>
          ))}
        </select>
      </div>

      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-600">No requests found.</p>
        ) : (
          requests.map(request => (
            <div key={request._id} className="bg-white p-4 rounded-lg shadow-md mb-4">
              <p className="text-gray-800">Requester: {request.requester?.name || 'Unknown'}</p>
              <p className="text-gray-600">Type: {request.type === 'join' ? 'Join Request' : 'Apply Request'}</p>
              <p className="text-gray-600">Status: {request.status}</p>
              {request.status === 'pending' && (
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handleApprove(request._id)}
                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDeny(request._id)}
                    className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                  >
                    Deny
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageRequests;