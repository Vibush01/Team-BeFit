import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const TrainerPlanManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [formData, setFormData] = useState({
    memberId: '',
    gymId: '',
    planDetails: '',
    weekStart: '',
    weekEnd: '',
    type: 'workout', // workout or diet
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'trainer') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === 'trainer') {
      const fetchGyms = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/gyms', {
            headers: { Authorization: `Bearer ${token}` },
          });
          const trainerGyms = response.data.filter(gym => gym.trainers.some(trainerId => trainerId.toString() === user.id));
          setGyms(trainerGyms);
        } catch (err) {
          setError(err.response?.data?.message || 'Error fetching gyms');
        }
      };

      const fetchMemberships = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/memberships', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMemberships(response.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Error fetching memberships');
        }
      };

      fetchGyms();
      fetchMemberships();
    }
  }, [user, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = formData.type === 'workout' ? '/workout' : '/diet';
      const response = await axios.post(`http://localhost:5000/api/plans${endpoint}`, {
        member: formData.memberId,
        gym: formData.gymId,
        planDetails: formData.planDetails,
        weekStart: formData.weekStart,
        weekEnd: formData.weekEnd,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(`${formData.type === 'workout' ? 'Workout' : 'Diet'} plan created successfully`);
      setError('');
      setFormData({ memberId: '', gymId: '', planDetails: '', weekStart: '', weekEnd: '', type: 'workout' });
    } catch (err) {
      setError(err.response?.data?.message || `Error creating ${formData.type} plan`);
      setSuccess('');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Plan Management</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {/* Create Plan Form */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Create Plan</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Plan Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="workout">Workout Plan</option>
              <option value="diet">Diet Plan</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Gym</label>
            <select
              name="gymId"
              value={formData.gymId}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select a gym</option>
              {gyms.map(gym => (
                <option key={gym._id} value={gym._id}>{gym.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Member</label>
            <select
              name="memberId"
              value={formData.memberId}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select a member</option>
              {memberships
                .filter(m => m.gym?._id === formData.gymId)
                .map(m => (
                  <option key={m.member?._id} value={m.member?._id}>{m.member?.name || 'Unknown'}</option>
                ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Plan Details</label>
            <textarea
              name="planDetails"
              value={formData.planDetails}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              rows="4"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Week Start</label>
            <input
              type="date"
              name="weekStart"
              value={formData.weekStart}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Week End</label>
            <input
              type="date"
              name="weekEnd"
              value={formData.weekEnd}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
            Create Plan
          </button>
        </form>
      </div>
    </div>
  );
};

export default TrainerPlanManagement;