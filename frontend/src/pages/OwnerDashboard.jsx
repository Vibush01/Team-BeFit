import { useState, useEffect } from 'react';

function OwnerDashboard() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/gyms', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setGyms(data);
        } else {
          setError(data.message || 'Failed to fetch gyms');
        }
      } catch (err) {
        setError('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchGyms();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Owner Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Gym Statistics</h2>
        <p className="text-lg mb-2">Total Gyms: {gyms.length}</p>
        {gyms.length > 0 ? (
          <div className="space-y-6">
            {gyms.map((gym) => (
              <div key={gym._id} className="border p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-600">{gym.name}</h3>
                <p className="text-gray-700">Address: {gym.address}</p>
                <p className="text-gray-700">Owner: {gym.owner.name} ({gym.owner.email})</p>
                <p className="text-gray-700">Total Trainers: {gym.trainers.length}</p>
                <p className="text-gray-700">Total Members: {gym.members.length}</p>
                <h4 className="text-lg font-semibold mt-4">Trainers:</h4>
                {gym.trainers.length > 0 ? (
                  <ul className="list-disc list-inside ml-4">
                    {gym.trainers.map((trainer) => (
                      <li key={trainer._id} className="text-gray-700">
                        {trainer.name} ({trainer.email})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No trainers yet.</p>
                )}
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
          <p className="text-gray-500">No gyms found.</p>
        )}
      </div>
    </div>
  );
}

export default OwnerDashboard;