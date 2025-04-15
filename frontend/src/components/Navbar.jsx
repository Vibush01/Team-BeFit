import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, userDetails } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="bg-blue-600 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-xl sm:text-2xl font-bold">BeFit</Link>
                <div className="md:hidden">
                    <button onClick={toggleMenu} className="text-white focus:outline-none">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                        </svg>
                    </button>
                </div>
                <div className={`md:flex md:items-center ${isOpen ? 'block' : 'hidden'} w-full md:w-auto`}>
                    <div className="flex flex-col md:flex-row md:space-x-4 mt-4 md:mt-0">
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <Link to="/admin-dashboard" className="text-white py-2 md:py-0 hover:underline">Admin Dashboard</Link>
                                )}
                                {user.role === 'gym' && (
                                    <>
                                        <Link to="/gym-dashboard" className="text-white py-2 md:py-0 hover:underline">Dashboard</Link>
                                        <Link to="/announcements" className="text-white py-2 md:py-0 hover:underline">Announcements</Link>
                                    </>
                                )}
                                {user.role === 'member' && !userDetails?.gym && (
                                    <Link to="/gyms" className="text-white py-2 md:py-0 hover:underline">Find a Gym</Link>
                                )}
                                {(user.role === 'member' || user.role === 'trainer') && userDetails?.gym && (
                                    <>
                                        <Link to="/chat" className="text-white py-2 md:py-0 hover:underline">Chat</Link>
                                        <Link to="/announcements" className="text-white py-2 md:py-0 hover:underline">Announcements</Link>
                                    </>
                                )}
                                {user.role === 'member' && userDetails?.gym && (
                                    <>
                                        <Link to="/member-dashboard" className="text-white py-2 md:py-0 hover:underline">Dashboard</Link>
                                        <Link to="/macro-calculator" className="text-white py-2 md:py-0 hover:underline">Macro Calculator</Link>
                                        <Link to="/progress-tracker" className="text-white py-2 md:py-0 hover:underline">Progress Tracker</Link>
                                        <Link to="/booking" className="text-white py-2 md:py-0 hover:underline">Book a Session</Link>
                                        <Link to="/member-plan-request" className="text-white py-2 md:py-0 hover:underline">Request Plan</Link>
                                    </>
                                )}
                                {user.role === 'trainer' && userDetails?.gym && (
                                    <>
                                        <Link to="/trainer-schedule" className="text-white py-2 md:py-0 hover:underline">Manage Schedules</Link>
                                        <Link to="/trainer-bookings" className="text-white py-2 md:py-0 hover:underline">View Bookings</Link>
                                        <Link to="/trainer-plan-management" className="text-white py-2 md:py-0 hover:underline">Manage Plans</Link>
                                    </>
                                )}
                                <Link to="/profile" className="text-white py-2 md:py-0 hover:underline">Profile</Link>
                                <button onClick={handleLogout} className="text-white py-2 md:py-0 hover:underline">Logout</button>
                            </>
                        ) : (
                            <>
                                <Link to="/signup" className="text-white py-2 md:py-0 hover:underline">Signup</Link>
                                <Link to="/login" className="text-white py-2 md:py-0 hover:underline">Login</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;