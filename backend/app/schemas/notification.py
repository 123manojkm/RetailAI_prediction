from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class NotificationResponse(BaseModel):
    id: int
    type: str
    title: str
    message: str
    category: str
    is_read: bool
    data: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationCreate(BaseModel):
    type: str = "info"
    title: str
    message: str
    category: str = "system"
    data: Optional[str] = None
