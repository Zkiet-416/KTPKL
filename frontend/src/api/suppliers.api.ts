import axios from 'axios';

export interface SupplierRecord {
  id: number;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  isActive?: boolean;
}

export interface SupplierPayload {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface SupplierQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'id' | 'name';
  order?: 'ASC' | 'DESC';
}

export interface SupplierListResponse {
  data: SupplierRecord[];
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
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

export const suppliersApi = {
  async getSuppliers(params: SupplierQueryParams = {}): Promise<SupplierListResponse> {
    const query: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      sortBy: params.sortBy ?? 'id',
      order: params.order ?? 'ASC',
    };
    if (params.search?.trim()) {
      query.search = params.search.trim();
    }

    const raw = await requestWithFallback<
      | {
          data?: SupplierRecord[];
          meta?: {
            totalItems?: number;
            currentPage?: number;
            itemsPerPage?: number;
            totalPages?: number;
          };
          total?: number;
          page?: number;
          limit?: number;
          totalPages?: number;
        }
      | SupplierRecord[]
    >('get', '/suppliers', { params: query });

    const limit = Number(query.limit) || 10;
    const page = Number(query.page) || 1;

    if (Array.isArray(raw)) {
      return {
        data: raw,
        totalItems: raw.length,
        currentPage: page,
        itemsPerPage: limit,
        totalPages: Math.max(1, Math.ceil(raw.length / limit)),
      };
    }

    const data = Array.isArray(raw?.data) ? raw.data : [];
    const totalItems = Number(raw?.meta?.totalItems ?? raw?.total ?? data.length);
    const itemsPerPage = Number(raw?.meta?.itemsPerPage ?? raw?.limit ?? limit);
    const currentPage = Number(raw?.meta?.currentPage ?? raw?.page ?? page);
    const totalPages = Math.max(
      1,
      Number(raw?.meta?.totalPages ?? raw?.totalPages ?? Math.ceil(totalItems / itemsPerPage)),
    );

    return {
      data,
      totalItems,
      currentPage,
      itemsPerPage,
      totalPages,
    };
  },

  async createSupplier(payload: SupplierPayload): Promise<SupplierRecord> {
    return requestWithFallback<SupplierRecord>('post', '/suppliers', { data: payload });
  },

  async updateSupplier(id: number, payload: Partial<SupplierPayload>): Promise<SupplierRecord> {
    return requestWithFallback<SupplierRecord>('put', `/suppliers/${id}`, { data: payload });
  },

  async deleteSupplier(id: number): Promise<{ message?: string }> {
    return requestWithFallback<{ message?: string }>('delete', `/suppliers/${id}`);
  },
};