from typing import Optional
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import CommonBase


class DataUpload(CommonBase):
    __tablename__ = "data_uploads"

    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    row_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    column_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(
        String(50), default="uploaded", index=True, nullable=False
    )  # uploaded, validating, validated, processing, processed, failed
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    uploaded_by: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    upload_type: Mapped[str] = mapped_column(String(50), default="csv", nullable=False)
    is_synthetic: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User")

    def __repr__(self) -> str:
        return f"<DataUpload id={self.id} filename='{self.filename}' status='{self.status}'>"
