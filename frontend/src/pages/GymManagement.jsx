import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const GymManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    photos: [],
  });
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [editGymId, setEditGymId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

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
        } catch (err) {
          setError(err.response?.data?.message || 'Error fetching gyms');
        }
      };

      fetchGyms();
    }
  }, [user, token]);

  const handleChange = (e) => {
    if (e.target.name === 'photos') {
      setFormData({ ...formData, photos: Array.from(e.target.files) });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('address', formData.address);
    for (let i = 0; i < formData.photos.length; i++) {
      data.append('photos', formData.photos[i]);
    }

    try {
      if (editGymId) {
        const response = await axios.put(`http://localhost:5000/api/gyms/${editGymId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGyms(gyms.map(gym => (gym._id === editGymId ? response.data : gym)));
        setSuccess('Gym updated successfully');
      } else {
        const response = await axios.post('http://localhost:5000/api/gyms', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGyms([...gyms, response.data]);
        setSuccess('Gym created successfully');
      }
      setFormData({ name: '', address: '', photos: [] });
      setExistingPhotos([]);
      setEditGymId(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving gym');
      setSuccess('');
    }
  };

  const handleEdit = (gym) => {
    setFormData({ name: gym.name, address: gym.address, photos: [] });
    setExistingPhotos(gym.photos || []);
    setEditGymId(gym._id);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gym Management</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {/* Create/Edit Gym Form */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">{editGymId ? 'Edit Gym' : 'Create Gym'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          {editGymId && existingPhotos.length > 0 && (
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Existing Photos</label>
              <div className="flex flex-wrap gap-2">
                {existingPhotos.map((photo, index) => (
                  <img
                    key={`existing-${index}-${photo}`} // Ensure unique key using index and photo URL
                    src={photo}
                    alt={`Existing Photo ${index}`}
                    className="w-16 h-16 object-cover"
                  />
                ))}
              </div>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">{editGymId ? 'Add More Photos (up to 5)' : 'Photos (up to 5)'}</label>
            <input
              type="file"
              name="photos"
              onChange={handleChange}
              multiple
              accept="image/*"
              className="w-full p-2 border rounded-md"
              ref={fileInputRef}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
            {editGymId ? 'Update Gym' : 'Create Gym'}
          </button>
        </form>
      </div>

      {/* Gym List */}
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Gyms</h2>
        {gyms.length === 0 ? (
          <p className="text-gray-600">No gyms found.</p>
        ) : (
          gyms.map(gym => (
            <div key={gym._id} className="bg-white p-4 rounded-lg shadow-md mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{gym.name}</h3>
              <p className="text-gray-600">{gym.address}</p>
              <div className="mt-2">
                {gym.photos.map((photo, index) => (
                  <img
                    key={`${gym._id}-${index}-${photo}`} // Ensure unique key using gym ID, index, and photo URL
                    src={photo}
                    alt={`Gym Photo ${index}`}
                    className="w-24 h-24 object-cover inline-block mr-2"
                  />
                ))}
              </div>
              <button
                onClick={() => handleEdit(gym)}
                className="mt-2 bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600"
              >
                Edit
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GymManagement;