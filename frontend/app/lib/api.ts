/**
 * CAMS - API Connection Logic
 * Axios wrapper to cleanly communicate with the backend.
 * Automatically attaches Authorization Header using js-cookie.
 */

import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('cams_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper for extracting clean error messages from backend AppError system
export const getErrorMessage = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error; // AppError messages
  }
  return error.message || 'An unexpected error occurred';
};
