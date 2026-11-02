from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
def get_notifications(
    category: Optional[str] = None,
    is_read: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get notifications with optional filtering by category and read status."""
    query = db.query(Notification)

    if category:
        query = query.filter(Notification.category == category)
    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)

    page_num = page if isinstance(page, int) else getattr(page, "default", 1)
    page_sz = page_size if isinstance(page_size, int) else getattr(page_size, "default", 20)

    total = query.count()
    notifications = (
        query.order_by(desc(Notification.created_at))
        .offset((page_num - 1) * page_sz)
        .limit(page_sz)
        .all()
    )

    return {
        "items": [
            {
                "id": n.id,
                "type": n.type,
                "title": n.title,
                "message": n.message,
                "category": n.category,
                "is_read": n.is_read,
                "created_at": str(n.created_at),
            }
            for n in notifications
        ],
        "total": total,
        "page": page_num,
        "page_size": page_sz,
        "pages": (total + page_sz - 1) // page_sz if total > 0 else 0,
    }


@router.put("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Mark a notification as read."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Notification not found")

    notification.is_read = True
    db.commit()
    return {"message": "Notification marked as read"}
