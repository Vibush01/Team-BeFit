import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold">BeFit</Link>
        <div className="space-x-4">
          <Link to="/" className="text-white hover:text-blue-200">Home</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-white hover:text-blue-200">Dashboard</Link>
              <Link to="/notifications" className="text-white hover:text-blue-200">Notifications</Link>
              <button onClick={logout} className="text-white hover:text-blue-200">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-blue-200">Login</Link>
              <Link to="/signup" className="text-white hover:text-blue-200">Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;