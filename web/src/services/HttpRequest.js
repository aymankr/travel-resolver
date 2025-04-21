import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL;

class HttpRequest {
    constructor() {
        this.client = axios.create({
            baseURL: BASE_URL,
            timeout: 1000000,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('travelOrderToken');
                 if (token) {
                     config.headers.Authorization = `Bearer ${token}`;
                 }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Add response interceptor
        this.client.interceptors.response.use(
            (response) => response.data,
            (error) => {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    const message = error.response.data?.message || 'An error occurred';
                    return Promise.reject(new Error(message));
                } else if (error.request) {
                    // The request was made but no response was received
                    return Promise.reject(new Error('No response received from server'));
                } else {
                    // Something happened in setting up the request
                    return Promise.reject(error);
                }
            }
        );
    }

    async get(url, config = {}) {
        return this.client.get(url, config);
    }

    async post(url, data = {}, config = {}) {
        return this.client.post(url, data, config);
    }

    async put(url, data = {}, config = {}) {
        return this.client.put(url, data, config);
    }

    async delete(url, config = {}) {
        return this.client.delete(url, config);
    }
}

export default new HttpRequest();