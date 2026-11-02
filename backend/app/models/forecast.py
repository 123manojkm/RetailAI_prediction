from datetime import date, datetime, timezone
from sqlalchemy import Date, DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database.base import Base


class Forecast(Base):
    __tablename__ = "forecasts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    forecast_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    predicted_demand: Mapped[float] = mapped_column(Float, nullable=False)
    horizon_days: Mapped[int] = mapped_column(Integer, default=7, nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), default="1.0.0", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Forecast product_id='{self.product_id}' date={self.forecast_date} predicted={self.predicted_demand}>"
