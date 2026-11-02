from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.dashboard import (
    CategoryAnalyticsItem,
    ChannelAnalyticsItem,
    DashboardMetrics,
    ProductAnalyticsItem,
    SalesAnalyticsSummary,
    StoreAnalyticsItem,
)
from app.services.analytics_service import AnalyticsService
from app.services.dashboard_service import DashboardService

router = APIRouter(tags=["Dashboard & Analytics"])


@router.get("/dashboard", response_model=DashboardMetrics)
def get_dashboard(
    start_date: Optional[date] = Query(None, description="Filter starting from this transaction date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Filter ending on this transaction date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardMetrics:
    """
    Retrieve real-time aggregate dashboard metrics computed directly from database records.
    Returns total revenue, order count, customer volume, catalog size, trends, top products, and recent activity.
    """
    return DashboardService.get_dashboard_metrics(db, start_date=start_date, end_date=end_date)


@router.get("/analytics/sales", response_model=SalesAnalyticsSummary)
def get_sales_analytics(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SalesAnalyticsSummary:
    """
    Retrieve aggregated sales analytics with daily trend breakdown over the specified date window.
    """
    return AnalyticsService.get_sales_analytics(db, start_date=start_date, end_date=end_date)


@router.get("/analytics/products", response_model=List[ProductAnalyticsItem])
def get_product_analytics(
    limit: int = Query(50, ge=1, le=500, description="Max products to return"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[ProductAnalyticsItem]:
    """
    Retrieve product sales performance metrics including units sold, total revenue, and average discount.
    """
    return AnalyticsService.get_product_analytics(db, limit=limit, category=category)


@router.get("/analytics/categories", response_model=List[CategoryAnalyticsItem])
def get_category_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[CategoryAnalyticsItem]:
    """
    Retrieve sales volume, product counts, and market share percentage grouped by category.
    """
    return AnalyticsService.get_category_analytics(db)


@router.get("/analytics/stores", response_model=List[StoreAnalyticsItem])
def get_store_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[StoreAnalyticsItem]:
    """
    Retrieve revenue, order count, and average order value breakdown by retail store location.
    """
    return AnalyticsService.get_store_analytics(db)


@router.get("/analytics/channels", response_model=List[ChannelAnalyticsItem])
def get_channel_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[ChannelAnalyticsItem]:
    """
    Retrieve revenue and order breakdown across sales channels (e.g. In-Store, Online, Mobile).
    """
    return AnalyticsService.get_channel_analytics(db)
