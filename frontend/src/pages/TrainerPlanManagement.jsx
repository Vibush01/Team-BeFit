import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import useAnalytics from '../hooks/useAnalytics';

const TrainerPlanManagement = () => {
    useAnalytics('TrainerPlanManagement');

    const { user, userDetails } = useContext(AuthContext);
    const [requests, setRequests] = useState([]);
    const [planForm, setPlanForm] = useState({ planRequestId: '', workoutPlan: '', dietPlan: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/plan/trainer-requests', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRequests(res.data);
            } catch (err) {
                setError('Failed to fetch plan requests'+err);
                toast.error('Failed to fetch plan requests');
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'trainer' && userDetails?.gym) {
            fetchRequests();
        }
    }, [user, userDetails]);

    const handlePlanSubmit = async (e) => {
        e.preventDefault();
        if (!planForm.planRequestId || !planForm.workoutPlan || !planForm.dietPlan) {
            toast.error('All fields are required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/plan/send-plan',
                planForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Plan sent successfully');
            setPlanForm({ planRequestId: '', workoutPlan: '', dietPlan: '' });
            // Refresh requests
            const res = await axios.get('http://localhost:5000/api/plan/trainer-requests', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send plan');
        }
    };

    const handlePlanChange = (e) => {
        setPlanForm({ ...planForm, [e.target.name]: e.target.value });
    };

    if (user?.role !== 'trainer') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Trainers.</p>
        </div>;
    }

    if (!userDetails?.gym) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">You must join a gym to manage plans.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 sm:py-8 px-4">
            <div className="container mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Manage Plan Requests</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {loading ? (
                    <div className="flex justify-center">
                        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    <>
                        {/* Plan Requests Section */}
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
                            <h2 className="text-lg sm:text-xl font-bold mb-4">Plan Requests</h2>
                            {requests.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr>
                                                <th className="p-2 text-sm sm:text-base">Member</th>
                                                <th className="p-2 text-sm sm:text-base hidden sm:table-cell">Gym</th>
                                                <th className="p-2 text-sm sm:text-base hidden md:table-cell">Status</th>
                                                <th className="p-2 text-sm sm:text-base hidden lg:table-cell">Requested On</th>
                                                <th className="p-2 text-sm sm:text-base">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requests.map((request) => (
                                                <tr key={request._id} className="border-t">
                                                    <td className="p-2 text-sm sm:text-base">{request.member.name} ({request.member.email})</td>
                                                    <td className="p-2 text-sm sm:text-base hidden sm:table-cell">{request.gym.gymName}</td>
                                                    <td className="p-2 text-sm sm:text-base hidden md:table-cell">{request.status}</td>
                                                    <td className="p-2 text-sm sm:text-base hidden lg:table-cell">{new Date(request.createdAt).toLocaleString()}</td>
                                                    <td className="p-2">
                                                        {request.status === 'pending' && (
                                                            <button
                                                                onClick={() => setPlanForm({ ...planForm, planRequestId: request._id })}
                                                                className="bg-blue-600 text-white px-2 sm:px-3 py-1 rounded hover:bg-blue-700 text-xs sm:text-sm"
                                                            >
                                                                Send Plan
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-700 text-center">No plan requests yet</p>
                            )}
                        </div>

                        {/* Send Plan Form */}
                        {planForm.planRequestId && (
                            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                                <h2 className="text-lg sm:text-xl font-bold mb-4">Send Plan</h2>
                                <form onSubmit={handlePlanSubmit}>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Workout Plan</label>
                                        <textarea
                                            name="workoutPlan"
                                            value={planForm.workoutPlan}
                                            onChange={handlePlanChange}
                                            className="w-full p-2 border rounded"
                                            rows="4"
                                            required
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-gray-700">Diet Plan</label>
                                        <textarea
                                            name="dietPlan"
                                            value={planForm.dietPlan}
                                            onChange={handlePlanChange}
                                            className="w-full p-2 border rounded"
                                            rows="4"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    >
                                        Send Plan
                                    </button>
                                </form>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TrainerPlanManagement;