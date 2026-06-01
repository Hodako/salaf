import axios from 'axios';

/**
 * Configured Axios instance for making API requests to the application's backend.
 * 
 * Includes pre-defined base URL, timeouts, and standard headers. 
 * Provides a central point for configuring request/response interceptors.
 */
const api = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
