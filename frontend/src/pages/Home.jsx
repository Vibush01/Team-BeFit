import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [gyms, setGyms] = useState([]);
  const [formData, setFormData] = useState({ name: '', address: '', photos: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === 'gym_owner') {
      const fetchGyms = async () => {
        try {
          const token = localStorage.getItem('token');
          console.log('Home - Token:', token); // Add logging
          const response = await fetch('http://localhost:5000/api/gyms', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          if (response.ok) {
            console.log('Fetched gyms:', data);
            setGyms(data);
          } else {
            setError(data.message || 'Failed to fetch gyms');
          }
        } catch (err) {
          setError('Failed to fetch gyms');
        }
      };
      fetchGyms();
    }
  }, [role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateGym = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/gyms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setGyms([...gyms, data]);
        setFormData({ name: '', address: '', photos: [] });
      } else {
        setError(data.message || 'Failed to create gym');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-6">Welcome to BeFit</h1>
        {role === 'gym_owner' && (
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Gym Owner Dashboard</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {gyms.length === 0 ? (
              <div>
                <p className="text-gray-700 mb-4">You don’t have a gym yet. Create one now!</p>
                <form onSubmit={handleCreateGym}>
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
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-blue-400"
                  >
                    {loading ? 'Creating...' : 'Create Gym'}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 mb-4">Your Gym:</p>
                {gyms.map((gym) => (
                  <div key={gym._id} className="mb-4">
                    <p className="text-gray-700">{gym.name}</p>
                    <Link
                      to={`/gym/${gym._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View Gym Profile
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;