// API Types matching backend Pydantic schemas

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  role?: string;
  username?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  orders: number;
  avg_order_value: number;
}

export interface TopProductItem {
  product_id: string;
  product_name: string;
  category: string;
  units_sold: number;
  revenue: number;
}

export interface CategoryBreakdownItem {
  category: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface DashboardMetrics {
  total_revenue: number;
  total_orders: number;
  unique_customers: number;
  total_products: number;
  avg_order_value: number;
  revenue_trend: RevenueTrendPoint[];
  top_products: TopProductItem[];
  category_breakdown: CategoryBreakdownItem[];
  recent_activity: any[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface DataUpload {
  id: number;
  filename: string;
  original_filename: string;
  file_size: number;
  row_count?: number;
  column_count?: number;
  status: string;
  error_message?: string;
  is_synthetic: boolean;
  created_at: string;
  updated_at: string;
}

export interface DataQualityReport {
  upload_id: number;
  filename: string;
  total_rows: number;
  total_columns: number;
  duplicate_rows: number;
  overall_quality_score: number;
  columns_metrics: ColumnQualityMetric[];
  detected_issues: string[];
  recommendations: string[];
}

export interface ColumnQualityMetric {
  column_name: string;
  data_type: string;
  missing_count: number;
  missing_percentage: number;
  unique_count: number;
  min_value?: any;
  max_value?: any;
}

export interface ForecastPoint {
  date: string;
  predicted_demand: number;
}

export interface ForecastResponse {
  product_id: string;
  historical: { date: string; demand: number }[];
  predictions: ForecastPoint[];
  total_predicted_demand: number;
  avg_daily_predicted: number;
  expected_growth_pct: number;
  horizon_days: number;
  model_version?: string;
  error?: string;
}

export interface CustomerResponse {
  id: number;
  customer_id: string;
  segment?: string;
  total_spent: number;
  total_orders: number;
  avg_order_value: number;
  first_purchase?: string;
  last_purchase?: string;
}

export interface SegmentSummary {
  segment_id: number;
  segment_name: string;
  customer_count: number;
  avg_recency: number;
  avg_frequency: number;
  avg_monetary: number;
  total_revenue: number;
  revenue_contribution_pct: number;
  avg_order_value: number;
}

export interface RecommendationItem {
  product_id: string;
  product_name: string;
  category: string;
  score: number;
  reason: string;
}

export interface RecommendationResponse {
  customer_id: string;
  recommendations: RecommendationItem[];
  method: string;
  is_cold_start: boolean;
  model_version?: string;
}

export interface AccessoryItem {
  accessory_id: string;
  product_name: string;
  category: string;
  unit_price: number;
  rating: number;
  review_count: number;
  co_purchase_rate: number;
  requirement_type: string;
  compatibility: string;
  review_quote: string;
  reviewer_name: string;
  helpful_votes: number;
}

export interface BaseProductInfo {
  product_id: string;
  product_name: string;
  category: string;
  unit_price: number;
  rating: number;
  review_count: number;
  description: string;
}

export interface ComplementaryResponse {
  product: BaseProductInfo;
  accessories: AccessoryItem[];
  bundle_discount_pct: number;
  full_setup_price: number;
  bundled_setup_price: number;
  total_savings: number;
  total_reviews_analyzed: number;
}

export interface CatalogProductItem {
  product_id: string;
  product_name: string;
  category: string;
  unit_price: number;
  rating: number;
  review_count: number;
  accessories_count: number;
}

export interface BundleQuoteResponse {
  product_id: string;
  product_name: string;
  base_price: number;
  selected_accessories_count: number;
  accessories_subtotal: number;
  gross_total: number;
  discount_pct: number;
  discount_amount: number;
  final_bundle_price: number;
  savings: number;
  items: Array<{
    id: string;
    name: string;
    type: string;
    price: number;
  }>;
}


export interface InventoryItem {
  product_id: string;
  product_name: string;
  category: string;
  current_stock: number;
  avg_daily_demand: number;
  forecast_daily_demand: number;
  supplier_lead_time: number;
  safety_stock: number;
  reorder_point: number;
  target_stock: number;
  recommended_reorder_qty: number;
  days_of_supply?: number;
  risk_level: string;
  risk_score: number;
  risk_method: string;
}

export interface ModelEvaluation {
  model_name: string;
  model_version: string;
  metrics: Record<string, number | null>;
  training_date: string;
  training_samples: number;
}

export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  category: string;
  is_read: boolean;
  created_at: string;
}
