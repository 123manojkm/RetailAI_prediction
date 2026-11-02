from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class InventoryResponse(BaseModel):
    id: int
    product_id: str
    product_name: Optional[str] = None
    category: Optional[str] = None
    unit_price: Optional[float] = None
    current_stock: int
    reorder_point: int
    safety_stock: int
    supplier_lead_time: float
    demand_variability: float
    avg_daily_demand: float
    risk_level: str
    last_updated: datetime

    model_config = ConfigDict(from_attributes=True)


class InventoryRiskSummary(BaseModel):
    total_skus: int = 0
    out_of_stock_count: int = 0
    critical_risk_count: int = 0
    high_risk_count: int = 0
    medium_risk_count: int = 0
    low_risk_count: int = 0
    estimated_revenue_at_risk: float = 0.0
    high_risk_products: List[InventoryResponse] = Field(default_factory=list)


class InventoryDetail(BaseModel):
    item: InventoryResponse
    days_of_supply: float
    recommended_order_quantity: int
    stockout_probability_percentage: float
    lead_time_days: float
