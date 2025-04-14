import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import GymFormModal from '../components/GymFormModal';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [gyms, setGyms] = useState([]);
    const [selectedGym, setSelectedGym] = useState(null);
    const [users, setUsers] = useState({ members: [], trainers: [] });
    const [modalOpen, setModalOpen] = useState(false);
    const [editGym, setEditGym] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchGyms = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/admin/gyms', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGyms(res.data);
            } catch (err) {
                setError('Failed to fetch gyms');
            }
        };
        fetchGyms();
    }, []);

    const handleCreateGym = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/admin/gyms', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGyms([res.data.gym, ...gyms]);
            setSuccess('Gym created successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create gym');
        }
    };

    const handleUpdateGym = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`http://localhost:5000/api/admin/gyms/${editGym._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGyms(gyms.map((gym) => (gym._id === editGym._id ? res.data.gym : gym)));
            setSuccess('Gym updated successfully');
            setEditGym(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update gym');
        }
    };

    const handleDeleteGym = async (id) => {
        if (!window.confirm('Are you sure you want to delete this gym?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/admin/gyms/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGyms(gyms.filter((gym) => gym._id !== id));
            if (selectedGym?._id === id) {
                setSelectedGym(null);
                setUsers({ members: [], trainers: [] });
            }
            setSuccess('Gym deleted successfully');
        } catch (err) {
            setError('Failed to delete gym');
        }
    };

    const handleViewUsers = async (gym) => {
        try {
            setSelectedGym(gym);
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/admin/gyms/${gym._id}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data);
        } catch (err) {
            setError('Failed to fetch users');
        }
    };

    if (user?.role !== 'admin') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Admins.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                {/* Gym List */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Gyms</h2>
                        <button
                            onClick={() => {
                                setEditGym(null);
                                setModalOpen(true);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Create Gym
                        </button>
                    </div>
                    {gyms.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2">Gym Name</th>
                                        <th className="p-2">Address</th>
                                        <th className="p-2">Owner Name</th>
                                        <th className="p-2">Owner Email</th>
                                        <th className="p-2">Email</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gyms.map((gym) => (
                                        <tr key={gym._id} className="border-t">
                                            <td className="p-2">{gym.gymName}</td>
                                            <td className="p-2">{gym.address}</td>
                                            <td className="p-2">{gym.ownerName}</td>
                                            <td className="p-2">{gym.ownerEmail}</td>
                                            <td className="p-2">{gym.email}</td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => {
                                                        setEditGym(gym);
                                                        setModalOpen(true);
                                                    }}
                                                    className="bg-yellow-600 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGym(gym._id)}
                                                    className="bg-red-600 text-white px-3 py-1 rounded mr-2 hover:bg-red-700"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => handleViewUsers(gym)}
                                                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                                >
                                                    View Users
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-700 text-center">No gyms found</p>
                    )}
                </div>

                {/* Gym Users */}
                {selectedGym && (
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Users in {selectedGym.gymName}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-bold mb-2">Members</h3>
                                {users.members.length > 0 ? (
                                    <ul className="list-disc pl-5">
                                        {users.members.map((member) => (
                                            <li key={member._id} className="text-gray-700">
                                                {member.name} ({member.email})
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-700">No members in this gym</p>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-2">Trainers</h3>
                                {users.trainers.length > 0 ? (
                                    <ul className="list-disc pl-5">
                                        {users.trainers.map((trainer) => (
                                            <li key={trainer._id} className="text-gray-700">
                                                {trainer.name} ({trainer.email})
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-700">No trainers in this gym</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal for Create/Update Gym */}
                <GymFormModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    gym={editGym}
                    onSubmit={editGym ? handleUpdateGym : handleCreateGym}
                />
            </div>
        </div>
    );
};

export default AdminDashboard;