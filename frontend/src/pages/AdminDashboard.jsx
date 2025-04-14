import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import GymFormModal from '../components/GymFormModal';
import { toast } from 'react-toastify';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [gyms, setGyms] = useState([]);
    const [selectedGym, setSelectedGym] = useState(null);
    const [users, setUsers] = useState({ members: [], trainers: [] });
    const [modalOpen, setModalOpen] = useState(false);
    const [editGym, setEditGym] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [contactMessages, setContactMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(true);
    const [analytics, setAnalytics] = useState([]);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [analyticsSummary, setAnalyticsSummary] = useState({ pageViews: [], actions: [] });

    useEffect(() => {
        const fetchGyms = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/admin/gyms', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setGyms(res.data);
            } catch (err) {
                setError('Failed to fetch gyms');
                toast.error('Failed to fetch gyms');
            } finally {
                setLoading(false);
            }
        };

        const fetchContactMessages = async () => {
            try {
                setMessagesLoading(true);
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/contact', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setContactMessages(res.data);
            } catch (err) {
                setError('Failed to fetch contact messages');
                toast.error('Failed to fetch contact messages');
            } finally {
                setMessagesLoading(false);
            }
        };

        const fetchAnalytics = async () => {
            try {
                setAnalyticsLoading(true);
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/analytics', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAnalytics(res.data);
            } catch (err) {
                setError('Failed to fetch analytics');
                toast.error('Failed to fetch analytics');
            } finally {
                setAnalyticsLoading(false);
            }
        };

        const fetchAnalyticsSummary = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/analytics/summary', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAnalyticsSummary(res.data);
            } catch (err) {
                setError('Failed to fetch analytics summary');
                toast.error('Failed to fetch analytics summary');
            }
        };

        const fetchReviews = async () => {
            try {
                setReviewsLoading(true);
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/review', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setReviews(res.data);
            } catch (err) {
                setError('Failed to fetch reviews');
                toast.error('Failed to fetch reviews');
            } finally {
                setReviewsLoading(false);
            }
        };

        fetchGyms();
        fetchContactMessages();
        fetchAnalytics();
        fetchAnalyticsSummary();
        fetchReviews();
    }, []);

    const handleCreateGym = async (formData) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/admin/gyms', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGyms([res.data.gym, ...gyms]);
            setSuccess('Gym created successfully');
            toast.success('Gym created successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create gym');
            toast.error(err.response?.data?.message || 'Failed to create gym');
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
            toast.success('Gym updated successfully');
            setEditGym(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update gym');
            toast.error(err.response?.data?.message || 'Failed to update gym');
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
            toast.success('Gym deleted successfully');
        } catch (err) {
            setError('Failed to delete gym');
            toast.error('Failed to delete gym');
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
            toast.success(`Viewing users for ${gym.gymName}`);
        } catch (err) {
            setError('Failed to fetch users');
            toast.error('Failed to fetch users');
        }
    };

    const handleDeleteMessage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/contact/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setContactMessages(contactMessages.filter((message) => message._id !== id));
            toast.success('Message deleted successfully');
        } catch (err) {
            setError('Failed to delete message');
            toast.error('Failed to delete message');
        }
    };

    const handleDeleteReview = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/review/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReviews(reviews.filter((review) => review._id !== id));
            toast.success('Review deleted successfully');
        } catch (err) {
            setError('Failed to delete review');
            toast.error('Failed to delete review');
        }
    };

    // Chart data for page views
    const pageViewsData = {
        labels: analyticsSummary.pageViews.map((item) => item._id),
        datasets: [
            {
                label: 'Page Views',
                data: analyticsSummary.pageViews.map((item) => item.count),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    // Chart data for actions
    const actionsData = {
        labels: analyticsSummary.actions.map((item) => item._id),
        datasets: [
            {
                data: analyticsSummary.actions.map((item) => item.count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                ],
            },
        ],
    };

    if (user?.role !== 'admin') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Admins.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 sm:py-8 px-4">
            <div className="container mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Admin Dashboard</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                {/* Gym List Section */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                        <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-0">Gyms</h2>
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
                    {loading ? (
                        <div className="flex justify-center">
                            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : gyms.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2 text-sm sm:text-base">Gym Name</th>
                                        <th className="p-2 text-sm sm:text-base">Address</th>
                                        <th className="p-2 text-sm sm:text-base hidden md:table-cell">Owner Name</th>
                                        <th className="p-2 text-sm sm:text-base hidden lg:table-cell">Owner Email</th>
                                        <th className="p-2 text-sm sm:text-base hidden xl:table-cell">Email</th>
                                        <th className="p-2 text-sm sm:text-base">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gyms.map((gym) => (
                                        <tr key={gym._id} className="border-t">
                                            <td className="p-2 text-sm sm:text-base">{gym.gymName}</td>
                                            <td className="p-2 text-sm sm:text-base">{gym.address}</td>
                                            <td className="p-2 text-sm sm:text-base hidden md:table-cell">{gym.ownerName}</td>
                                            <td className="p-2 text-sm sm:text-base hidden lg:table-cell">{gym.ownerEmail}</td>
                                            <td className="p-2 text-sm sm:text-base hidden xl:table-cell">{gym.email}</td>
                                            <td className="p-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setEditGym(gym);
                                                        setModalOpen(true);
                                                    }}
                                                    className="bg-yellow-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-yellow-700 text-xs sm:text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGym(gym._id)}
                                                    className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-red-700 text-xs sm:text-sm"
                                                >
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => handleViewUsers(gym)}
                                                    className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-green-700 text-xs sm:text-sm"
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

                {/* Gym Users Section */}
                {selectedGym && (
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
                        <h2 className="text-lg sm:text-xl font-bold mb-4">Users in {selectedGym.gymName}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold mb-2">Members</h3>
                                {users.members.length > 0 ? (
                                    <ul className="list-disc pl-5 text-sm sm:text-base">
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
                                <h3 className="text-base sm:text-lg font-bold mb-2">Trainers</h3>
                                {users.trainers.length > 0 ? (
                                    <ul className="list-disc pl-5 text-sm sm:text-base">
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

                {/* Contact Messages Section */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl font-bold mb-4">Contact Messages</h2>
                    {messagesLoading ? (
                        <div className="flex justify-center">
                            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : contactMessages.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2 text-sm sm:text-base">Name</th>
                                        <th className="p-2 text-sm sm:text-base hidden sm:table-cell">Email</th>
                                        <th className="p-2 text-sm sm:text-base hidden md:table-cell">Phone</th>
                                        <th className="p-2 text-sm sm:text-base hidden lg:table-cell">Subject</th>
                                        <th className="p-2 text-sm sm:text-base hidden xl:table-cell">Message</th>
                                        <th className="p-2 text-sm sm:text-base hidden md:table-cell">Received On</th>
                                        <th className="p-2 text-sm sm:text-base">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contactMessages.map((message) => (
                                        <tr key={message._id} className="border-t">
                                            <td className="p-2 text-sm sm:text-base">{message.name}</td>
                                            <td className="p-2 text-sm sm:text-base hidden sm:table-cell">{message.email}</td>
                                            <td className="p-2 text-sm sm:text-base hidden md:table-cell">{message.phone}</td>
                                            <td className="p-2 text-sm sm:text-base hidden lg:table-cell">{message.subject}</td>
                                            <td className="p-2 text-sm sm:text-base hidden xl:table-cell">{message.message}</td>
                                            <td className="p-2 text-sm sm:text-base hidden md:table-cell">{new Date(message.createdAt).toLocaleString()}</td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => handleDeleteMessage(message._id)}
                                                    className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-red-700 text-xs sm:text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-700 text-center">No contact messages found</p>
                    )}
                </div>

                {/* Reviews Section */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl font-bold mb-4">Gym Reviews</h2>
                    {reviewsLoading ? (
                        <div className="flex justify-center">
                            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2 text-sm sm:text-base">Gym</th>
                                        <th className="p-2 text-sm sm:text-base">Member</th>
                                        <th className="p-2 text-sm sm:text-base hidden sm:table-cell">Rating</th>
                                        <th className="p-2 text-sm sm:text-base hidden md:table-cell">Comment</th>
                                        <th className="p-2 text-sm sm:text-base hidden lg:table-cell">Created On</th>
                                        <th className="p-2 text-sm sm:text-base">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.map((review) => (
                                        <tr key={review._id} className="border-t">
                                            <td className="p-2 text-sm sm:text-base">{review.gym.gymName}</td>
                                            <td className="p-2 text-sm sm:text-base">{review.member.name}</td>
                                            <td className="p-2 text-sm sm:text-base hidden sm:table-cell">{review.rating} stars</td>
                                            <td className="p-2 text-sm sm:text-base hidden md:table-cell">{review.comment}</td>
                                            <td className="p-2 text-sm sm:text-base hidden lg:table-cell">{new Date(review.createdAt).toLocaleString()}</td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => handleDeleteReview(review._id)}
                                                    className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-red-700 text-xs sm:text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-700 text-center">No reviews found</p>
                    )}
                </div>
                

                 {/* Analytics Section */}
<div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
    <h2 className="text-lg sm:text-xl font-bold mb-4">Analytics Overview</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Page Views</h3>
            {analyticsSummary.pageViews.length > 0 ? (
                <Bar
                    data={pageViewsData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: { position: 'top' },
                            title: { display: true, text: 'Page Views by Page' },
                        },
                    }}
                />
            ) : (
                <p className="text-gray-700 text-center">No page views data available</p>
            )}
        </div>
        <div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">User Actions</h3>
            {analyticsSummary.actions.length > 0 ? (
                <Pie
                    data={actionsData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: { position: 'top' },
                            title: { display: true, text: 'User Actions Distribution' },
                        },
                    }}
                />
            ) : (
                <p className="text-gray-700 text-center">No actions data available</p>
            )}
        </div>
    </div>
</div>

{/* Analytics Table Section */}
<div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
    <h2 className="text-lg sm:text-xl font-bold mb-4">Analytics - All Events</h2>
    {analyticsLoading ? (
        <div className="flex justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>
    ) : analytics.length > 0 ? (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr>
                        <th className="p-2 text-sm sm:text-base">Action</th>
                        <th className="p-2 text-sm sm:text-base hidden sm:table-cell">Page</th>
                        <th className="p-2 text-sm sm:text-base hidden md:table-cell">User</th>
                        <th className="p-2 text-sm sm:text-base hidden md:table-cell">Role</th>
                        <th className="p-2 text-sm sm:text-base hidden lg:table-cell">Details</th>
                        <th className="p-2 text-sm sm:text-base hidden lg:table-cell">Timestamp</th>
                    </tr>
                </thead>
                <tbody>
                    {analytics.map((entry) => (
                        <tr key={entry._id} className="border-t">
                            <td className="p-2 text-sm sm:text-base">{entry.action}</td>
                            <td className="p-2 text-sm sm:text-base hidden sm:table-cell">{entry.page || 'N/A'}</td>
                            <td className="p-2 text-sm sm:text-base hidden md:table-cell">{entry.userId || 'Anonymous'}</td>
                            <td className="p-2 text-sm sm:text-base hidden md:table-cell">{entry.userModel || 'N/A'}</td>
                            <td className="p-2 text-sm sm:text-base hidden lg:table-cell">{entry.details ? JSON.stringify(entry.details) : 'N/A'}</td>
                            <td className="p-2 text-sm sm:text-base hidden lg:table-cell">{new Date(entry.timestamp).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    ) : (
        <p className="text-gray-700 text-center">No analytics data found</p>
    )}
</div>

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