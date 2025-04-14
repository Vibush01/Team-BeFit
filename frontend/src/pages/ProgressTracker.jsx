import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ProgressTracker = () => {
    const { user } = useContext(AuthContext);
    const [progressEntries, setProgressEntries] = useState([]);
    const [formData, setFormData] = useState({
        weight: '',
        muscleMass: '',
        fatPercentage: '',
        images: [],
        deleteImages: [],
    });
    const [editId, setEditId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProgressEntries = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/member/progress', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProgressEntries(res.data);
            } catch (err) {
                setError('Failed to fetch progress entries');
            }
        };
        if (user?.role === 'member') {
            fetchProgressEntries();
        }
    }, [user]);

    const handleChange = (e) => {
        if (e.target.name === 'images') {
            setFormData({ ...formData, images: Array.from(e.target.files) });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleDeleteImage = (imageUrl) => {
        setFormData({
            ...formData,
            deleteImages: [...formData.deleteImages, imageUrl],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const form = new FormData();
            form.append('weight', formData.weight);
            form.append('muscleMass', formData.muscleMass);
            form.append('fatPercentage', formData.fatPercentage);
            formData.images.forEach((image) => {
                form.append('images', image);
            });
            if (formData.deleteImages.length > 0) {
                form.append('deleteImages', JSON.stringify(formData.deleteImages));
            }

            if (editId) {
                // Update existing entry
                const res = await axios.put(`http://localhost:5000/api/member/progress/${editId}`, form, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setProgressEntries(progressEntries.map((entry) => (entry._id === editId ? res.data : entry)));
                setSuccess('Progress entry updated successfully');
                setEditId(null);
            } else {
                // Create new entry
                const res = await axios.post('http://localhost:5000/api/member/progress', form, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });
                setProgressEntries([res.data, ...progressEntries]);
                setSuccess('Progress entry added successfully');
            }

            // Reset form
            setFormData({ weight: '', muscleMass: '', fatPercentage: '', images: [], deleteImages: [] });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save progress entry');
        }
    };

    const handleEdit = (entry) => {
        setEditId(entry._id);
        setFormData({
            weight: entry.weight,
            muscleMass: entry.muscleMass,
            fatPercentage: entry.fatPercentage,
            images: [],
            deleteImages: [],
        });
    };

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/member/progress/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProgressEntries(progressEntries.filter((entry) => entry._id !== id));
            setSuccess('Progress entry deleted successfully');
        } catch (err) {
            setError('Failed to delete progress entry');
        }
    };

    if (user?.role !== 'member') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Members.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Progress Tracker</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {success && <p className="text-green-500 mb-4 text-center">{success}</p>}

                {/* Form */}
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-gray-700">Weight (kg)</label>
                                <input
                                    type="number"
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700">Muscle Mass (kg)</label>
                                <input
                                    type="number"
                                    name="muscleMass"
                                    value={formData.muscleMass}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700">Fat Percentage (%)</label>
                                <input
                                    type="number"
                                    name="fatPercentage"
                                    value={formData.fatPercentage}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-gray-700">Images (up to 3)</label>
                            <input
                                type="file"
                                name="images"
                                multiple
                                accept="image/*"
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        {editId && formData.deleteImages.length > 0 && (
                            <div className="mt-4">
                                <p className="text-gray-700">Images to be deleted:</p>
                                <ul className="list-disc pl-5">
                                    {formData.deleteImages.map((url, index) => (
                                        <li key={index} className="text-gray-700">{url}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <button
                            type="submit"
                            className="mt-4 w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        >
                            {editId ? 'Update Progress Entry' : 'Add Progress Entry'}
                        </button>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Progress Entries</h2>
                    {progressEntries.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Weight (kg)</th>
                                        <th className="p-2">Muscle Mass (kg)</th>
                                        <th className="p-2">Fat Percentage (%)</th>
                                        <th className="p-2">Images</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {progressEntries.map((entry) => (
                                        <tr key={entry._id} className="border-t">
                                            <td className="p-2">{new Date(entry.date).toLocaleDateString()}</td>
                                            <td className="p-2">{entry.weight}</td>
                                            <td className="p-2">{entry.muscleMass}</td>
                                            <td className="p-2">{entry.fatPercentage}</td>
                                            <td className="p-2">
                                                {entry.images.length > 0 ? (
                                                    <div className="flex space-x-2">
                                                        {entry.images.map((image, index) => (
                                                            <div key={index} className="relative">
                                                                <img
                                                                    src={image}
                                                                    alt={`Progress ${index}`}
                                                                    className="w-16 h-16 object-cover rounded"
                                                                />
                                                                {editId === entry._id && (
                                                                    <button
                                                                        onClick={() => handleDeleteImage(image)}
                                                                        className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full"
                                                                    >
                                                                        X
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    'No images'
                                                )}
                                            </td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => handleEdit(entry)}
                                                    className="bg-yellow-600 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-700"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(entry._id)}
                                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
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
                        <p className="text-gray-700 text-center">No progress entries yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProgressTracker;