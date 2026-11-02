from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class RecommendationItem(BaseModel):
    product_id: str
    product_name: str
    category: str
    unit_price: float
    score: float
    reason: str

    model_config = ConfigDict(from_attributes=True)


class RecommendationResponse(BaseModel):
    customer_id: str
    recommendations: List[RecommendationItem] = Field(default_factory=list)
    model_version: str = "1.0.0"
    method: Optional[str] = "collaborative_filtering"
    is_cold_start: Optional[bool] = False


class RecommendationTrainRequest(BaseModel):
    min_support: float = Field(0.01, ge=0.001, le=1.0)
    min_confidence: float = Field(0.1, ge=0.01, le=1.0)


class RecommendationTrainResponse(BaseModel):
    message: str
    model_version: str
    rules_generated: int
    recommendations_stored: int


# ─── Complementary Accessory Schemas ("Frequently Bought Together") ─────────

class AccessoryItem(BaseModel):
    accessory_id: str
    product_name: str
    category: str
    unit_price: float
    rating: float
    review_count: int
    co_purchase_rate: float # e.g. 92.4%
    requirement_type: str  # e.g. "Essential Accessory", "Recommended Setup"
    compatibility: str
    review_quote: str
    reviewer_name: str
    helpful_votes: int


class BaseProductInfo(BaseModel):
    product_id: str
    product_name: str
    category: str
    unit_price: float
    rating: float
    review_count: int
    description: str


class ComplementaryResponse(BaseModel):
    product: BaseProductInfo
    accessories: List[AccessoryItem] = Field(default_factory=list)
    bundle_discount_pct: float = 15.0
    full_setup_price: float
    bundled_setup_price: float
    total_savings: float
    total_reviews_analyzed: int
    currency: Optional[str] = "INR"
    currency_symbol: Optional[str] = "₹"
    ai_model: Optional[str] = None


class BundleQuoteRequest(BaseModel):
    product_id: str
    selected_accessory_ids: List[str]


class BundleQuoteResponse(BaseModel):
    product_id: str
    product_name: str
    base_price: float
    selected_accessories_count: int
    accessories_subtotal: float
    gross_total: float
    discount_pct: float
    discount_amount: float
    final_bundle_price: float
    savings: float
    items: List[Dict[str, Any]]


class AIRecommendRequest(BaseModel):
    product_name: str
    api_key: Optional[str] = None

