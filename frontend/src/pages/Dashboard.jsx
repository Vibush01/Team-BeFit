import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome to Your Dashboard, {user.name}!</h1>
      <p className="text-lg text-gray-600 mb-4">Role: {user.role}</p>
      <Link to="/profile" className="mb-4 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
        View/Edit Profile
      </Link>
      {user.role === 'owner' && (
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Owner Dashboard</h2>
          <p>Manage all gyms and users.</p>
        </div>
      )}
      {user.role === 'gym_owner' && (
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Gym Owner Dashboard</h2>
          <Link to="/gym-management" className="block mb-2 text-blue-600 hover:underline">Manage Gyms</Link>
          <Link to="/membership-management" className="block text-blue-600 hover:underline">Manage Memberships</Link>
        </div>
      )}
      {user.role === 'trainer' && (
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Trainer Dashboard</h2>
          <Link to="/membership-management" className="block mb-2 text-blue-600 hover:underline">Manage Members</Link>
          <Link to="/trainer-plan-management" className="block text-blue-600 hover:underline">Manage Plans</Link>
        </div>
      )}
      {user.role === 'member' && (
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Member Dashboard</h2>
          <Link to="/member-plans" className="block text-blue-600 hover:underline">View Plans</Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;