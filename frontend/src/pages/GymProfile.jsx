import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const GymProfile = () => {
    const { id } = useParams();
    const { user, userDetails } = useContext(AuthContext);
    const navigate = useNavigate();
    const [gym, setGym] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [joinRequests, setJoinRequests] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        const fetchGym = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:5000/api/gym/${id}`);
                setGym(res.data);
            } catch (err) {
                setError('Failed to fetch gym details');
                toast.error('Failed to fetch gym details');
            } finally {
                setLoading(false);
            }
        };

        const fetchJoinRequests = async () => {
            if (user?.role === 'gym') {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`http://localhost:5000/api/gym/requests/${id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setJoinRequests(res.data);
                } catch (err) {
                    setError('Failed to fetch join requests');
                    toast.error('Failed to fetch join requests');
                }
            }
        };

        const fetchReviews = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/review/gym/${id}`);
                setReviews(res.data);
            } catch (err) {
                setError('Failed to fetch reviews');
                toast.error('Failed to fetch reviews');
            }
        };

        fetchGym();
        fetchJoinRequests();
        fetchReviews();
    }, [id, user]);

    const handleJoinRequest = async (role) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5000/api/gym/request/${id}`,
                { role },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Join request sent successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send join request');
        }
    };

    const handleRequestAction = async (requestId, action) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/gym/request/${requestId}`,
                { action },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setJoinRequests(joinRequests.filter((req) => req._id !== requestId));
            toast.success(`Request ${action}ed successfully`);
        } catch (err) {
            toast.error(err.response?.data?.message || `Failed to ${action} request`);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(
                'http://localhost:5000/api/review',
                { gymId: id, rating: reviewForm.rating, comment: reviewForm.comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReviews([res.data, ...reviews]);
            setReviewForm({ rating: 5, comment: '' });
            toast.success('Review submitted successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit review');
        }
    };

    const handleReviewChange = (e) => {
        setReviewForm({ ...reviewForm, [e.target.name]: e.target.value });
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>;
    }

    if (error) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">{error}</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 sm:py-8 px-4">
            <div className="container mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">{gym.gymName}</h1>
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl font-bold mb-4">Gym Details</h2>
                    <p className="text-gray-700 mb-2"><strong>Address:</strong> {gym.address}</p>
                    <p className="text-gray-700 mb-2"><strong>Owner:</strong> {gym.ownerName} ({gym.ownerEmail})</p>
                    <p className="text-gray-700 mb-4"><strong>Email:</strong> {gym.email}</p>
                    {gym.photos && gym.photos.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {gym.photos.map((photo, index) => (
                                <img key={index} src={photo} alt={`Gym Photo ${index + 1}`} className="w-full h-48 object-cover rounded-lg" />
                            ))}
                        </div>
                    )}
                </div>

                {/* Join Request Section for Members and Trainers */}
                {(user?.role === 'member' || user?.role === 'trainer') && !userDetails?.gym && (
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
                        <h2 className="text-lg sm:text-xl font-bold mb-4">Join This Gym</h2>
                        <button
                            onClick={() => handleJoinRequest(user.role)}
                            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Send Join Request
                        </button>
                    </div>
                )}

                {/* Join Requests Section for Gym Role */}
                {user?.role === 'gym' && userDetails?._id === id && (
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
                        <h2 className="text-lg sm:text-xl font-bold mb-4">Join Requests</h2>
                        {joinRequests.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr>
                                            <th className="p-2 text-sm sm:text-base">User</th>
                                            <th className="p-2 text-sm sm:text-base hidden sm:table-cell">Role</th>
                                            <th className="p-2 text-sm sm:text-base hidden md:table-cell">Status</th>
                                            <th className="p-2 text-sm sm:text-base">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {joinRequests.map((request) => (
                                            <tr key={request._id} className="border-t">
                                                <td className="p-2 text-sm sm:text-base">{request.user.name} ({request.user.email})</td>
                                                <td className="p-2 text-sm sm:text-base hidden sm:table-cell">{request.role}</td>
                                                <td className="p-2 text-sm sm:text-base hidden md:table-cell">{request.status}</td>
                                                <td className="p-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                                                    {request.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleRequestAction(request._id, 'approve')}
                                                                className="bg-green-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-green-700 text-xs sm:text-sm"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleRequestAction(request._id, 'reject')}
                                                                className="bg-red-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-red-700 text-xs sm:text-sm"
                                                            >
                                                                Reject
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
                            <p className="text-gray-700 text-center">No join requests</p>
                        )}
                    </div>
                )}

                {/* Reviews Section */}
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl font-bold mb-4">Reviews</h2>
                    {user?.role === 'member' && userDetails?.gym === id && (
                        <div className="mb-6">
                            <h3 className="text-base sm:text-lg font-semibold mb-2">Leave a Review</h3>
                            <form onSubmit={handleReviewSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Rating (1-5)</label>
                                    <select
                                        name="rating"
                                        value={reviewForm.rating}
                                        onChange={handleReviewChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    >
                                        <option value="1">1 Star</option>
                                        <option value="2">2 Stars</option>
                                        <option value="3">3 Stars</option>
                                        <option value="4">4 Stars</option>
                                        <option value="5">5 Stars</option>
                                    </select>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Comment</label>
                                    <textarea
                                        name="comment"
                                        value={reviewForm.comment}
                                        onChange={handleReviewChange}
                                        className="w-full p-2 border rounded"
                                        rows="3"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Submit Review
                                </button>
                            </form>
                        </div>
                    )}
                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review) => (
                                <div key={review._id} className="border-b pb-4">
                                    <p className="text-sm sm:text-base text-gray-700">
                                        <strong>{review.member.name}</strong> rated {review.rating} stars - {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-gray-600 text-sm sm:text-base">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-700 text-center">No reviews yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GymProfile;