from datetime import datetime
from typing import Optional, List
from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import CommonBase


class Customer(CommonBase):
    __tablename__ = "customers"

    customer_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    segment: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    total_spent: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_orders: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    avg_order_value: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    first_purchase: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    last_purchase: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="customer")

    def __repr__(self) -> str:
        return f"<Customer customer_id='{self.customer_id}' segment='{self.segment}' total_spent={self.total_spent}>"
