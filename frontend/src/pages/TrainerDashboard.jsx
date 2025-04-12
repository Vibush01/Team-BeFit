import { useState, useEffect } from 'react';

function TrainerDashboard() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    member: '',
    gym: '',
    plan: '',
    startDate: '',
    endDate: '',
    type: 'workout', // Default to workout plan
  });

  // Fetch gyms where the trainer is assigned
  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        console.log('TrainerDashboard - User ID:', userId); // Debug log

        if (!token || !userId) {
          throw new Error('Not authenticated. Please log in again.');
        }

        const response = await fetch('http://localhost:5000/api/gyms/all', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          // Filter gyms where the trainer is assigned
          const trainerGyms = data.filter((gym) =>
            gym.trainers.some((trainer) => trainer._id === userId)
          );
          setGyms(trainerGyms);
        } else {
          setError(data.message || 'Failed to fetch gyms');
        }
      } catch (err) {
        setError(err.message || 'Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGyms();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const endpoint = formData.type === 'workout' ? '/api/plans/workout' : '/api/plans/diet';
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`${formData.type === 'workout' ? 'Workout' : 'Diet'} plan assigned successfully!`);
        setFormData({ member: '', gym: '', plan: '', startDate: '', endDate: '', type: 'workout' });
      } else {
        setError(data.message || 'Failed to assign plan');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Trainer Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-semibold mb-4">Assign Workout/Diet Plan</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="gym">
              Gym
            </label>
            <select
              name="gym"
              value={formData.gym}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              <option value="">Select Gym</option>
              {gyms.map((gym) => (
                <option key={gym._id} value={gym._id}>
                  {gym.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="member">
              Member
            </label>
            <select
              name="member"
              value={formData.member}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              <option value="">Select Member</option>
              {formData.gym &&
                gyms
                  .find((gym) => gym._id === formData.gym)
                  ?.members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="type">
              Plan Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            >
              <option value="workout">Workout Plan</option>
              <option value="diet">Diet Plan</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="plan">
              Plan Details
            </label>
            <textarea
              name="plan"
              value={formData.plan}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="startDate">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="endDate">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Assign Plan
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Your Gyms</h2>
        {gyms.length > 0 ? (
          <div className="space-y-6">
            {gyms.map((gym) => (
              <div key={gym._id} className="border p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-600">{gym.name}</h3>
                <p className="text-gray-700">Address: {gym.address}</p>
                <p className="text-gray-700">Total Trainers: {gym.trainers.length}</p>
                <p className="text-gray-700">Total Members: {gym.members.length}</p>
                <h4 className="text-lg font-semibold mt-4">Members:</h4>
                {gym.members.length > 0 ? (
                  <ul className="list-disc list-inside ml-4">
                    {gym.members.map((member) => (
                      <li key={member._id} className="text-gray-700">
                        {member.name} ({member.email})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No members yet.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You are not assigned to any gyms yet.</p>
        )}
      </div>
    </div>
  );
}

export default TrainerDashboard;