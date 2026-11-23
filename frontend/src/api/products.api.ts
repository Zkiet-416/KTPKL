import axios from 'axios';

export interface ProductRecord {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  unit?: string;
  sellingPrice?: number | string;
  salePrice?: number | string;
  purchasePrice?: number | string;
  minStock?: number;
  stockQuantity: number;
  description?: string | null;
  isActive?: boolean;
  category?: {
    id: number;
    name: string;
  } | null;
}

export interface ProductPayload {
  code: string;
  name: string;
  categoryId: number;
  unit?: string;
  salePrice: number;
  stockQuantity?: number;
  description?: string | null;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: number;
}

export interface ProductListResponse {
  data: ProductRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryOption {
  id: number;
  name: string;
}

const CATEGORIES_STORAGE_KEY = 'wms_product_categories_v1';

const DEFAULT_CATEGORIES: CategoryOption[] = [
  { id: 1, name: 'Ốp lưng & Bao da' },
  { id: 2, name: 'Cáp sạc & Củ sạc' },
  { id: 3, name: 'Kính cường lực' },
  { id: 4, name: 'Tai nghe & Pin dự phòng' },
];

export function getProductPrice(product: Partial<ProductRecord>): number {
  const raw = product.sellingPrice ?? product.salePrice ?? 0;
  const num = Number(raw);
  return Number.isNaN(num) ? 0 : num;
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

export function getStoredCategories(): CategoryOption[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!raw) return DEFAULT_CATEGORIES;
    const parsed = JSON.parse(raw) as CategoryOption[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveStoredCategories(categories: CategoryOption[]): void {
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
}

export const productsApi = {
  async getProducts(params: ProductQueryParams = {}): Promise<ProductListResponse> {
    const query: Record<string, unknown> = {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
    };
    if (params.search?.trim()) {
      query.search = params.search.trim();
    }
    if (params.categoryId && params.categoryId > 0) {
      query.categoryId = params.categoryId;
    }

    const raw = await requestWithFallback<ProductListResponse | ProductRecord[]>(
      'get',
      '/products',
      { params: query },
    );

    if (Array.isArray(raw)) {
      const limit = Number(query.limit) || 20;
      return {
        data: raw,
        total: raw.length,
        page: Number(query.page) || 1,
        limit,
        totalPages: Math.max(1, Math.ceil(raw.length / limit)),
      };
    }

    return {
      data: Array.isArray(raw?.data) ? raw.data : [],
      total: Number(raw?.total ?? 0),
      page: Number(raw?.page ?? query.page ?? 1),
      limit: Number(raw?.limit ?? query.limit ?? 20),
      totalPages: Math.max(1, Number(raw?.totalPages ?? 1)),
    };
  },

  async createProduct(payload: ProductPayload): Promise<ProductRecord> {
    return requestWithFallback<ProductRecord>('post', '/products', { data: payload });
  },

  async updateProduct(id: number, payload: Partial<ProductPayload>): Promise<ProductRecord> {
    return requestWithFallback<ProductRecord>('put', `/products/${id}`, { data: payload });
  },

  async deleteProduct(id: number): Promise<void> {
    await requestWithFallback<void>('delete', `/products/${id}`);
  },
};