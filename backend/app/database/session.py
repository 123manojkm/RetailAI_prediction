import os
from pathlib import Path
from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# If using SQLite with relative path, ensure directory exists
database_url = settings.DATABASE_URL
connect_args = {}

if database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    connect_args["timeout"] = 120.0  # Allow 120s for lock waits
    # If path is sqlite:///./data/retail_ai.db or similar, ensure directory exists
    sqlite_path_str = database_url.replace("sqlite:///", "")
    sqlite_path = Path(sqlite_path_str)
    if not sqlite_path.is_absolute():
        project_root = Path(__file__).resolve().parent.parent.parent.parent
        sqlite_path = project_root / sqlite_path
        # Normalize the database_url for Windows
        database_url = f"sqlite:///{sqlite_path.as_posix()}"
    sqlite_path.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(
    database_url,
    connect_args=connect_args,
    echo=False,
    future=True,
)

if database_url.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA busy_timeout=120000")
        cursor.close()

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional SQLAlchemy session per request.
    Rolls back transaction automatically if an unhandled exception occurs.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
