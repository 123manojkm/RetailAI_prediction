from datetime import date
from typing import List, Optional
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.core.logging import logger
from app.models.customer import Customer
from app.models.product import Product
from app.models.transaction import Transaction
from app.schemas.dashboard import (
    CategoryBreakdownItem,
    DashboardMetrics,
    RecentActivityItem,
    RevenueTrendPoint,
    TopProductItem,
)


class DashboardService:
    @staticmethod
    def get_dashboard_metrics(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> DashboardMetrics:
        """
        Calculates aggregate dashboard metrics from transaction, customer, and product records.
        Returns zeros and empty arrays when no data exists in database.
        """
        # Base filter condition for transactions
        filters = []
        if start_date:
            filters.append(Transaction.transaction_date >= start_date)
        if end_date:
            filters.append(Transaction.transaction_date <= end_date)

        # 1. Total revenue, total orders, unique customers in transactions
        rev_stmt = select(
            func.coalesce(func.sum(Transaction.total_amount), 0.0).label("revenue"),
            func.count(Transaction.id).label("orders"),
            func.count(func.distinct(Transaction.customer_id)).label("unique_customers"),
        )
        if filters:
            rev_stmt = rev_stmt.where(*filters)

        rev_result = db.execute(rev_stmt).one_or_none()
        total_revenue = float(rev_result.revenue) if rev_result and rev_result.revenue else 0.0
        total_orders = int(rev_result.orders) if rev_result and rev_result.orders else 0
        tx_unique_customers = int(rev_result.unique_customers) if rev_result and rev_result.unique_customers else 0

        # Unique customers: fallback to total customer count if no filtered transactions
        if not filters:
            cust_count_stmt = select(func.count(Customer.id))
            unique_customers = db.execute(cust_count_stmt).scalar() or tx_unique_customers
        else:
            unique_customers = tx_unique_customers

        # 2. Total products in catalog
        prod_count_stmt = select(func.count(Product.id))
        total_products = db.execute(prod_count_stmt).scalar() or 0

        # 3. Average order value
        avg_order_value = round(total_revenue / total_orders, 2) if total_orders > 0 else 0.0

        # 4. Revenue Trend (by date)
        trend_stmt = (
            select(
                Transaction.transaction_date,
                func.coalesce(func.sum(Transaction.total_amount), 0.0).label("revenue"),
                func.count(Transaction.id).label("orders"),
            )
            .group_by(Transaction.transaction_date)
            .order_by(Transaction.transaction_date.asc())
        )
        if filters:
            trend_stmt = trend_stmt.where(*filters)

        trend_results = db.execute(trend_stmt).all()
        revenue_trend: List[RevenueTrendPoint] = []
        for r in trend_results:
            r_rev = float(r.revenue)
            r_orders = int(r.orders)
            r_aov = round(r_rev / r_orders, 2) if r_orders > 0 else 0.0
            revenue_trend.append(
                RevenueTrendPoint(
                    date=str(r.transaction_date),
                    revenue=r_rev,
                    orders=r_orders,
                    avg_order_value=r_aov,
                )
            )

        # 5. Top Products (by total revenue or sales)
        top_prod_stmt = (
            select(
                Product.product_id,
                Product.product_name,
                Product.category,
                func.coalesce(func.sum(Transaction.quantity), 0).label("units_sold"),
                func.coalesce(func.sum(Transaction.total_amount), 0.0).label("revenue"),
            )
            .join(Transaction, Product.product_id == Transaction.product_id)
            .group_by(Product.product_id, Product.product_name, Product.category)
            .order_by(desc("revenue"))
            .limit(5)
        )
        if filters:
            top_prod_stmt = top_prod_stmt.where(*filters)

        top_prod_results = db.execute(top_prod_stmt).all()
        top_products: List[TopProductItem] = [
            TopProductItem(
                product_id=row.product_id,
                product_name=row.product_name,
                category=row.category,
                units_sold=int(row.units_sold),
                revenue=round(float(row.revenue), 2),
            )
            for row in top_prod_results
        ]

        # 6. Category Breakdown
        cat_stmt = (
            select(
                Product.category,
                func.coalesce(func.sum(Transaction.total_amount), 0.0).label("revenue"),
                func.count(Transaction.id).label("orders"),
            )
            .join(Transaction, Product.product_id == Transaction.product_id)
            .group_by(Product.category)
            .order_by(desc("revenue"))
        )
        if filters:
            cat_stmt = cat_stmt.where(*filters)

        cat_results = db.execute(cat_stmt).all()
        category_breakdown: List[CategoryBreakdownItem] = []
        for row in cat_results:
            cat_rev = float(row.revenue)
            pct = round((cat_rev / total_revenue) * 100, 2) if total_revenue > 0 else 0.0
            category_breakdown.append(
                CategoryBreakdownItem(
                    category=row.category,
                    revenue=round(cat_rev, 2),
                    orders=int(row.orders),
                    percentage=pct,
                )
            )

        # 7. Recent Activity (last 10 transactions)
        recent_stmt = (
            select(Transaction)
            .order_by(desc(Transaction.transaction_date), desc(Transaction.id))
            .limit(10)
        )
        if filters:
            recent_stmt = recent_stmt.where(*filters)

        recent_txs = db.execute(recent_stmt).scalars().all()
        recent_activity: List[RecentActivityItem] = [
            RecentActivityItem(
                id=tx.id,
                transaction_id=tx.transaction_id,
                customer_id=tx.customer_id,
                total_amount=round(float(tx.total_amount), 2),
                transaction_date=str(tx.transaction_date),
                store_id=tx.store_id,
            )
            for tx in recent_txs
        ]

        return DashboardMetrics(
            total_revenue=round(total_revenue, 2),
            total_orders=total_orders,
            unique_customers=unique_customers,
            total_products=total_products,
            avg_order_value=avg_order_value,
            revenue_trend=revenue_trend,
            top_products=top_products,
            category_breakdown=category_breakdown,
            recent_activity=recent_activity,
        )
