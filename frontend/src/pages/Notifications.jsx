import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/requests/notifications', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setNotifications(response.data);
        } catch (err) {
          setError(err.response?.data?.message || 'Error fetching notifications');
        }
      };

      fetchNotifications();
    }
  }, [user, token]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/requests/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map(n => (n._id === notificationId ? response.data : n)));
    } catch (err) {
      setError(err.response?.data?.message || 'Error marking notification as read');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Notifications</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="w-full max-w-2xl">
        {notifications.length === 0 ? (
          <p className="text-gray-600">No notifications found.</p>
        ) : (
          notifications.map(notification => (
            <div key={notification._id} className="bg-white p-4 rounded-lg shadow-md mb-4">
              <p className="text-gray-800">{notification.message}</p>
              <p className="text-gray-600">From: {notification.sender?.name || 'Unknown'}</p>
              <p className="text-gray-600">Status: {notification.status}</p>
              {notification.status === 'unread' && (
                <button
                  onClick={() => handleMarkAsRead(notification._id)}
                  className="mt-2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;