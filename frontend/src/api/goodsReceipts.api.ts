import axios from 'axios';

export interface GoodsReceiptSupplierInfo {
  id: number;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface GoodsReceiptCreatorInfo {
  id: number;
  fullName: string;
  username?: string;
}

export interface GoodsReceiptDetailItem {
  id: number;
  code: string;
  name: string;
  unit: string;
  quantity: string | number;
  unitPrice: string | number;
  lineTotal: string | number;
}

export interface GoodsReceiptSummary {
  id: number;
  receiptCode: string;
  createdAt: string;
  totalAmount: string | number;
  note?: string | null;
  supplier?: GoodsReceiptSupplierInfo | null;
  createdBy?: GoodsReceiptCreatorInfo | null;
}

export interface GoodsReceiptDetailResponse extends GoodsReceiptSummary {
  details: GoodsReceiptDetailItem[];
}

export interface GoodsReceiptsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  month?: number;
  year?: number;
  sortBy?: 'createdAt' | 'receiptCode' | 'totalAmount';
  order?: 'ASC' | 'DESC';
}

export interface GoodsReceiptListResponse {
  data: GoodsReceiptSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GoodsReceiptHistoryResponse {
  month: number | null;
  year: number | null;
  totalReceipts: number;
  totalAmount: string | number;
  receipts: GoodsReceiptDetailResponse[];
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

export const goodsReceiptsApi = {
  async getReceipts(params: GoodsReceiptsQueryParams = {}): Promise<GoodsReceiptListResponse> {
    const query: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      sortBy: params.sortBy ?? 'createdAt',
      order: params.order ?? 'DESC',
    };
    if (params.search?.trim()) {
      query.search = params.search.trim();
    }
    if (params.month) {
      query.month = params.month;
    }
    if (params.year) {
      query.year = params.year;
    }

    const raw = await requestWithFallback<
      | {
          data?: GoodsReceiptSummary[];
          meta?: {
            page?: number;
            limit?: number;
            total?: number;
            totalItems?: number;
            totalPages?: number;
          };
        }
      | GoodsReceiptSummary[]
    >('get', '/goods-receipts', { params: query });

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    if (Array.isArray(raw)) {
      return {
        data: raw,
        total: raw.length,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(raw.length / limit)),
      };
    }

    const data = Array.isArray(raw?.data) ? raw.data : [];
    const total = Number(raw?.meta?.total ?? raw?.meta?.totalItems ?? data.length);
    const totalPages = Math.max(
      1,
      Number(raw?.meta?.totalPages ?? Math.ceil(total / limit)),
    );

    return {
      data,
      total,
      page: Number(raw?.meta?.page ?? page),
      limit: Number(raw?.meta?.limit ?? limit),
      totalPages,
    };
  },

  async getReceiptById(id: number): Promise<GoodsReceiptDetailResponse> {
    return requestWithFallback<GoodsReceiptDetailResponse>('get', `/goods-receipts/${id}`);
  },

  async getReceiptPrintData(id: number): Promise<GoodsReceiptDetailResponse> {
    return requestWithFallback<GoodsReceiptDetailResponse>('get', `/goods-receipts/${id}/print`);
  },

  async getHistory(params: { month?: number; year?: number } = {}): Promise<GoodsReceiptHistoryResponse> {
    const query: Record<string, unknown> = {};
    if (params.month) query.month = params.month;
    if (params.year) query.year = params.year;

    return requestWithFallback<GoodsReceiptHistoryResponse>('get', '/goods-receipts/history', {
      params: query,
    });
  },
};