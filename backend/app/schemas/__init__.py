from app.schemas.auth import LoginRequest, TokenResponse, UserResponse, UserCreate, UserUpdate
from app.schemas.common import MessageResponse, ErrorResponse, PaginatedResponse
from app.schemas.dashboard import (
    DashboardMetrics,
    RevenueTrendPoint,
    TopProductItem,
    CategoryBreakdownItem,
    RecentActivityItem,
    SalesAnalyticsSummary,
    ProductAnalyticsItem,
    CategoryAnalyticsItem,
    StoreAnalyticsItem,
    ChannelAnalyticsItem,
)
from app.schemas.data import (
    DataUploadResponse,
    DataQualityReport,
    DatasetPreview,
    ProcessingJobCreate,
    ProcessingJobStatus,
    ColumnQualityMetric,
)
from app.schemas.forecast import (
    ForecastRequest,
    ForecastResponse,
    ForecastPoint,
    ModelEvaluation,
    TrainForecastResponse,
)
from app.schemas.customer import (
    CustomerResponse,
    CustomerDetail,
    SegmentSummary,
    SegmentTrainRequest,
    SegmentTrainResponse,
)
from app.schemas.recommendation import (
    RecommendationResponse,
    RecommendationItem,
    RecommendationTrainRequest,
    RecommendationTrainResponse,
)
from app.schemas.inventory import (
    InventoryResponse,
    InventoryRiskSummary,
    InventoryDetail,
)
from app.schemas.notification import (
    NotificationResponse,
    NotificationCreate,
)

__all__ = [
    "LoginRequest",
    "TokenResponse",
    "UserResponse",
    "UserCreate",
    "UserUpdate",
    "MessageResponse",
    "ErrorResponse",
    "PaginatedResponse",
    "DashboardMetrics",
    "RevenueTrendPoint",
    "TopProductItem",
    "CategoryBreakdownItem",
    "RecentActivityItem",
    "SalesAnalyticsSummary",
    "ProductAnalyticsItem",
    "CategoryAnalyticsItem",
    "StoreAnalyticsItem",
    "ChannelAnalyticsItem",
    "DataUploadResponse",
    "DataQualityReport",
    "DatasetPreview",
    "ProcessingJobCreate",
    "ProcessingJobStatus",
    "ColumnQualityMetric",
    "ForecastRequest",
    "ForecastResponse",
    "ForecastPoint",
    "ModelEvaluation",
    "TrainForecastResponse",
    "CustomerResponse",
    "CustomerDetail",
    "SegmentSummary",
    "SegmentTrainRequest",
    "SegmentTrainResponse",
    "RecommendationResponse",
    "RecommendationItem",
    "RecommendationTrainRequest",
    "RecommendationTrainResponse",
    "InventoryResponse",
    "InventoryRiskSummary",
    "InventoryDetail",
    "NotificationResponse",
    "NotificationCreate",
]
