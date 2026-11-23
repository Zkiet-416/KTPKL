import axios from 'axios';

export interface GoodsIssueDetailPayload {
  productId: number;
  quantity: number;
  unitPrice: number;
  note?: string;
}

export interface CreateGoodsIssuePayload {
  code: string;
  issueType: 'NHAP' | 'XUAT';
  note?: string;
  details: GoodsIssueDetailPayload[];
}

export interface GoodsIssueRecord {
  id: number;
  code: string;
  type: 'NHAP' | 'XUAT';
  note?: string | null;
  createdAt?: string;
}

function getBaseUrl(): string {
  const envUrl = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  return 'http://localhost:3000/api';
}

function getAuthHeaders(): Record<string, string> {
  const token =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function requestWithFallback<T>(
  method: 'get' | 'post' | 'put' | 'delete',
  path: string,
  options?: { params?: Record<string, unknown>; data?: unknown },
): Promise<T> {
  const base = getBaseUrl();
  const altBase = base.endsWith('/api') ? base.slice(0, -4) : `${base}/api`;
  const headers = getAuthHeaders();

  try {
    const res = await axios.request<T>({
      method,
      url: `${base}${path}`,
      params: options?.params,
      data: options?.data,
      headers,
    });
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      const res = await axios.request<T>({
        method,
        url: `${altBase}${path}`,
        params: options?.params,
        data: options?.data,
        headers,
      });
      return res.data;
    }
    throw err;
  }
}

export const goodsIssuesApi = {
  async createIssue(payload: CreateGoodsIssuePayload): Promise<GoodsIssueRecord> {
    return requestWithFallback<GoodsIssueRecord>('post', '/goods-issues', { data: payload });
  },
};