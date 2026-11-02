from datetime import date, datetime, timezone
from typing import Optional
from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    customer_id: Mapped[str] = mapped_column(
        String(100), ForeignKey("customers.customer_id", ondelete="CASCADE"), index=True, nullable=False
    )
    product_id: Mapped[str] = mapped_column(
        String(100), ForeignKey("products.product_id", ondelete="CASCADE"), index=True, nullable=False
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    discount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_amount: Mapped[float] = mapped_column(Float, nullable=False)
    transaction_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    store_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    location: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    sales_channel: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships
    customer: Mapped["Customer"] = relationship("Customer", back_populates="transactions")
    product: Mapped["Product"] = relationship("Product", back_populates="transactions")

    def __repr__(self) -> str:
        return f"<Transaction transaction_id='{self.transaction_id}' amount={self.total_amount}>"
