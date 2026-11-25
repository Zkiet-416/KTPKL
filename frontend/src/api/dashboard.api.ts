import axios from 'axios';

export interface ProductItem {
  id: number;
  code?: string;
  name: string;
  stockQuantity: number;
  salePrice?: number | string;
  categoryId?: number;
}

export interface ReceiptItem {
  id: number;
  receiptCode: string;
  createdAt: string;
  totalAmount: number | string;
  note?: string | null;
  supplier?: {
    id?: number;
    name?: string;
  } | null;
  createdBy?: {
    id?: number;
    fullName?: string;
    username?: string;
  } | null;
}

export interface ReceiptDetailItem {
  id: number;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number | string;
  lineTotal: number | string;
}

export interface ReceiptDetailResponse extends ReceiptItem {
  details: ReceiptDetailItem[];
}

function getBaseUrl(): string {
  const envUrl = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  return 'http://localhost:3000/api';
}

function getAuthHeaders(): Record<string, string> {
  const token =
    localStorage.getItem('access_token') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handleUnauthorized(err: unknown): void {
  if (!axios.isAxiosError(err) || err.response?.status !== 401) return;

  const rawMsg = (err.response?.data as { message?: string | string[] } | undefined)?.message;
  const msgText = Array.isArray(rawMsg) ? rawMsg.join(' ') : String(rawMsg ?? '');

  localStorage.removeItem('access_token');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
  localStorage.removeItem('current_user');
  localStorage.removeItem('user');

  if (msgText.toLowerCase().includes('vô hiệu hóa')) {
    sessionStorage.setItem('auth_notice', 'Tài khoản đã bị vô hiệu hóa.');
  }

  if (window.location.pathname !== '/' && window.location.pathname !== '/setup') {
    window.location.href = '/';
  }
}

async function requestWithFallback<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const base = getBaseUrl();
  const altBase = base.endsWith('/api') ? base.slice(0, -4) : `${base}/api`;
  const headers = getAuthHeaders();

  try {
    const res = await axios.get<T>(`${base}${path}`, { params, headers });
    return res.data;
  } catch (err) {
    handleUnauthorized(err);
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      try {
        const res = await axios.get<T>(`${altBase}${path}`, { params, headers });
        return res.data;
      } catch (altErr) {
        handleUnauthorized(altErr);
        throw altErr;
      }
    }
    throw err;
  }
}

export const dashboardApi = {
  async getAllProducts(): Promise<{ items: ProductItem[]; total: number }> {
    const raw = await requestWithFallback<
      | { data?: ProductItem[]; total?: number; totalPages?: number }
      | ProductItem[]
    >('/products', { page: 1, limit: 20 });

    if (Array.isArray(raw)) {
      return { items: raw, total: raw.length };
    }

    const items = Array.isArray(raw?.data) ? raw.data : [];
    const totalPages = Number(raw?.totalPages ?? 1);
    const total = Number(raw?.total ?? items.length);

    // Nếu tổng sản phẩm nhiều hơn 200 thì lấy thêm các trang còn lại để tính tổng tồn kho chuẩn
    if (totalPages > 1) {
      const allItems = [...items];
      for (let p = 2; p <= totalPages; p += 1) {
        const nextRaw = await requestWithFallback<{ data?: ProductItem[] }>('/products', {
          page: p,
          limit: 200,
        });
        if (Array.isArray(nextRaw?.data)) {
          allItems.push(...nextRaw.data);
        }
      }
      return { items: allItems, total };
    }

    return { items, total };
  },

  async getRecentReceipts(limit = 5): Promise<ReceiptItem[]> {
    const raw = await requestWithFallback<
      | { data?: ReceiptItem[] }
      | ReceiptItem[]
    >('/goods-receipts', {
      page: 1,
      limit,
      sortBy: 'createdAt',
      order: 'DESC',
    });

    const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async getReceiptDetail(id: number): Promise<ReceiptDetailResponse> {
    return requestWithFallback<ReceiptDetailResponse>(`/goods-receipts/${id}`);
  },
};