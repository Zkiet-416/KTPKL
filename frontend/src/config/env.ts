/** Địa chỉ API backend (đặt VITE_API_URL trong file .env ở thư mục gốc) */
export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

/** Địa chỉ Swagger của backend (suy ra từ API_URL) */
export const SWAGGER_URL = `${API_URL}/docs`;
