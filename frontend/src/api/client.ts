import axios from 'axios';
import { API_URL } from '@/config/env';

/** Axios dùng chung. Mọi file trong src/api/*.api.ts đều import `http` từ đây. */
export const http = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// TODO (TV1 - tuần 2): sau khi làm đăng nhập, token lưu ở localStorage (key: access_token)
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
