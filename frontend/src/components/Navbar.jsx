import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout, userDetails } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-white text-2xl font-bold">BeFit</Link>
                <div>
                    {user ? (
                        <>
                            {user.role === 'gym' && (
                                <Link to="/gym-dashboard" className="text-white mr-4">Dashboard</Link>
                            )}
                            {user.role === 'member' && !userDetails?.gym && (
                                <Link to="/" className="text-white mr-4">Find a Gym</Link>
                            )}
                            {user.role === 'member' && (
                                <>
                                    <Link to="/macro-calculator" className="text-white mr-4">Macro Calculator</Link>
                                    <Link to="/progress-tracker" className="text-white mr-4">Progress Tracker</Link>
                                </>
                            )}
                            <Link to="/profile" className="text-white mr-4">Profile</Link>
                            <button onClick={handleLogout} className="text-white">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/signup" className="text-white mr-4">Signup</Link>
                            <Link to="/login" className="text-white">Login</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;