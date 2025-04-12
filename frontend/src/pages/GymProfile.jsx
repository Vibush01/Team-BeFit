import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function GymProfile() {
  const { id } = useParams(); // Get gym ID from URL
  const navigate = useNavigate();
  const [gym, setGym] = useState(null);
  const [progress, setProgress] = useState(null);
  const [formData, setFormData] = useState({ name: '', address: '', photos: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Fetch gym details and progress
  useEffect(() => {
    const fetchGymDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('GymProfile - Token:', token); // Debug log

        if (!token) {
          throw new Error('No token found. Please log in again.');
        }

        // Fetch full gym details
        const gymResponse = await fetch(`http://localhost:5000/api/gyms/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const gymData = await gymResponse.json();
        if (!gymResponse.ok) {
          throw new Error(gymData.message || 'Failed to fetch gym details');
        }

        // Fetch gym progress
        const progressResponse = await fetch(`http://localhost:5000/api/gyms/${id}/progress`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const progressData = await progressResponse.json();
        if (!progressResponse.ok) {
          throw new Error(progressData.message || 'Failed to fetch gym progress');
        }

        setGym(gymData);
        setProgress(progressData);
        setFormData({
          name: gymData.name,
          address: gymData.address || '',
          photos: gymData.photos || [],
        });
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGymDetails();
  }, [id]);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Update gym details
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/gyms/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setGym({ ...gym, name: data.name, address: data.address, photos: data.photos });
        setProgress({ ...progress, gymName: data.name });
        setEditMode(false);
      } else {
        setError(data.message || 'Failed to update gym');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  // Remove a trainer
  const handleRemoveTrainer = async (trainerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/gyms/${id}/trainers/${trainerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setGym({
          ...gym,
          trainers: gym.trainers.filter((trainer) => trainer._id !== trainerId),
        });
        setProgress({
          ...progress,
          totalTrainers: progress.totalTrainers - 1,
        });
      } else {
        setError(data.message || 'Failed to remove trainer');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  // Remove a member
  const handleRemoveMember = async (memberId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/gyms/${id}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setGym({
          ...gym,
          members: gym.members.filter((member) => member._id !== memberId),
        });
        setProgress({
          ...progress,
          totalMembers: progress.totalMembers - 1,
          memberships: progress.memberships.filter((membership) => membership.member._id !== memberId),
        });
      } else {
        setError(data.message || 'Failed to remove member');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!gym || !progress) {
    return <div className="flex items-center justify-center min-h-screen">Gym not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Gym Profile: {gym.name}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {editMode ? (
          <form onSubmit={handleUpdate} className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Edit Gym Details</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="name">
                Gym Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="address">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-4">Gym Details</h2>
            <p className="text-gray-700">Name: {gym.name}</p>
            <p className="text-gray-700">Address: {gym.address || 'N/A'}</p>
            <p className="text-gray-700">Total Trainers: {progress.totalTrainers}</p>
            <p className="text-gray-700">Total Members: {progress.totalMembers}</p>
            <button
              onClick={() => setEditMode(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Edit Gym Details
            </button>
          </div>
        )}

        <h3 className="text-xl font-semibold mb-4">Trainers</h3>
        {gym.trainers && gym.trainers.length > 0 ? (
          <ul className="list-disc list-inside mb-6">
            {gym.trainers.map((trainer) => (
              <li key={trainer._id} className="text-gray-700 flex justify-between items-center">
                <span>
                  {trainer.name} ({trainer.email})
                </span>
                <button
                  onClick={() => handleRemoveTrainer(trainer._id)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mb-6">No trainers yet.</p>
        )}

        <h3 className="text-xl font-semibold mb-4">Members</h3>
        {gym.members && gym.members.length > 0 ? (
          <ul className="list-disc list-inside mb-6">
            {gym.members.map((member) => (
              <li key={member._id} className="text-gray-700 flex justify-between items-center">
                <span>
                  {member.name} ({member.email})
                </span>
                <button
                  onClick={() => handleRemoveMember(member._id)}
                  className="text-red-500 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 mb-6">No members yet.</p>
        )}

        <h3 className="text-xl font-semibold mb-4">Memberships</h3>
        {progress.memberships && progress.memberships.length > 0 ? (
          <div className="space-y-4">
            {progress.memberships.map((membership) => (
              <div key={membership.member._id} className="border p-4 rounded-lg">
                <p className="text-gray-700">
                  Member: {membership.member.name} ({membership.member.email})
                </p>
                <p className="text-gray-700">
                  Start Date: {new Date(membership.startDate).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  Expiry Date: {new Date(membership.expiryDate).toLocaleDateString()}
                </p>
                <p className="text-gray-700">
                  Status: {membership.isActive ? 'Active' : 'Expired'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No memberships yet.</p>
        )}
      </div>
    </div>
  );
}

export default GymProfile;