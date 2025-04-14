import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({ id: decoded.id, role: decoded.role });
            } catch (error) {
                localStorage.removeItem('token');
            }
        }
    }, []);

    const login = async (email, password, role) => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
                role,
            });
            localStorage.setItem('token', res.data.token);
            setUser({ id: res.data.user.id, role: res.data.user.role });
            return res.data; // Return the response for the calling component to handle navigation
        } catch (error) {
            throw error.response.data.message;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        // Navigation will be handled by the component calling logout
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};