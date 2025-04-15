import { useState, useEffect, useContext, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import useAnalytics from '../hooks/useAnalytics';

const socket = io('http://localhost:5000');

const Chat = () => {
    useAnalytics('Chat');

    const { user, userDetails } = useContext(AuthContext);
    const [recipients, setRecipients] = useState([]);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || !userDetails?.gym) return;

        // Join the user's own room for private messaging
        socket.emit('joinUser', user.id);

        // Fetch available recipients
        const fetchRecipients = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/chat/recipients', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setRecipients(res.data);
            } catch (err) {
                setError('Failed to fetch recipients');
                toast.error('Failed to fetch recipients');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipients();

        // Listen for private messages
        socket.on('receivePrivateMessage', (newMessage) => {
            if (
                (newMessage.sender._id === user.id && newMessage.recipient._id === selectedRecipient?.id) ||
                (newMessage.sender._id === selectedRecipient?.id && newMessage.recipient._id === user.id)
            ) {
                setMessages((prevMessages) => [...prevMessages, newMessage]);
            }
        });

        return () => {
            socket.off('receivePrivateMessage');
        };
    }, [user, userDetails, selectedRecipient]);

    useEffect(() => {
        if (!selectedRecipient) return;

        // Fetch private messages with the selected recipient
        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/chat/private-messages/${selectedRecipient.id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setMessages(res.data);
            } catch (err) {
                setError('Failed to fetch messages');
                toast.error('Failed to fetch messages');
            }
        };

        fetchMessages();
    }, [selectedRecipient]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = () => {
        if (!message.trim() || !selectedRecipient) return;

        socket.emit('sendPrivateMessage', {
            senderId: user.id,
            senderModel: user.role.charAt(0).toUpperCase() + user.role.slice(1),
            recipientId: selectedRecipient.id,
            recipientModel: selectedRecipient.role.charAt(0).toUpperCase() + selectedRecipient.role.slice(1),
            message,
        });

        setMessage('');
    };

    if (!userDetails?.gym) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p className="text-red-500">You must join a gym to use the chat.</p>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 sm:py-8 px-4">
            <div className="container mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">Chat</h1>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                {loading ? (
                    <div className="flex justify-center">
                        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Recipient List */}
                        <div className="bg-white p-4 rounded-lg shadow-lg md:col-span-1">
                            <h2 className="text-lg sm:text-xl font-bold mb-4">Select a Recipient</h2>
                            {recipients.length > 0 ? (
                                <ul className="space-y-2">
                                    {recipients.map((recipient) => (
                                        <li
                                            key={recipient.id}
                                            className={`p-2 rounded cursor-pointer ${selectedRecipient?.id === recipient.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                            onClick={() => setSelectedRecipient(recipient)}
                                        >
                                            <p className="text-sm sm:text-base">{recipient.name} ({recipient.email})</p>
                                            <p className="text-xs sm:text-sm text-gray-500">{recipient.role}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-700 text-center">No recipients available</p>
                            )}
                        </div>

                        {/* Chat Window */}
                        <div className="bg-white p-4 rounded-lg shadow-lg md:col-span-3">
                            {selectedRecipient ? (
                                <>
                                    <h2 className="text-lg sm:text-xl font-bold mb-4">
                                        Chat with {selectedRecipient.name} ({selectedRecipient.role})
                                    </h2>
                                    <div className="h-96 overflow-y-auto mb-4 p-4 border rounded-lg">
                                        {messages.map((msg) => (
                                            <div
                                                key={msg._id}
                                                className={`mb-2 ${msg.sender._id === user.id ? 'text-right' : 'text-left'}`}
                                            >
                                                <p className="text-xs sm:text-sm text-gray-500">
                                                    {msg.sender._id === user.id ? 'You' : msg.sender.name} - {new Date(msg.createdAt).toLocaleString()}
                                                </p>
                                                <p className={`inline-block p-2 rounded-lg text-sm sm:text-base ${msg.sender._id === user.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                                    {msg.message}
                                                </p>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 p-2 border rounded"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-700 text-center">Select a recipient to start chatting</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;