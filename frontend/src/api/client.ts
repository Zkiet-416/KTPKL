import axios from 'axios';
import { API_URL } from '@/config/env';

/** Axios dùng chung. Mọi file trong src/api/*.api.ts đều import `http` từ đây. */
export const http = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('current_user');
      if (window.location.pathname !== '/' && window.location.pathname !== '/setup') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  },
);