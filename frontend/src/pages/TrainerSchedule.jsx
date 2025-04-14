import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TrainerSchedule = () => {
    const { user, userDetails } = useContext(AuthContext);
    const [schedules, setSchedules] = useState([]);
    const [formData, setFormData] = useState({ date: '', timeSlot: '' });
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/schedule/my-schedules', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSchedules(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch schedules');
            }
        };
        if (user?.role === 'trainer') {
            fetchSchedules();
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editId) {
                // Update schedule
                const res = await axios.put(`http://localhost:5000/api/schedule/${editId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSchedules(schedules.map((schedule) => (schedule._id === editId ? res.data : schedule)));
                setSuccess('Schedule updated successfully');
                setEditId(null);
            } else {
                // Create schedule
                const res = await axios.post('http://localhost:5000/api/schedule', formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSchedules([res.data, ...schedules]);
                setSuccess('Schedule created successfully');
            }
            setFormData({ date: '', timeSlot: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save schedule');
        }
    };

    const handleEdit = (schedule) => {
        setEditId(schedule._id);
        setFormData({ date: schedule.date.split('T')[0], timeSlot: schedule.timeSlot });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/schedule/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSchedules(schedules.filter((schedule) => schedule._id !== id));
            setSuccess('Schedule deleted successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete schedule');
        }
    };

    if (user?.role !== 'trainer') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Trainers.</p>
        </div>;
    }

    if (!userDetails?.gym) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">You must join a gym to manage schedules.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Manage Schedules</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                {/* Form */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                    min={new Date().toISOString().split('T')[0]} // Prevent past dates
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700">Time Slot</label>
                                <input
                                    type="text"
                                    name="timeSlot"
                                    value={formData.timeSlot}
                                    onChange={handleChange}
                                    placeholder="e.g., 09:00-10:00"
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        >
                            {editId ? 'Update Schedule' : 'Add Schedule'}
                        </button>
                    </form>
                </div>

                {/* Schedule List */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Your Schedules</h2>
                    {schedules.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Time Slot</th>
                                        <th className="p-2">Gym</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.map((schedule) => (
                                        <tr key={schedule._id} className="border-t">
                                            <td className="p-2">{new Date(schedule.date).toLocaleDateString()}</td>
                                            <td className="p-2">{schedule.timeSlot}</td>
                                            <td className="p-2">{schedule.gym.gymName}</td>
                                            <td className="p-2">{schedule.isBooked ? 'Booked' : 'Available'}</td>
                                            <td className="p-2">
                                                {!schedule.isBooked && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(schedule)}
                                                            className="bg-yellow-600 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-700"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(schedule._id)}
                                                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-700 text-center">No schedules yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerSchedule;