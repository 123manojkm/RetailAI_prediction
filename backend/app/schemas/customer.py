from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class CustomerResponse(BaseModel):
    id: int
    customer_id: str
    segment: Optional[str] = None
    total_spent: float
    total_orders: int
    avg_order_value: float
    first_purchase: Optional[datetime] = None
    last_purchase: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CustomerTransactionItem(BaseModel):
    transaction_id: str
    product_id: str
    product_name: Optional[str] = None
    quantity: int
    unit_price: float
    total_amount: float
    transaction_date: str
    store_id: str


class CustomerDetail(BaseModel):
    customer: CustomerResponse
    transactions: List[CustomerTransactionItem] = Field(default_factory=list)
    recommendations: List[Dict[str, Any]] = Field(default_factory=list)


class SegmentSummary(BaseModel):
    id: Optional[int] = None
    segment_name: str
    customer_count: int
    avg_recency: float
    avg_frequency: float
    avg_monetary: float
    revenue_contribution: float
    total_revenue: float = 0.0
    revenue_contribution_pct: float = 0.0
    description: Optional[str] = None
    percentage_of_customers: float = 0.0

    model_config = ConfigDict(from_attributes=True)


class SegmentTrainRequest(BaseModel):
    n_clusters: int = Field(4, ge=2, le=10, description="Target number of RFM customer clusters")
    recalculate_rfm: bool = Field(True, description="Recalculate customer RFM stats from transactions")


class SegmentTrainResponse(BaseModel):
    message: str
    n_clusters: int
    silhouette_score: Optional[float] = None
    segments: List[SegmentSummary] = Field(default_factory=list)
