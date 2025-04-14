import { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';

const socket = io('http://localhost:5000');

const Chat = () => {
    const { user, userDetails } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/chat/history', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessages(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch chat history');
            }
        };

        if (userDetails?.gym) {
            fetchChatHistory();
            socket.emit('joinGym', userDetails.gym);
        }

        socket.on('receiveMessage', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        return () => {
            socket.off('receiveMessage');
        };
    }, [userDetails]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!message.trim()) return;

        const newMessage = {
            gymId: userDetails.gym,
            senderId: user.id,
            senderModel: user.role === 'member' ? 'Member' : 'Trainer',
            message: message.trim(),
        };

        socket.emit('sendMessage', newMessage);
        setMessage('');
    };

    if (user?.role !== 'member' && user?.role !== 'trainer') {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">Access denied. This page is only for Members and Trainers.</p>
        </div>;
    }

    if (!userDetails?.gym) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">You must join a gym to access the chat.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">Gym Chat</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    {/* Chat Messages */}
                    <div className="h-96 overflow-y-auto mb-4 p-4 border rounded">
                        {messages.map((msg, index) => {
                            const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
                            const senderName = typeof msg.sender === 'object' ? msg.sender.name : 'Unknown';
                            const senderModel = msg.senderModel || 'Unknown';

                            return (
                                <div
                                    key={index}
                                    className={`mb-2 ${senderId === user.id ? 'text-right' : 'text-left'}`}
                                >
                                    <p className="text-gray-500 text-sm">
                                        {senderName} ({senderModel}) - {new Date(msg.timestamp).toLocaleString()}
                                    </p>
                                    <p className={`inline-block p-2 rounded ${senderId === user.id ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                                        {msg.message}
                                    </p>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 p-2 border rounded mr-2"
                            placeholder="Type a message..."
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;