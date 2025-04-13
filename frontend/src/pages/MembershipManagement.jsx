import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const MembershipManagement = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [gyms, setGyms] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [formData, setFormData] = useState({
    memberId: '',
    gymId: '',
    startDate: '',
    expiryDate: '',
  });
  const [editMembershipId, setEditMembershipId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user || !['gym_owner', 'trainer'].includes(user.role)) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user && ['gym_owner', 'trainer'].includes(user.role)) {
      const fetchGyms = async () => {
        try {
          let endpoint = '/my-gyms';
          if (user.role === 'trainer') {
            const response = await axios.get('http://localhost:5000/api/gyms', {
              headers: { Authorization: `Bearer ${token}` },
            });
            const trainerGyms = response.data.filter(gym => gym.trainers.some(trainerId => trainerId.toString() === user.id));
            setGyms(trainerGyms);
          } else {
            const response = await axios.get(`http://localhost:5000/api/gyms${endpoint}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setGyms(response.data);
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Error fetching gyms');
        }
      };

      const fetchMemberships = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/memberships', {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Memberships data:', response.data);
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

  const handleAddMember = async (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    try {
      const response = await axios.post('http://localhost:5000/api/memberships', {
        member: formData.memberId,
        gym: formData.gymId,
        startDate: formData.startDate,
        expiryDate: formData.expiryDate,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemberships([...memberships, response.data]);
      setSuccess('Member added successfully');
      setError('');
      setFormData({ memberId: '', gymId: '', startDate: '', expiryDate: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding member');
      setSuccess('');
    }
  };

  const handleEditMembership = (membership) => {
    setFormData({
      memberId: membership.member?._id || '',
      gymId: membership.gym?._id || '',
      startDate: membership.startDate ? membership.startDate.split('T')[0] : '',
      expiryDate: membership.expiryDate ? membership.expiryDate.split('T')[0] : '',
    });
    setEditMembershipId(membership._id);
  };

  const handleUpdateMembership = async (e) => {
    e.preventDefault();
    if (!editMembershipId) {
      setError('No membership selected for update');
      return;
    }
    console.log('Updating membership ID:', editMembershipId, 'with data:', formData);
    try {
      const response = await axios.put(`http://localhost:5000/api/memberships/${editMembershipId}`, {
        startDate: formData.startDate,
        expiryDate: formData.expiryDate,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemberships(memberships.map(m => (m._id === editMembershipId ? response.data : m)));
      const membershipsResponse = await axios.get('http://localhost:5000/api/memberships', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemberships(membershipsResponse.data);
      setSuccess('Membership updated successfully');
      setError('');
      setFormData({ memberId: '', gymId: '', startDate: '', expiryDate: '' });
      setEditMembershipId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating membership');
      setSuccess('');
    }
  };

  const handleRemoveMember = async (membershipId) => {
    try {
      console.log('Removing membership with ID:', membershipId);
      await axios.delete(`http://localhost:5000/api/memberships/${membershipId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const response = await axios.get('http://localhost:5000/api/memberships', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMemberships(response.data);
      setSuccess('Member removed successfully');
      setError('');
    } catch (err) {
      console.error('Remove member error:', err.response);
      setError(err.response?.data?.message || 'Error removing member');
      setSuccess('');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Membership Management</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {/* Add/Edit Member Form */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {editMembershipId ? 'Update Membership' : 'Add Member to Gym'}
        </h2>
        <form onSubmit={editMembershipId ? handleUpdateMembership : handleAddMember}>
          {!editMembershipId && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Member ID</label>
                <input
                  type="text"
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
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
            </>
          )}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Expiry Date</label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
            {editMembershipId ? 'Update Membership' : 'Add Member'}
          </button>
        </form>
      </div>

      {/* Membership List */}
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Memberships</h2>
        {memberships.length === 0 ? (
          <p className="text-gray-600">No memberships found.</p>
        ) : (
          memberships.map(membership => (
            <div key={membership._id} className="bg-white p-4 rounded-lg shadow-md mb-4">
              <p className="text-gray-800">Member: {membership.member?.name || 'Unknown'}</p>
              <p className="text-gray-600">Gym: {membership.gym?.name || 'Unknown'}</p>
              <p className="text-gray-600">Start: {new Date(membership.startDate).toLocaleDateString()}</p>
              <p className="text-gray-600">Expiry: {new Date(membership.expiryDate).toLocaleDateString()}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleEditMembership(membership)}
                  className="bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRemoveMember(membership._id)}
                  className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                >
                  Remove Member
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MembershipManagement;