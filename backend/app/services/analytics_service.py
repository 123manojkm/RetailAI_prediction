from datetime import date
from typing import List, Optional
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.transaction import Transaction
from app.schemas.dashboard import (
    CategoryAnalyticsItem,
    ChannelAnalyticsItem,
    ProductAnalyticsItem,
    RevenueTrendPoint,
    SalesAnalyticsSummary,
    StoreAnalyticsItem,
)


class AnalyticsService:
    @staticmethod
    def get_sales_analytics(
        db: Session,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
    ) -> SalesAnalyticsSummary:
        """
        Computes detailed sales analytics and daily sales velocity from database.
        """
        filters = []
        if start_date:
            filters.append(Transaction.transaction_date >= start_date)
        if end_date:
            filters.append(Transaction.transaction_date <= end_date)

        summary_stmt = select(
            func.coalesce(func.sum(Transaction.total_amount), 0.0).label("revenue"),
            func.coalesce(func.sum(Transaction.quantity), 0).label("units"),
            func.count(Transaction.id).label("orders"),
            func.coalesce(func.avg(Transaction.discount), 0.0).label("avg_discount"),
        )
        if filters:
            summary_stmt = summary_stmt.where(*filters)

        res = db.execute(summary_stmt).one_or_none()
        total_revenue = float(res.revenue) if res and res.revenue else 0.0
        total_units = int(res.units) if res and res.units else 0
        total_orders = int(res.orders) if res and res.orders else 0
        avg_discount = float(res.avg_discount) if res and res.avg_discount else 0.0

        # Trends
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

        trend_rows = db.execute(trend_stmt).all()
        trends = [
            RevenueTrendPoint(
                date=str(row.transaction_date),
                revenue=round(float(row.revenue), 2),
                orders=int(row.orders),
                avg_order_value=round(float(row.revenue) / int(row.orders), 2) if int(row.orders) > 0 else 0.0,
            )
            for row in trend_rows
        ]

        return SalesAnalyticsSummary(
            start_date=str(start_date) if start_date else None,
            end_date=str(end_date) if end_date else None,
            total_revenue=round(total_revenue, 2),
            total_units=total_units,
            total_orders=total_orders,
            avg_discount_rate=round(avg_discount, 4),
            trends=trends,
        )

    @staticmethod
    def get_product_analytics(
        db: Session,
        limit: int = 50,
        category: Optional[str] = None,
    ) -> List[ProductAnalyticsItem]:
        """
        Aggregates product sales performance metrics from transaction history.
        """
        stmt = (
            select(
                Product.product_id,
                Product.product_name,
                Product.category,
                Product.unit_price,
                func.coalesce(func.sum(Transaction.quantity), 0).label("units_sold"),
                func.coalesce(func.sum(Transaction.total_amount), 0.0).label("revenue"),
                func.coalesce(func.avg(Transaction.discount), 0.0).label("avg_discount"),
            )
            .outerjoin(Transaction, Product.product_id == Transaction.product_id)
            .group_by(Product.product_id, Product.product_name, Product.category, Product.unit_price)
            .order_by(desc("revenue"))
            .limit(limit)
        )
        if category:
            stmt = stmt.where(Product.category == category)

        rows = db.execute(stmt).all()
        return [
            ProductAnalyticsItem(
                product_id=row.product_id,
                product_name=row.product_name,
                category=row.category,
                unit_price=float(row.unit_price),
                total_units_sold=int(row.units_sold),
                total_revenue=round(float(row.revenue), 2),
                avg_discount=round(float(row.avg_discount), 4),
            )
            for row in rows
        ]

    @staticmethod
    def get_category_analytics(db: Session) -> List[CategoryAnalyticsItem]:
        """
        Aggregates sales and catalog metrics across all product categories.
        """
        # Compute total store revenue for market share calculation
        total_rev_res = db.execute(select(func.coalesce(func.sum(Transaction.total_amount), 0.0))).scalar() or 0.0
        total_store_revenue = float(total_rev_res)

        stmt = (
            select(
                Product.category,
                func.count(func.distinct(Product.id)).label("total_products"),
                func.coalesce(func.sum(Transaction.quantity), 0).label("units_sold"),
                func.coalesce(func.sum(Transaction.total_amount), 0.0).label("revenue"),
            )
            .outerjoin(Transaction, Product.product_id == Transaction.product_id)
            .group_by(Product.category)
            .order_by(desc("revenue"))
        )
        rows = db.execute(stmt).all()

        results = []
        for row in rows:
            rev = float(row.revenue)
            share = round((rev / total_store_revenue) * 100, 2) if total_store_revenue > 0 else 0.0
            results.append(
                CategoryAnalyticsItem(
                    category=row.category,
                    total_products=int(row.total_products),
                    total_units_sold=int(row.units_sold),
                    total_revenue=round(rev, 2),
                    market_share_percentage=share,
                )
            )
        return results

    @staticmethod
    def get_store_analytics(db: Session) -> List[StoreAnalyticsItem]:
        """
        Computes store location performance metrics.
        """
        stmt = (
            select(
                Transaction.store_id,
                func.max(Transaction.location).label("location"),
                func.coalesce(func.sum(Transaction.total_amount), 0.0).label("revenue"),
                func.count(Transaction.id).label("orders"),
            )
            .group_by(Transaction.store_id)
            .order_by(desc("revenue"))
        )
        rows = db.execute(stmt).all()

        return [
            StoreAnalyticsItem(
                store_id=row.store_id,
                location=row.location,
                total_revenue=round(float(row.revenue), 2),
                total_orders=int(row.orders),
                avg_order_value=round(float(row.revenue) / int(row.orders), 2) if int(row.orders) > 0 else 0.0,
            )
            for row in rows
        ]

    @staticmethod
    def get_channel_analytics(db: Session) -> List[ChannelAnalyticsItem]:
        """
        Computes sales breakdown across retail channels (e.g., In-Store, Online, Mobile).
        """
        total_rev_res = db.execute(select(func.coalesce(func.sum(Transaction.total_amount), 0.0))).scalar() or 0.0
        total_store_revenue = float(total_rev_res)

        stmt = (
            select(
                func.coalesce(Transaction.sales_channel, "Unknown").label("channel"),
                func.coalesce(func.sum(Transaction.total_amount), 0.0).label("revenue"),
                func.count(Transaction.id).label("orders"),
            )
            .group_by(Transaction.sales_channel)
            .order_by(desc("revenue"))
        )
        rows = db.execute(stmt).all()

        results = []
        for row in rows:
            rev = float(row.revenue)
            share = round((rev / total_store_revenue) * 100, 2) if total_store_revenue > 0 else 0.0
            results.append(
                ChannelAnalyticsItem(
                    sales_channel=row.channel,
                    total_revenue=round(rev, 2),
                    total_orders=int(row.orders),
                    percentage=share,
                )
            )
        return results
