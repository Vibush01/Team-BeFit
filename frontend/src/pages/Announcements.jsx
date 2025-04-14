import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Announcements = () => {
    const { user, userDetails } = useContext(AuthContext);
    const [announcements, setAnnouncements] = useState([]);
    const [formData, setFormData] = useState({ title: '', content: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/announcement', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAnnouncements(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch announcements');
            }
        };
        fetchAnnouncements();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/announcement', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAnnouncements([res.data, ...announcements]);
            setSuccess('Announcement sent successfully');
            setFormData({ title: '', content: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send announcement');
        }
    };

    if (user?.role !== 'gym' && user?.role !== 'member' && user?.role !== 'trainer') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied.</p>
        </div>;
    }

    if ((user?.role === 'member' || user?.role === 'trainer') && !userDetails?.gym) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">You must join a gym to view announcements.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Announcements</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                {/* Announcement Form (Gym only) */}
                {user.role === 'gym' && (
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Content</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    rows="4"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                            >
                                Send Announcement
                            </button>
                        </form>
                    </div>
                )}

                {/* Announcement List */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Gym Announcements</h2>
                    {announcements.length > 0 ? (
                        <ul className="space-y-4">
                            {announcements.map((announcement) => (
                                <li key={announcement._id} className="border-b pb-4">
                                    <p className="text-gray-500 text-sm">
                                        {new Date(announcement.timestamp).toLocaleString()}
                                    </p>
                                    <h3 className="text-lg font-bold">{announcement.title}</h3>
                                    <p className="text-gray-700">{announcement.content}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-700 text-center">No announcements yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Announcements;