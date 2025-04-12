import { useState, useEffect } from 'react';

function Chat({ gymId, userId, role }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  // Fetch users to chat with (based on role and gym)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/gyms/${gymId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          let availableUsers = [];
          if (role === 'member') {
            // Members can only chat with trainers
            availableUsers = data.trainers;
          } else if (role === 'trainer') {
            // Trainers can chat with members and the gym owner
            availableUsers = [...data.members, data.owner];
          } else if (role === 'gym_owner') {
            // Gym owners can chat with trainers and members
            availableUsers = [...data.trainers, ...data.members];
          }
          setUsers(availableUsers);
          if (availableUsers.length > 0) {
            setReceiverId(availableUsers[0]._id); // Default to the first user
          }
        } else {
          setError(data.message || 'Failed to fetch users');
        }
      } catch (err) {
        setError('Something went wrong. Please try again.');
      }
    };

    fetchUsers();
  }, [gymId, role]);

  // Fetch messages when receiver changes
  useEffect(() => {
    if (!receiverId) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/chat/${gymId}/${receiverId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          setMessages(data);
        } else {
          setError(data.message || 'Failed to fetch messages');
        }
      } catch (err) {
        setError('Something went wrong. Please try again.');
      }
    };

    fetchMessages();
  }, [gymId, receiverId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiver: receiverId,
          gym: gymId,
          content: newMessage,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessages([...messages, data]);
        setNewMessage('');
      } else {
        setError(data.message || 'Failed to send message');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Chat</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2" htmlFor="receiver">
          Chat with:
        </label>
        <select
          id="receiver"
          value={receiverId}
          onChange={(e) => setReceiverId(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.email}) - {user.role}
            </option>
          ))}
        </select>
      </div>
      <div className="border p-4 rounded-lg h-64 overflow-y-auto mb-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`mb-2 ${
                message.sender._id === userId ? 'text-right' : 'text-left'
              }`}
            >
              <p
                className={`inline-block p-2 rounded-lg ${
                  message.sender._id === userId ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                {message.content}
              </p>
              <p className="text-gray-500 text-sm">
                {message.sender.name} - {new Date(message.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No messages yet.</p>
        )}
      </div>
      <form onSubmit={handleSendMessage}>
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="Type your message..."
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;