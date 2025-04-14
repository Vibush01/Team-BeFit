import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import useAnalytics from '../hooks/useAnalytics';

const MemberDashboard = () => {
    useAnalytics('MemberDashboard');

    const { user, userDetails } = useContext(AuthContext);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/schedule/my-bookings', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBookings(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch bookings');
                toast.error(err.response?.data?.message || 'Failed to fetch bookings');
            } finally {
                setLoading(false);
            }
        };
        if (user?.role === 'member') {
            fetchBookings();
        }
    }, [user]);

    if (user?.role !== 'member') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Members.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 sm:py-8 px-4">
            <div className="container mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Member Dashboard</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {loading ? (
                    <div className="flex justify-center">
                        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg sm:text-xl font-bold mb-4">Your Booked Sessions</h2>
                        {bookings.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr>
                                            <th className="p-2 text-sm sm:text-base">Date</th>
                                            <th className="p-2 text-sm sm:text-base">Time Slot</th>
                                            <th className="p-2 text-sm sm:text-base hidden sm:table-cell">Trainer</th>
                                            <th className="p-2 text-sm sm:text-base hidden md:table-cell">Gym</th>
                                            <th className="p-2 text-sm sm:text-base hidden lg:table-cell">Booked On</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.map((booking) => (
                                            <tr key={booking._id} className="border-t">
                                                <td className="p-2 text-sm sm:text-base">{new Date(booking.date).toLocaleDateString()}</td>
                                                <td className="p-2 text-sm sm:text-base">{booking.timeSlot}</td>
                                                <td className="p-2 text-sm sm:text-base hidden sm:table-cell">{booking.trainer.name} ({booking.trainer.email})</td>
                                                <td className="p-2 text-sm sm:text-base hidden md:table-cell">{booking.gym.gymName}</td>
                                                <td className="p-2 text-sm sm:text-base hidden lg:table-cell">{new Date(booking.createdAt).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-700 text-center">No bookings yet</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemberDashboard;