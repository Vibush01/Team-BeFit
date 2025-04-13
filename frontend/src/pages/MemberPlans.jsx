import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const MemberPlans = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'member') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && user.role === 'member') {
      const fetchPlans = async () => {
        try {
          const workoutResponse = await axios.get(`http://localhost:5000/api/plans/workout/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const dietResponse = await axios.get(`http://localhost:5000/api/plans/diet/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setWorkoutPlans(workoutResponse.data);
          setDietPlans(dietResponse.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Error fetching plans');
        }
      };

      fetchPlans();
    }
  }, [user, token]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Plans</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Workout Plans */}
      <div className="w-full max-w-2xl mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Workout Plans</h2>
        {workoutPlans.length === 0 ? (
          <p className="text-gray-600">No workout plans found.</p>
        ) : (
          workoutPlans.map(plan => (
            <div key={plan._id} className="bg-white p-4 rounded-lg shadow-md mb-4">
              <p className="text-gray-800">Gym: {plan.gym?.name || 'Unknown'}</p>
              <p className="text-gray-600">Trainer: {plan.trainer?.name || 'Unknown'}</p>
              <p className="text-gray-600">Week: {new Date(plan.weekStart).toLocaleDateString()} - {new Date(plan.weekEnd).toLocaleDateString()}</p>
              <p className="text-gray-800 mt-2">{plan.planDetails}</p>
            </div>
          ))
        )}
      </div>

      {/* Diet Plans */}
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Diet Plans</h2>
        {dietPlans.length === 0 ? (
          <p className="text-gray-600">No diet plans found.</p>
        ) : (
          dietPlans.map(plan => (
            <div key={plan._id} className="bg-white p-4 rounded-lg shadow-md mb-4">
              <p className="text-gray-800">Gym: {plan.gym?.name || 'Unknown'}</p>
              <p className="text-gray-600">Trainer: {plan.trainer?.name || 'Unknown'}</p>
              <p className="text-gray-600">Week: {new Date(plan.weekStart).toLocaleDateString()} - {new Date(plan.weekEnd).toLocaleDateString()}</p>
              <p className="text-gray-800 mt-2">{plan.planDetails}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemberPlans;