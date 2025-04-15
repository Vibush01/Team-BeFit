import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import useAnalytics from '../hooks/useAnalytics';

const MemberPlanRequest = () => {
    useAnalytics('MemberPlanRequest');

    const { user, userDetails } = useContext(AuthContext);
    const [trainers, setTrainers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [plans, setPlans] = useState([]);
    const [selectedTrainer, setSelectedTrainer] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTrainers = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/member/trainers/${userDetails?.gym}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTrainers(res.data);
            } catch (err) {
                setError('Failed to fetch trainers');
                toast.error('Failed to fetch trainers');
            }
        };

        const fetchRequests = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/plan/my-requests', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRequests(res.data);
            } catch (err) {
                setError('Failed to fetch plan requests');
                toast.error('Failed to fetch plan requests');
            }
        };

        const fetchPlans = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/plan/my-plans', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setPlans(res.data);
            } catch (err) {
                setError('Failed to fetch plans');
                toast.error('Failed to fetch plans');
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'member' && userDetails?.gym) {
            fetchTrainers();
            fetchRequests();
            fetchPlans();
        }
    }, [user, userDetails]);

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTrainer) {
            toast.error('Please select a trainer');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/api/plan/request',
                { trainerId: selectedTrainer },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Plan request sent successfully');
            setSelectedTrainer('');
            // Refresh requests
            const res = await axios.get('http://localhost:5000/api/plan/my-requests', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send plan request');
        }
    };

    if (user?.role !== 'member') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Members.</p>
        </div>;
    }

    if (!userDetails?.gym) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">You must join a gym to request a plan.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 sm:py-8 px-4">
            <div className="container mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Request Workout & Diet Plan</h1>
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
                        {/* Request Form */}
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
                            <h2 className="text-lg sm:text-xl font-bold mb-4">Request a Plan</h2>
                            <form onSubmit={handleRequestSubmit}>
                                <div className="mb-4">
                                    <label className="block text-gray-700">Select Trainer</label>
                                    <select
                                        value={selectedTrainer}
                                        onChange={(e) => setSelectedTrainer(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    >
                                        <option value="">Select a trainer</option>
                                        {trainers.map((trainer) => (
                                            <option key={trainer._id} value={trainer._id}>
                                                {trainer.name} ({trainer.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Send Request
                                </button>
                            </form>
                        </div>

                        {/* Plan Requests Section */}
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 sm:mb-8">
                            <h2 className="text-lg sm:text-xl font-bold mb-4">Your Plan Requests</h2>
                            {requests.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr>
                                                <th className="p-2 text-sm sm:text-base">Trainer</th>
                                                <th className="p-2 text-sm sm:text-base hidden sm:table-cell">Gym</th>
                                                <th className="p-2 text-sm sm:text-base hidden md:table-cell">Status</th>
                                                <th className="p-2 text-sm sm:text-base hidden lg:table-cell">Requested On</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {requests.map((request) => (
                                                <tr key={request._id} className="border-t">
                                                    <td className="p-2 text-sm sm:text-base">{request.trainer.name} ({request.trainer.email})</td>
                                                    <td className="p-2 text-sm sm:text-base hidden sm:table-cell">{request.gym.gymName}</td>
                                                    <td className="p-2 text-sm sm:text-base hidden md:table-cell">{request.status}</td>
                                                    <td className="p-2 text-sm sm:text-base hidden lg:table-cell">{new Date(request.createdAt).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-700 text-center">No plan requests yet</p>
                            )}
                        </div>

                        {/* Plans Section */}
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                            <h2 className="text-lg sm:text-xl font-bold mb-4">Your Plans</h2>
                            {plans.length > 0 ? (
                                <div className="space-y-4">
                                    {plans.map((plan) => (
                                        <div key={plan._id} className="border-b pb-4">
                                            <p className="text-sm sm:text-base text-gray-700">
                                                <strong>Trainer:</strong> {plan.trainer.name} ({plan.trainer.email})
                                            </p>
                                            <p className="text-sm sm:text-base text-gray-700">
                                                <strong>Gym:</strong> {plan.gym.gymName}
                                            </p>
                                            <p className="text-sm sm:text-base text-gray-700">
                                                <strong>Workout Plan:</strong> {plan.workoutPlan}
                                            </p>
                                            <p className="text-sm sm:text-base text-gray-700">
                                                <strong>Diet Plan:</strong> {plan.dietPlan}
                                            </p>
                                            <p className="text-sm sm:text-base text-gray-700">
                                                <strong>Received On:</strong> {new Date(plan.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-700 text-center">No plans received yet</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MemberPlanRequest;