from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    job_type: Mapped[str] = mapped_column(
        String(50), index=True, nullable=False
    )  # data_processing, model_training, feature_engineering
    status: Mapped[str] = mapped_column(
        String(50), default="pending", index=True, nullable=False
    )  # pending, running, completed, failed
    progress: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    input_rows: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    output_rows: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_seconds: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    parameters: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<ProcessingJob id={self.id} type='{self.job_type}' status='{self.status}' progress={self.progress}>"
