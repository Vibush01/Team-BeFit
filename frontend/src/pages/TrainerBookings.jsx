import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TrainerBookings = () => {
    const { user, userDetails } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/schedule/my-bookings', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBookings(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch bookings');
            }
        };
        if (user?.role === 'trainer') {
            fetchBookings();
        }
    }, [user]);

    if (user?.role !== 'trainer') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Trainers.</p>
        </div>;
    }

    if (!userDetails?.gym) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">You must join a gym to view bookings.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Your Booked Sessions</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Bookings</h2>
                    {bookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Time Slot</th>
                                        <th className="p-2">Member</th>
                                        <th className="p-2">Gym</th>
                                        <th className="p-2">Booked On</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking._id} className="border-t">
                                            <td className="p-2">{new Date(booking.date).toLocaleDateString()}</td>
                                            <td className="p-2">{booking.timeSlot}</td>
                                            <td className="p-2">{booking.member.name} ({booking.member.email})</td>
                                            <td className="p-2">{booking.gym.gymName}</td>
                                            <td className="p-2">{new Date(booking.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-700 text-center">No bookings yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerBookings;