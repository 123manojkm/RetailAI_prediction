from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base


class CustomerSegment(Base):
    __tablename__ = "customer_segments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    segment_name: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    customer_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    avg_recency: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    avg_frequency: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    avg_monetary: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    revenue_contribution: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<CustomerSegment name='{self.segment_name}' count={self.customer_count}>"
