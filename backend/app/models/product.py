from typing import Optional, List
from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import CommonBase


class Product(CommonBase):
    __tablename__ = "products"

    product_id: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    product_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    avg_discount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    total_sold: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    transactions: Mapped[List["Transaction"]] = relationship("Transaction", back_populates="product")
    inventory: Mapped[Optional["Inventory"]] = relationship("Inventory", back_populates="product", uselist=False)

    def __repr__(self) -> str:
        return f"<Product product_id='{self.product_id}' name='{self.product_name}' category='{self.category}'>"
