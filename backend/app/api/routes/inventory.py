from typing import Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
import pandas as pd
import sys
import os

from app.core.security import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.models.transaction import Transaction
from app.models.inventory import Inventory as InventoryModel
from app.models.product import Product
from app.core.logging import logger

router = APIRouter(prefix="/inventory", tags=["Inventory"])


def _calculate_inventory(db: Session):
    """Efficiently compute inventory metrics using SQL aggregation."""
    # Check if data exists
    txn_count = db.query(func.count(Transaction.id)).scalar()
    if not txn_count:
        return []

    # 1. SQL-level daily demand aggregation (100x faster than reading 100k full ORM rows)
    daily_rows = db.query(
        Transaction.product_id,
        Transaction.transaction_date,
        func.sum(Transaction.quantity).label("quantity")
    ).group_by(Transaction.product_id, Transaction.transaction_date).all()

    df = pd.DataFrame([{
        "product_id": r.product_id,
        "transaction_date": str(r.transaction_date),
        "quantity": float(r.quantity),
    } for r in daily_rows])

    # 2. Enrich with product details
    products = {p.product_id: p for p in db.query(Product).all()}
    df["product_name"] = df["product_id"].map(lambda pid: products[pid].product_name if pid in products else pid)
    df["category"] = df["product_id"].map(lambda pid: products[pid].category if pid in products else "")

    # 3. Current inventory levels (only 48 rows)
    inv_records = db.query(InventoryModel).all()
    inv_df = pd.DataFrame([{
        "product_id": i.product_id,
        "current_stock": i.current_stock,
        "supplier_lead_time": i.supplier_lead_time,
    } for i in inv_records])

    # 4. Use formula-based InventoryIntelligence
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../.."))
    from ml.inventory.inventory_intelligence import InventoryIntelligence

    calculator = InventoryIntelligence(service_level=0.95)
    return calculator.compute_product_metrics(df, inventory_df=inv_df)


@router.get("")
def get_inventory(
    category: Optional[str] = None,
    risk_level: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get inventory status with risk analysis calculated from actual transaction data."""
    results = _calculate_inventory(db)
    if not results:
        return {
            "items": [],
            "total": 0,
            "page": page,
            "page_size": page_size,
            "message": "No transaction data available.",
        }

    # Apply filters
    if category:
        results = [r for r in results if r.get("category") == category]
    if risk_level:
        results = [r for r in results if r.get("risk_level") == risk_level]

    total = len(results)
    start = (page - 1) * page_size
    paginated = results[start:start + page_size]

    return {
        "items": paginated,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size if total > 0 else 0,
    }


@router.get("/risk")
def get_inventory_risk(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get inventory risk summary using rule-based assessment."""
    results = _calculate_inventory(db)
    if not results:
        return {
            "total_products": 0,
            "risk_distribution": {"critical": 0, "high": 0, "medium": 0, "low": 0},
            "message": "No data available for risk analysis.",
            "risk_method": "rule_based",
        }

    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../.."))
    from ml.inventory.inventory_intelligence import InventoryIntelligence

    calculator = InventoryIntelligence(service_level=0.95)
    return calculator.get_risk_summary(results)


@router.get("/{product_id}")
def get_inventory_detail(
    product_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get detailed inventory analysis for a specific product."""
    product = db.query(Product).filter(Product.product_id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

    results = _calculate_inventory(db)
    matching = [r for r in results if r.get("product_id") == product_id]

    if matching:
        return matching[0]
    return {"product_id": product_id, "product_name": product.product_name, "message": "No inventory metrics found"}
