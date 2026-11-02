from datetime import date
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class RevenueTrendPoint(BaseModel):
    date: str
    revenue: float
    orders: int
    avg_order_value: float = 0.0


class TopProductItem(BaseModel):
    product_id: str
    product_name: str
    category: str
    units_sold: int
    revenue: float


class CategoryBreakdownItem(BaseModel):
    category: str
    revenue: float
    orders: int
    percentage: float


class RecentActivityItem(BaseModel):
    id: int
    transaction_id: str
    customer_id: str
    total_amount: float
    transaction_date: str
    store_id: str


class DashboardMetrics(BaseModel):
    total_revenue: float = 0.0
    total_orders: int = 0
    unique_customers: int = 0
    total_products: int = 0
    avg_order_value: float = 0.0
    revenue_trend: List[RevenueTrendPoint] = Field(default_factory=list)
    top_products: List[TopProductItem] = Field(default_factory=list)
    category_breakdown: List[CategoryBreakdownItem] = Field(default_factory=list)
    recent_activity: List[RecentActivityItem] = Field(default_factory=list)


class SalesAnalyticsSummary(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    total_revenue: float = 0.0
    total_units: int = 0
    total_orders: int = 0
    avg_discount_rate: float = 0.0
    trends: List[RevenueTrendPoint] = Field(default_factory=list)


class ProductAnalyticsItem(BaseModel):
    product_id: str
    product_name: str
    category: str
    unit_price: float
    total_units_sold: int
    total_revenue: float
    avg_discount: float


class CategoryAnalyticsItem(BaseModel):
    category: str
    total_products: int
    total_units_sold: int
    total_revenue: float
    market_share_percentage: float


class StoreAnalyticsItem(BaseModel):
    store_id: str
    location: Optional[str] = None
    total_revenue: float
    total_orders: int
    avg_order_value: float


class ChannelAnalyticsItem(BaseModel):
    sales_channel: str
    total_revenue: float
    total_orders: int
    percentage: float
