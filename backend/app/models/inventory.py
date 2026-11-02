from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class Inventory(Base):
    __tablename__ = "inventories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    product_id: Mapped[str] = mapped_column(
        String(100), ForeignKey("products.product_id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    current_stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reorder_point: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    safety_stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    supplier_lead_time: Mapped[float] = mapped_column(Float, default=7.0, nullable=False)
    demand_variability: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    avg_daily_demand: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(50), default="low", index=True, nullable=False)
    last_updated: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    product: Mapped["Product"] = relationship("Product", back_populates="inventory")

    def __repr__(self) -> str:
        return f"<Inventory product_id='{self.product_id}' stock={self.current_stock} risk='{self.risk_level}'>"
