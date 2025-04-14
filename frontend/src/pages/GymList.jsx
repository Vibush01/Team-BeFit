import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const GymList = () => {
    const { user } = useContext(AuthContext);
    const [gyms, setGyms] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGyms = async () => {
            try {
                setLoading(true);
                const res = await axios.get('http://localhost:5000/api/gym');
                setGyms(res.data);
            } catch (err) {
                setError('Failed to fetch gyms');
                toast.error('Failed to fetch gyms');
            } finally {
                setLoading(false);
            }
        };
        fetchGyms();
    }, []);

    if (user?.role !== 'member' && user?.role !== 'trainer') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Members and Trainers.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Available Gyms</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {loading ? (
                    <div className="flex justify-center">
                        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {gyms.map((gym) => (
                            <div key={gym._id} className="bg-white p-6 rounded-lg shadow-lg">
                                <h2 className="text-xl font-bold mb-2">{gym.gymName}</h2>
                                <p className="text-gray-700 mb-4">{gym.address}</p>
                                <Link
                                    to={`/gym/${gym._id}`}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    View Details
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GymList;