import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    try {
        const stateStr = localStorage.getItem('odoo-cafe-auth-storage');
        if (stateStr) {
            const parsed = JSON.parse(stateStr);
            const token = parsed?.state?.token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
    } catch (err) {
        console.error('Error attaching token:', err);
    }
    return config;
}, (error) => Promise.reject(error));

export default api;
