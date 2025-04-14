import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleSelection from './pages/RoleSelection';
import AdminSignup from './pages/AdminSignup';
import GymSignup from './pages/GymSignup';
import TrainerSignup from './pages/TrainerSignup';
import MemberSignup from './pages/MemberSignup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import GymList from './pages/GymList';
import GymProfile from './pages/GymProfile';
import GymDashboard from './pages/GymDashboard';
import MacroCalculator from './pages/MacroCalculator';
import ProgressTracker from './pages/ProgressTracker';
import Chat from './pages/Chat';
import Announcements from './pages/Announcements';
import AdminDashboard from './pages/AdminDashboard';
import TrainerSchedule from './pages/TrainerSchedule';
import Booking from './pages/Booking';
import TrainerBookings from './pages/TrainerBookings';
import MemberDashboard from './pages/MemberDashboard';
import HomePage from './pages/HomePage'; // Add this import

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/" element={<HomePage />} /> {/* Set HomePage as default route */}
                    <Route path="/gyms" element={<GymList />} /> {/* Move GymList to /gyms */}
                    <Route path="/signup" element={<RoleSelection />} />
                    <Route path="/signup/admin" element={<AdminSignup />} />
                    <Route path="/signup/gym" element={<GymSignup />} />
                    <Route path="/signup/trainer" element={<TrainerSignup />} />
                    <Route path="/signup/member" element={<MemberSignup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/gym/:id" element={<GymProfile />} />
                    <Route path="/gym-dashboard" element={
                        <ProtectedRoute>
                            <GymDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/macro-calculator" element={
                        <ProtectedRoute>
                            <MacroCalculator />
                        </ProtectedRoute>
                    } />
                    <Route path="/progress-tracker" element={
                        <ProtectedRoute>
                            <ProgressTracker />
                        </ProtectedRoute>
                    } />
                    <Route path="/chat" element={
                        <ProtectedRoute>
                            <Chat />
                        </ProtectedRoute>
                    } />
                    <Route path="/announcements" element={
                        <ProtectedRoute>
                            <Announcements />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin-dashboard" element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/trainer-schedule" element={
                        <ProtectedRoute>
                            <TrainerSchedule />
                        </ProtectedRoute>
                    } />
                    <Route path="/booking" element={
                        <ProtectedRoute>
                            <Booking />
                        </ProtectedRoute>
                    } />
                    <Route path="/trainer-bookings" element={
                        <ProtectedRoute>
                            <TrainerBookings />
                        </ProtectedRoute>
                    } />
                    <Route path="/member-dashboard" element={
                        <ProtectedRoute>
                            <MemberDashboard />
                        </ProtectedRoute>
                    } />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
                <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            </Router>
        </AuthProvider>
    );
}

export default App;