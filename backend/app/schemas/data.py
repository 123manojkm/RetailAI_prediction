from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DataUploadResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: int
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    status: str
    error_message: Optional[str] = None
    uploaded_by: Optional[int] = None
    upload_type: str = "csv"
    is_synthetic: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ColumnQualityMetric(BaseModel):
    column_name: str
    data_type: str
    missing_count: int
    missing_percentage: float
    unique_count: int
    min_value: Optional[Any] = None
    max_value: Optional[Any] = None


class DataQualityReport(BaseModel):
    upload_id: int
    filename: str
    total_rows: int
    total_columns: int
    duplicate_rows: int
    overall_quality_score: float  # 0 to 100
    columns_metrics: List[ColumnQualityMetric] = Field(default_factory=list)
    detected_issues: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


class DatasetPreview(BaseModel):
    filename: str
    columns: List[str]
    rows: List[Dict[str, Any]]
    total_rows: int
    preview_limit: int


class ProcessingJobCreate(BaseModel):
    job_type: str = Field(..., description="data_processing, model_training, feature_engineering")
    upload_id: Optional[int] = None
    parameters: Optional[Dict[str, Any]] = None


class ProcessingJobStatus(BaseModel):
    id: int
    job_type: str
    status: str
    progress: float
    input_rows: Optional[int] = None
    output_rows: Optional[int] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[float] = None
    parameters: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
