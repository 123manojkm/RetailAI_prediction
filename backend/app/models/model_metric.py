from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base


class ModelMetric(Base):
    __tablename__ = "model_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    model_name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    metric_name: Mapped[str] = mapped_column(String(100), nullable=False)
    metric_value: Mapped[float] = mapped_column(Float, nullable=False)
    training_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    training_samples: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    features_used: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON string
    parameters: Mapped[Optional[str]] = mapped_column(Text, nullable=True)     # JSON string
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<ModelMetric model='{self.model_name}' metric='{self.metric_name}' value={self.metric_value}>"
