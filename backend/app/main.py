"""
AI-Based Predictive Analytics for Retail
FastAPI Main Application

Endpoints: /health, /api/v1/auth, /api/v1/dashboard, /api/v1/analytics,
           /api/v1/data, /api/v1/forecast, /api/v1/customers, /api/v1/recommendations,
           /api/v1/inventory, /api/v1/notifications, /api/v1/models
"""

import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure project root is on path for ML module imports
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from app.core.config import settings
from app.core.logging import logger
from app.database.session import engine, SessionLocal
from app.database.base import Base

# Import all models so they're registered with Base.metadata
from app.models.user import User
from app.models.customer import Customer
from app.models.product import Product
from app.models.transaction import Transaction
from app.models.inventory import Inventory
from app.models.customer_segment import CustomerSegment
from app.models.forecast import Forecast
from app.models.recommendation import Recommendation
from app.models.model_metric import ModelMetric
from app.models.data_upload import DataUpload
from app.models.processing_job import ProcessingJob
from app.models.notification import Notification

# Import routes
from app.api.routes import health, auth, dashboard, data, forecast, customers, recommendations, inventory, notifications

from app.core.security import get_password_hash


def create_default_admin(db):
    """Create default admin user for development. Not for production use."""
    from sqlalchemy import select
    existing = db.execute(select(User).where(User.username == "admin")).scalar_one_or_none()
    if not existing:
        admin = User(
            username="admin",
            email="admin@retailai.dev",
            password_hash=get_password_hash("admin123"),
            role="admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        logger.info("Default admin user created (username: admin, password: admin123) - FOR DEVELOPMENT ONLY")
    else:
        logger.info("Admin user already exists")


def ensure_directories():
    """Ensure required data and model directories exist."""
    dirs = [
        settings.resolved_data_dir,
        settings.resolved_data_dir / "raw",
        settings.resolved_data_dir / "processed",
        settings.resolved_data_dir / "sample",
        settings.resolved_model_dir,
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info("Starting AI Retail Analytics Platform...")

    # Create directories
    ensure_directories()

    # Create database tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified")

    # Create default admin user
    db = SessionLocal()
    try:
        create_default_admin(db)
    except Exception as e:
        logger.error(f"Failed to create admin user: {e}")
    finally:
        db.close()

    logger.info("Application startup complete")
    yield
    logger.info("Application shutting down")


# Create FastAPI application
app = FastAPI(
    title="AI Retail Analytics Platform",
    description=(
        "AI-Based Predictive Analytics for Retail: "
        "Demand Forecasting, Customer Segmentation and Product Recommendation"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions without exposing internal details."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": "An unexpected error occurred. Please try again later.",
        },
    )


# Include routers
app.include_router(health.router)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(data.router, prefix=settings.API_V1_STR)
app.include_router(forecast.router, prefix=settings.API_V1_STR)
app.include_router(customers.router, prefix=settings.API_V1_STR)
app.include_router(recommendations.router, prefix=settings.API_V1_STR)
app.include_router(inventory.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "name": "AI Retail Analytics Platform",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "api": f"{settings.API_V1_STR}",
    }
