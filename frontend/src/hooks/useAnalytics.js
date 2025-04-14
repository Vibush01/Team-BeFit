import { useEffect } from 'react';
import axios from 'axios';

const useAnalytics = (page) => {
    useEffect(() => {
        const logPageView = async () => {
            try {
                const token = localStorage.getItem('token');
                await axios.post('http://localhost:5000/api/analytics/page-view', { page }, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
            } catch (err) {
                console.error('Failed to log page view:', err);
            }
        };
        logPageView();
    }, [page]);
};

export default useAnalytics;