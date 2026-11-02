from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    type: Mapped[str] = mapped_column(
        String(20), default="info", nullable=False
    )  # info, warning, error, success
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(
        String(50), default="system", index=True, nullable=False
    )  # inventory, forecast, segment, system
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, index=True, nullable=False)
    data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON extra data
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Notification id={self.id} category='{self.category}' read={self.is_read}>"
