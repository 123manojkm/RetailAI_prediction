import api from './api';
import type {
  LoginRequest, TokenResponse, User, DashboardMetrics,
  DataUpload, DataQualityReport, PaginatedResponse,
  ForecastResponse, CustomerResponse,
  RecommendationResponse, InventoryItem,
  ComplementaryResponse, CatalogProductItem, BundleQuoteResponse,
} from '../types/api';

// ─── Auth ─────────────────────────────────────────
export const authService = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },
  me: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// ─── Dashboard ────────────────────────────────────
export const dashboardService = {
  getMetrics: async (startDate?: string, endDate?: string): Promise<DashboardMetrics> => {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    const res = await api.get('/dashboard', { params });
    return res.data;
  },
  getSalesAnalytics: async (params?: Record<string, string>) => {
    const res = await api.get('/analytics/sales', { params });
    return res.data;
  },
  getProductAnalytics: async (params?: Record<string, string>) => {
    const res = await api.get('/analytics/products', { params });
    return res.data;
  },
  getCategoryAnalytics: async (params?: Record<string, string>) => {
    const res = await api.get('/analytics/categories', { params });
    return res.data;
  },
  getStoreAnalytics: async () => {
    const res = await api.get('/analytics/stores');
    return res.data;
  },
  getChannelAnalytics: async () => {
    const res = await api.get('/analytics/channels');
    return res.data;
  },
};

// ─── Data ─────────────────────────────────────────
export const dataService = {
  upload: async (file: File, isSynthetic = false) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/data/upload?is_synthetic=${isSynthetic}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as DataUpload;
  },
  listUploads: async (page = 1, pageSize = 20) => {
    const res = await api.get('/data/uploads', { params: { page, page_size: pageSize } });
    return res.data as PaginatedResponse<DataUpload>;
  },
  getQuality: async (uploadId: number) => {
    const res = await api.get(`/data/quality/${uploadId}`);
    return res.data as DataQualityReport;
  },
  getPreview: async (uploadId: number, limit = 15) => {
    const res = await api.get(`/data/preview/${uploadId}`, { params: { limit } });
    return res.data;
  },
  startProcessing: async (jobType: string, params?: Record<string, any>) => {
    const res = await api.post('/data/process', { job_type: jobType, parameters: params });
    return res.data;
  },
  getJobStatus: async (jobId: number) => {
    const res = await api.get(`/data/jobs/${jobId}`);
    return res.data;
  },
  processUpload: async (uploadId: number) => {
    const res = await api.post(`/data/process-upload/${uploadId}`);
    return res.data;
  },
  downloadSampleTemplate: async () => {
    const res = await api.get('/data/sample-template', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'retail_transactions_template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  },
};

// ─── Forecasting ──────────────────────────────────
export const forecastService = {
  train: async (data: any = { horizon_days: 30, model_type: 'xgboost' }) => {
    const res = await api.post('/forecast/train', data);
    return res.data;
  },
  getForecasts: async (params?: Record<string, any>) => {
    const res = await api.get('/forecast', { params });
    return res.data;
  },
  getProductForecast: async (productId: string, horizonDays = 30) => {
    const res = await api.get(`/forecast/products/${productId}`, { params: { horizon_days: horizonDays } });
    return res.data as ForecastResponse;
  },
  getModelEvaluation: async () => {
    const res = await api.get('/models/evaluation');
    return res.data;
  },
};

// ─── Customers ────────────────────────────────────
export const customerService = {
  list: async (page = 1, pageSize = 20, segment?: string) => {
    const params: any = { page, page_size: pageSize };
    if (segment) params.segment = segment;
    const res = await api.get('/customers', { params });
    return res.data as PaginatedResponse<CustomerResponse>;
  },
  getById: async (customerId: string) => {
    const res = await api.get(`/customers/${customerId}`);
    return res.data;
  },
  getSegments: async () => {
    const res = await api.get('/customers/segments');
    return res.data;
  },
  trainSegmentation: async (data: any = { n_clusters: 4, recalculate_rfm: true }) => {
    const res = await api.post('/customers/segments/train', data);
    return res.data;
  },
};

// ─── Recommendations ──────────────────────────────
export const recommendationService = {
  getForCustomer: async (customerId: string) => {
    const res = await api.get(`/recommendations/${customerId}`);
    return res.data as RecommendationResponse;
  },
  train: async (data: any = { min_support: 0.01, min_confidence: 0.1 }) => {
    const res = await api.post('/recommendations/train', data);
    return res.data;
  },
  getCatalog: async (search?: string) => {
    const res = await api.get('/recommendations/catalog', { params: search ? { search } : {} });
    return res.data as CatalogProductItem[];
  },
  getComplementary: async (productId: string) => {
    const res = await api.get(`/recommendations/complementary/${productId}`);
    return res.data as ComplementaryResponse;
  },
  getBundleQuote: async (productId: string, selectedAccessoryIds: string[]) => {
    const res = await api.post('/recommendations/bundle-quote', {
      product_id: productId,
      selected_accessory_ids: selectedAccessoryIds,
    });
    return res.data as BundleQuoteResponse;
  },
  getAIRecommendations: async (productName: string, apiKey?: string) => {
    const res = await api.post('/recommendations/ai-recommend', {
      product_name: productName,
      api_key: apiKey || undefined,
    });
    return res.data as ComplementaryResponse & { ai_model?: string };
  },
};

// ─── Inventory ────────────────────────────────────
export const inventoryService = {
  list: async (params?: Record<string, any>) => {
    const res = await api.get('/inventory', { params });
    return res.data;
  },
  getRisk: async () => {
    const res = await api.get('/inventory/risk');
    return res.data;
  },
  getProduct: async (productId: string) => {
    const res = await api.get(`/inventory/${productId}`);
    return res.data as InventoryItem;
  },
};

// ─── Notifications ────────────────────────────────
export const notificationService = {
  list: async (params?: Record<string, any>) => {
    const res = await api.get('/notifications', { params });
    return res.data;
  },
};
