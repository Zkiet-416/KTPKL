import axios from 'axios';
import { API_URL } from '@/config/env';

/** Axios dùng chung. Mọi file trong src/api/*.api.ts đều import `http` từ đây. */
export const http = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = String(error?.config?.url ?? '');
    const isLoginRequest = url.includes('/auth/login');
    const rawMsg = error?.response?.data?.message;
    const msgText = Array.isArray(rawMsg)
      ? rawMsg.join(' ')
      : String(rawMsg ?? '');

    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      localStorage.removeItem('current_user');
      localStorage.removeItem('user');

      sessionStorage.setItem(
        'auth_notice',
        msgText.trim() || 'Tài khoản đã bị vô hiệu hóa.',
      );

      if (window.location.pathname !== '/' && window.location.pathname !== '/setup') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  },
);