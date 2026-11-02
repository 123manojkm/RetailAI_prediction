from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    customer_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    product_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    reason: Mapped[str] = mapped_column(String(255), default="Frequently bought together", nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), default="1.0.0", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Recommendation customer_id='{self.customer_id}' product_id='{self.product_id}' score={self.score}>"
