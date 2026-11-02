from fastapi import APIRouter
from sqlalchemy import text
from app.database.session import SessionLocal
from app.core.logging import logger

router = APIRouter(tags=["System"])


@router.get("/health")
def health_check():
    """
    System health check with database connectivity verification.
    Returns service status and database connection state.
    """
    db_status = "disconnected"
    db_error = None

    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
        db_status = "connected"
    except Exception as e:
        db_error = str(e)
        logger.error(f"Database health check failed: {e}")

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "service": "AI Retail Analytics Platform",
        "version": "1.0.0",
        "database": db_status,
        "database_error": db_error,
    }
