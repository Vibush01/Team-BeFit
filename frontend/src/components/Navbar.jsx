import { useNavigate, Link } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          BeFit
        </Link>
        <div>
          {role ? (
            <>
              {role === 'owner' && (
                <Link to="/owner-dashboard" className="mr-4 hover:underline">
                  Dashboard
                </Link>
              )}
              {role === 'gym_owner' && (
                <Link to="/" className="mr-4 hover:underline">
                  Dashboard
                </Link>
              )}
              {role === 'trainer' && (
                <Link to="/trainer-dashboard" className="mr-4 hover:underline">
                  Dashboard
                </Link>
              )}
              {role === 'member' && (
                <Link to="/member-dashboard" className="mr-4 hover:underline">
                  Dashboard
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="mr-4 hover:underline">
                Log In
              </Link>
              <Link to="/signup" className="hover:underline">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;