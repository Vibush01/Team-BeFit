import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import useAnalytics from '../hooks/useAnalytics';

const HomePage = () => {
    useAnalytics('HomePage');

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
            <section className="bg-blue-600 text-white py-10 sm:py-16 md:py-20">
                <div className="container mx-auto text-center px-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Welcome to BeFit</h1>
                    <p className="text-lg sm:text-xl md:text-xl mb-6">Your ultimate fitness companion to connect with gyms, trainers, and achieve your fitness goals.</p>
                    <a href="#contact" className="bg-white text-blue-600 px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-gray-200">Get in Touch</a>
                </div>
            </section>

            {/* About Us Section */}
            <section className="py-10 sm:py-16">
                <div className="container mx-auto text-center px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">About Us</h2>
                    <p className="text-base sm:text-lg text-gray-700 max-w-xl sm:max-w-2xl mx-auto">
                        BeFit is a platform designed to simplify your fitness journey. We connect Members with top-notch gyms and trainers, provide tools to track your progress, and foster a community where you can chat and stay motivated. Whether you're a gym owner, trainer, or fitness enthusiast, BeFit has something for everyone.
                    </p>
                </div>
            </section>

            {/* Key Features Section */}
            <section className="bg-gray-200 py-10 sm:py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Key Features</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center">
                            <h3 className="text-lg sm:text-xl font-semibold mb-4">Gym & Trainer Connection</h3>
                            <p className="text-gray-700">Easily find and join gyms, connect with trainers, and book personalized training sessions.</p>
                        </div>
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center">
                            <h3 className="text-lg sm:text-xl font-semibold mb-4">Progress Tracking</h3>
                            <p className="text-gray-700">Track your macros, body progress, and fitness goals with our intuitive tools.</p>
                        </div>
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center">
                            <h3 className="text-lg sm:text-xl font-semibold mb-4">Community & Communication</h3>
                            <p className="text-gray-700">Chat with gym members and trainers, and stay updated with gym announcements.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-10 sm:py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">What Our Users Say</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center">
                            <p className="text-gray-700 italic mb-4">"BeFit helped me find the perfect gym and trainer to achieve my fitness goals!"</p>
                            <h3 className="text-base sm:text-lg font-semibold">Sarah J.</h3>
                            <p className="text-gray-500">Member</p>
                        </div>
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center">
                            <p className="text-gray-700 italic mb-4">"Managing my schedule and bookings has never been easier thanks to BeFit."</p>
                            <h3 className="text-base sm:text-lg font-semibold">Mike T.</h3>
                            <p className="text-gray-500">Trainer</p>
                        </div>
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center">
                            <p className="text-gray-700 italic mb-4">"Our gym has grown thanks to BeFit's community features and easy management tools."</p>
                            <h3 className="text-base sm:text-lg font-semibold">Lisa R.</h3>
                            <p className="text-gray-500">Gym Owner</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Us Section */}
            <section id="contact" className="py-10 sm:py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Contact Us</h2>
                    <div className="max-w-full sm:max-w-lg mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-lg">
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
                <div className="container mx-auto text-center px-4">
                    <p>© 2025 BeFit. All rights reserved.</p>
                    <p className="mt-2 sm:mt-4 flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <span>Follow us on social media:</span>
                        <a href="#" className="text-white hover:underline">Facebook</a>
                        <a href="#" className="text-white hover:underline">Twitter</a>
                        <a href="#" className="text-white hover:underline">Instagram</a>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;