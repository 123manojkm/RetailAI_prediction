from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ForecastRequest(BaseModel):
    product_id: Optional[str] = Field(None, description="Optional specific product to forecast. If omitted, all top products.")
    horizon_days: int = Field(7, ge=1, le=90, description="Forecast horizon in days")
    model_type: Optional[str] = Field("xgboost", description="Algorithm to run: xgboost, random_forest, or linear")


class ForecastPoint(BaseModel):
    forecast_date: str
    date: Optional[str] = None
    predicted_demand: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None


class ForecastResponse(BaseModel):
    product_id: str
    product_name: Optional[str] = None
    horizon_days: int
    model_version: str
    predictions: List[ForecastPoint] = Field(default_factory=list)
    historical: List[Dict[str, Any]] = Field(default_factory=list)
    total_predicted_demand: float = 0.0


class ModelEvaluation(BaseModel):
    id: Optional[int] = None
    model_name: str
    model_version: str
    metrics: Dict[str, float]
    training_date: datetime
    training_samples: int
    features_used: List[str] = Field(default_factory=list)
    parameters: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(from_attributes=True)


class TrainForecastResponse(BaseModel):
    message: str
    model_name: str
    model_version: str
    evaluation: Dict[str, float]
    samples_trained: int
