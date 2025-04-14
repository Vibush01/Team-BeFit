import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const Profile = () => {
    const { user, userDetails, logout } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        profileImage: null,
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (userDetails) {
            setFormData({
                name: userDetails.name || '',
                email: userDetails.email || '',
                password: '',
                profileImage: null,
            });
            setPreviewImage(userDetails.profileImage || null);
        }
    }, [userDetails]);

    const handleChange = (e) => {
        if (e.target.name === 'profileImage') {
            const file = e.target.files[0];
            setFormData({ ...formData, profileImage: file });
            setPreviewImage(URL.createObjectURL(file));
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const form = new FormData();
            form.append('name', formData.name);
            form.append('email', formData.email);
            if (formData.password) form.append('password', formData.password);
            if (formData.profileImage) form.append('profileImage', formData.profileImage);

            const res = await axios.put('http://localhost:5000/api/auth/profile', form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Profile updated successfully');
            setFormData({ ...formData, password: '' });
            setPreviewImage(res.data.user.profileImage || previewImage);
            window.location.reload(); // Refresh to update userDetails
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!userDetails) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p>Loading...</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-center">Profile</h1>
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        {previewImage ? (
                            <img
                                src={previewImage}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500">No Image</span>
                            </div>
                        )}
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer">
                            <input
                                type="file"
                                name="profileImage"
                                accept="image/*"
                                onChange={handleChange}
                                className="hidden"
                            />
                            Upload
                        </label>
                    </div>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700">New Password (optional)</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 flex items-center justify-center"
                        disabled={loading}
                    >
                        {loading ? (
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : null}
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>
                <button
                    onClick={logout}
                    className="mt-4 w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Profile;