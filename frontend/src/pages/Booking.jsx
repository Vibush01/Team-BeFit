import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Booking = () => {
    const { user, userDetails } = useContext(AuthContext);
    const [schedules, setSchedules] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/schedule/available', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSchedules(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch schedules');
            }
        };
        if (user?.role === 'member') {
            fetchSchedules();
        }
    }, [user]);

    const handleBook = async (scheduleId) => {
        if (!window.confirm('Are you sure you want to book this session?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/api/schedule/book/${scheduleId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSchedules(schedules.filter((schedule) => schedule._id !== scheduleId));
            setSuccess('Session booked successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book session');
        }
    };

    if (user?.role !== 'member') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Members.</p>
        </div>;
    }

    if (!userDetails?.gym) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">You must join a gym to book sessions.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Book a Training Session</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Available Schedules</h2>
                    {schedules.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Time Slot</th>
                                        <th className="p-2">Trainer</th>
                                        <th className="p-2">Gym</th>
                                        <th className="p-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {schedules.map((schedule) => (
                                        <tr key={schedule._id} className="border-t">
                                            <td className="p-2">{new Date(schedule.date).toLocaleDateString()}</td>
                                            <td className="p-2">{schedule.timeSlot}</td>
                                            <td className="p-2">{schedule.trainer.name}</td>
                                            <td className="p-2">{schedule.gym.gymName}</td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => handleBook(schedule._id)}
                                                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                                                >
                                                    Book
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-700 text-center">No available schedules</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Booking;