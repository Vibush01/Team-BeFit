import { useAuth } from '../context/AuthContext.jsx'; // Update the extension
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

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
          {/* Add more owner-specific features later */}
        </div>
      )}
      {user.role === 'gym_owner' && (
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Gym Owner Dashboard</h2>
          <p>Manage your gyms and memberships.</p>
          {/* Add more gym owner-specific features later */}
        </div>
      )}
      {user.role === 'trainer' && (
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Trainer Dashboard</h2>
          <p>Manage workout and diet plans for members.</p>
          {/* Add more trainer-specific features later */}
        </div>
      )}
      {user.role === 'member' && (
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Member Dashboard</h2>
          <p>View your plans and track progress.</p>
          {/* Add more member-specific features later */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;