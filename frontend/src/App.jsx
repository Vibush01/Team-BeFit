import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import OwnerDashboard from './pages/OwnerDashboard';
import GymProfile from './pages/GymProfile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          {/* Protected routes for owner */}
          <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          </Route>
          {/* Protected routes for gym owner */}
          <Route element={<ProtectedRoute allowedRoles={['gym_owner']} />}>
            <Route path="/gym/:id" element={<GymProfile />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;