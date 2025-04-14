import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const HomePage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/contact', formData);
            toast.success('Message sent successfully');
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-100">
            {/* Introduction Section */}
            <section className="bg-blue-600 text-white py-20">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-4">Welcome to BeFit</h1>
                    <p className="text-xl mb-6">Your ultimate fitness companion to connect with gyms, trainers, and achieve your fitness goals.</p>
                    <a href="#contact" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200">Get in Touch</a>
                </div>
            </section>

            {/* About Us Section */}
            <section className="py-16">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-8">About Us</h2>
                    <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                        BeFit is a platform designed to simplify your fitness journey. We connect Members with top-notch gyms and trainers, provide tools to track your progress, and foster a community where you can chat and stay motivated. Whether you're a gym owner, trainer, or fitness enthusiast, BeFit has something for everyone.
                    </p>
                </div>
            </section>

            {/* Key Features Section */}
            <section className="bg-gray-200 py-16">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                            <h3 className="text-xl font-semibold mb-4">Gym & Trainer Connection</h3>
                            <p className="text-gray-700">Easily find and join gyms, connect with trainers, and book personalized training sessions.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                            <h3 className="text-xl font-semibold mb-4">Progress Tracking</h3>
                            <p className="text-gray-700">Track your macros, body progress, and fitness goals with our intuitive tools.</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                            <h3 className="text-xl font-semibold mb-4">Community & Communication</h3>
                            <p className="text-gray-700">Chat with gym members and trainers, and stay updated with gym announcements.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Us Section */}
            <section id="contact" className="py-16">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Contact Us</h2>
                    <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-lg">
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
                                <label className="block text-gray-700">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    rows="4"
                                    required
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
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-blue-600 text-white py-6">
                <div className="container mx-auto text-center">
                    <p>&copy; 2025 BeFit. All rights reserved.</p>
                    <p className="mt-2">Follow us on social media: 
                        <a href="#" className="ml-2 text-white hover:underline">Facebook</a> | 
                        <a href="#" className="ml-2 text-white hover:underline">Twitter</a> | 
                        <a href="#" className="ml-2 text-white hover:underline">Instagram</a>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;