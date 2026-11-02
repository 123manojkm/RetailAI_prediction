"""
Synthetic Retail Transaction Data Generator

Generates realistic retail transaction data with meaningful relationships
between products, customers, dates, prices, quantities, and locations.

Usage:
    python -m backend.app.utils.synthetic_data --rows 100000 --output data/sample/synthetic_transactions.csv
"""

import argparse
import csv
import os
import random
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import math


# --- Product Catalog ---
PRODUCT_CATALOG = {
    "Electronics": [
        ("ELEC-001", "Wireless Headphones", 79.99, 149.99),
        ("ELEC-002", "Bluetooth Speaker", 49.99, 129.99),
        ("ELEC-003", "USB-C Charging Cable", 9.99, 24.99),
        ("ELEC-004", "Portable Power Bank", 29.99, 69.99),
        ("ELEC-005", "Smart Watch", 199.99, 399.99),
        ("ELEC-006", "Wireless Mouse", 19.99, 49.99),
        ("ELEC-007", "Laptop Stand", 39.99, 79.99),
        ("ELEC-008", "Webcam HD", 59.99, 129.99),
        ("ELEC-009", "Noise Cancelling Earbuds", 89.99, 249.99),
        ("ELEC-010", "Tablet Case", 14.99, 39.99),
    ],
    "Clothing": [
        ("CLTH-001", "Cotton T-Shirt", 12.99, 34.99),
        ("CLTH-002", "Denim Jeans", 39.99, 89.99),
        ("CLTH-003", "Running Shoes", 59.99, 149.99),
        ("CLTH-004", "Winter Jacket", 79.99, 199.99),
        ("CLTH-005", "Casual Shorts", 19.99, 44.99),
        ("CLTH-006", "Formal Shirt", 29.99, 69.99),
        ("CLTH-007", "Sports Socks Pack", 9.99, 19.99),
        ("CLTH-008", "Baseball Cap", 14.99, 29.99),
    ],
    "Groceries": [
        ("GROC-001", "Organic Milk 1L", 3.49, 5.99),
        ("GROC-002", "Whole Wheat Bread", 2.99, 4.99),
        ("GROC-003", "Fresh Chicken Breast 1kg", 8.99, 14.99),
        ("GROC-004", "Olive Oil 500ml", 6.99, 12.99),
        ("GROC-005", "Basmati Rice 5kg", 9.99, 16.99),
        ("GROC-006", "Mixed Vegetables Pack", 4.99, 8.99),
        ("GROC-007", "Greek Yogurt 500g", 3.99, 6.99),
        ("GROC-008", "Coffee Beans 500g", 11.99, 19.99),
        ("GROC-009", "Fresh Orange Juice 1L", 4.49, 7.99),
        ("GROC-010", "Dark Chocolate Bar", 2.99, 5.99),
    ],
    "Home & Garden": [
        ("HOME-001", "Scented Candle Set", 14.99, 34.99),
        ("HOME-002", "Throw Pillow", 19.99, 44.99),
        ("HOME-003", "Kitchen Knife Set", 49.99, 129.99),
        ("HOME-004", "Plant Pot Ceramic", 12.99, 29.99),
        ("HOME-005", "Bath Towel Set", 24.99, 59.99),
        ("HOME-006", "LED Desk Lamp", 29.99, 69.99),
        ("HOME-007", "Storage Basket", 9.99, 24.99),
        ("HOME-008", "Wall Clock Modern", 19.99, 49.99),
    ],
    "Sports & Fitness": [
        ("SPRT-001", "Yoga Mat", 24.99, 49.99),
        ("SPRT-002", "Resistance Bands Set", 14.99, 34.99),
        ("SPRT-003", "Water Bottle 1L", 9.99, 24.99),
        ("SPRT-004", "Dumbbells 5kg Pair", 29.99, 59.99),
        ("SPRT-005", "Jump Rope", 7.99, 19.99),
        ("SPRT-006", "Gym Bag", 24.99, 54.99),
    ],
    "Beauty & Health": [
        ("BEAU-001", "Face Moisturizer", 14.99, 39.99),
        ("BEAU-002", "Shampoo 500ml", 8.99, 19.99),
        ("BEAU-003", "Sunscreen SPF50", 12.99, 29.99),
        ("BEAU-004", "Vitamin D Supplements", 9.99, 24.99),
        ("BEAU-005", "Hand Cream", 6.99, 14.99),
        ("BEAU-006", "Toothpaste Whitening", 4.99, 9.99),
    ],
}

# Flatten product list
ALL_PRODUCTS = []
for category, products in PRODUCT_CATALOG.items():
    for prod_id, name, min_price, max_price in products:
        ALL_PRODUCTS.append({
            "product_id": prod_id,
            "product_name": name,
            "category": category,
            "min_price": min_price,
            "max_price": max_price,
            "base_price": round((min_price + max_price) / 2, 2),
        })

STORES = [
    ("STORE-001", "New York", "East"),
    ("STORE-002", "Los Angeles", "West"),
    ("STORE-003", "Chicago", "Central"),
    ("STORE-004", "Houston", "South"),
    ("STORE-005", "Phoenix", "West"),
    ("STORE-006", "Philadelphia", "East"),
    ("STORE-007", "San Antonio", "South"),
    ("STORE-008", "San Diego", "West"),
    ("STORE-009", "Dallas", "South"),
    ("STORE-010", "Miami", "East"),
]

SALES_CHANNELS = ["Online", "In-Store", "Mobile App"]
CHANNEL_WEIGHTS = [0.35, 0.45, 0.20]  # Realistic distribution


class CustomerProfile:
    """Represents a customer with consistent purchasing behavior."""

    def __init__(self, customer_id: str, segment: str):
        self.customer_id = customer_id
        self.segment = segment

        if segment == "high_value":
            self.purchase_frequency = random.uniform(0.3, 0.8)  # probability per day
            self.avg_basket_size = random.randint(2, 5)
            self.price_sensitivity = random.uniform(0.1, 0.3)
            self.preferred_categories = random.sample(list(PRODUCT_CATALOG.keys()), k=random.randint(3, 5))
            self.preferred_channel = random.choices(SALES_CHANNELS, weights=[0.4, 0.3, 0.3])[0]
        elif segment == "regular":
            self.purchase_frequency = random.uniform(0.05, 0.2)
            self.avg_basket_size = random.randint(1, 3)
            self.price_sensitivity = random.uniform(0.3, 0.6)
            self.preferred_categories = random.sample(list(PRODUCT_CATALOG.keys()), k=random.randint(2, 4))
            self.preferred_channel = random.choices(SALES_CHANNELS, weights=CHANNEL_WEIGHTS)[0]
        elif segment == "occasional":
            self.purchase_frequency = random.uniform(0.01, 0.05)
            self.avg_basket_size = random.randint(1, 2)
            self.price_sensitivity = random.uniform(0.5, 0.8)
            self.preferred_categories = random.sample(list(PRODUCT_CATALOG.keys()), k=random.randint(1, 3))
            self.preferred_channel = random.choices(SALES_CHANNELS, weights=[0.5, 0.3, 0.2])[0]
        else:  # churning
            self.purchase_frequency = random.uniform(0.001, 0.01)
            self.avg_basket_size = 1
            self.price_sensitivity = random.uniform(0.7, 0.95)
            self.preferred_categories = random.sample(list(PRODUCT_CATALOG.keys()), k=random.randint(1, 2))
            self.preferred_channel = random.choices(SALES_CHANNELS, weights=CHANNEL_WEIGHTS)[0]

        self.preferred_store = random.choice(STORES)
        self.favorite_products = self._select_favorite_products()

    def _select_favorite_products(self) -> List[dict]:
        favorites = []
        for cat in self.preferred_categories:
            cat_products = [p for p in ALL_PRODUCTS if p["category"] == cat]
            n = min(len(cat_products), random.randint(1, 3))
            favorites.extend(random.sample(cat_products, n))
        return favorites


def generate_seasonal_factor(date: datetime) -> float:
    """Generate a seasonal multiplier based on the date."""
    month = date.month
    day_of_year = date.timetuple().tm_yday

    # Base seasonal pattern (higher in Nov-Dec, lower in Jan-Feb)
    seasonal = 1.0 + 0.3 * math.sin(2 * math.pi * (day_of_year - 60) / 365)

    # Holiday boosts
    if month == 11 and date.day >= 20:  # Black Friday / Thanksgiving
        seasonal *= 1.8
    elif month == 12 and date.day <= 25:  # Christmas shopping
        seasonal *= 1.6
    elif month == 12 and date.day > 25:  # Post-Christmas
        seasonal *= 0.7
    elif month == 1 and date.day <= 15:  # New Year sales
        seasonal *= 1.2
    elif month == 2 and date.day >= 10 and date.day <= 14:  # Valentine's
        seasonal *= 1.15
    elif month == 7 and date.day <= 7:  # July 4th sales
        seasonal *= 1.1

    return seasonal


def generate_day_of_week_factor(date: datetime) -> float:
    """Weekends have more transactions."""
    dow = date.weekday()
    factors = [0.85, 0.80, 0.90, 0.95, 1.10, 1.30, 1.20]
    return factors[dow]


def generate_transactions(
    num_transactions: int,
    num_customers: int = 5000,
    start_date: str = "2023-01-01",
    end_date: str = "2024-12-31",
    seed: int = 42,
) -> List[Dict]:
    """Generate synthetic retail transactions with realistic patterns."""

    random.seed(seed)

    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    total_days = (end - start).days + 1

    # Create customer profiles with realistic segment distribution
    segments = (
        ["high_value"] * int(num_customers * 0.10)
        + ["regular"] * int(num_customers * 0.35)
        + ["occasional"] * int(num_customers * 0.35)
        + ["churning"] * int(num_customers * 0.20)
    )
    # Pad to exact count
    while len(segments) < num_customers:
        segments.append(random.choice(["regular", "occasional"]))
    random.shuffle(segments)

    customers = []
    for i, seg in enumerate(segments):
        cid = f"CUST-{i+1:05d}"
        customers.append(CustomerProfile(cid, seg))

    transactions = []
    txn_id_counter = 1

    # Distribute transactions across days based on patterns
    avg_daily = num_transactions / total_days

    for day_offset in range(total_days):
        current_date = start + timedelta(days=day_offset)
        seasonal = generate_seasonal_factor(current_date)
        dow_factor = generate_day_of_week_factor(current_date)

        # Calculate number of transactions for this day
        daily_target = avg_daily * seasonal * dow_factor
        daily_count = max(1, int(random.gauss(daily_target, daily_target * 0.15)))

        for _ in range(daily_count):
            if len(transactions) >= num_transactions:
                break

            # Select customer (weighted by purchase frequency)
            customer = random.choices(
                customers,
                weights=[c.purchase_frequency for c in customers],
                k=1,
            )[0]

            # Number of items in this transaction
            num_items = min(
                customer.avg_basket_size + random.randint(-1, 1),
                len(customer.favorite_products),
            )
            num_items = max(1, num_items)

            # Select products (prefer favorites, occasional exploration)
            if random.random() < 0.8 and customer.favorite_products:
                selected_products = random.sample(
                    customer.favorite_products,
                    k=min(num_items, len(customer.favorite_products)),
                )
            else:
                selected_products = random.sample(
                    ALL_PRODUCTS, k=min(num_items, len(ALL_PRODUCTS))
                )

            for product in selected_products:
                if len(transactions) >= num_transactions:
                    break

                # Quantity - usually 1-3, sometimes more for groceries
                if product["category"] == "Groceries":
                    quantity = random.choices([1, 2, 3, 4, 5], weights=[30, 35, 20, 10, 5])[0]
                else:
                    quantity = random.choices([1, 2, 3], weights=[70, 25, 5])[0]

                # Price variation
                base = product["base_price"]
                price_var = random.uniform(0.9, 1.1)
                unit_price = round(
                    max(product["min_price"], min(product["max_price"], base * price_var)),
                    2,
                )

                # Discount (based on customer sensitivity and promotions)
                discount = 0.0
                if random.random() < 0.25:  # 25% chance of discount
                    if customer.price_sensitivity > 0.5:
                        discount = round(random.uniform(0.05, 0.30), 2)
                    else:
                        discount = round(random.uniform(0.05, 0.15), 2)

                # Store selection (prefer customer's store, sometimes others)
                if random.random() < 0.75:
                    store = customer.preferred_store
                else:
                    store = random.choice(STORES)

                # Channel selection
                if random.random() < 0.7:
                    channel = customer.preferred_channel
                else:
                    channel = random.choices(SALES_CHANNELS, weights=CHANNEL_WEIGHTS)[0]

                # Inventory level (realistic range based on product)
                if product["category"] == "Groceries":
                    inventory_level = random.randint(20, 500)
                elif product["category"] == "Electronics":
                    inventory_level = random.randint(5, 200)
                else:
                    inventory_level = random.randint(10, 300)

                # Supplier lead time (days)
                if product["category"] == "Electronics":
                    lead_time = random.randint(7, 21)
                elif product["category"] == "Groceries":
                    lead_time = random.randint(1, 5)
                else:
                    lead_time = random.randint(3, 14)

                total_amount = round(unit_price * quantity * (1 - discount), 2)

                transactions.append({
                    "Transaction_ID": f"TXN-{txn_id_counter:07d}",
                    "Customer_ID": customer.customer_id,
                    "Product_ID": product["product_id"],
                    "Product_Name": product["product_name"],
                    "Category": product["category"],
                    "Quantity": quantity,
                    "Unit_Price": unit_price,
                    "Discount": discount,
                    "Total_Amount": total_amount,
                    "Transaction_Date": current_date.strftime("%Y-%m-%d"),
                    "Store_ID": store[0],
                    "Location": store[1],
                    "Region": store[2],
                    "Sales_Channel": channel,
                    "Inventory_Level": inventory_level,
                    "Supplier_Lead_Time": lead_time,
                })
                txn_id_counter += 1

        if len(transactions) >= num_transactions:
            break

    return transactions[:num_transactions]


def save_to_csv(transactions: List[Dict], output_path: str) -> None:
    """Save transactions to CSV file."""
    os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else ".", exist_ok=True)

    if not transactions:
        print("No transactions generated.")
        return

    fieldnames = list(transactions[0].keys())

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(transactions)

    file_size = os.path.getsize(output_path)
    print(f"Generated {len(transactions):,} transactions")
    print(f"Saved to: {output_path}")
    print(f"File size: {file_size / (1024*1024):.2f} MB")

    # Print sample stats
    categories = set(t["Category"] for t in transactions)
    customers = set(t["Customer_ID"] for t in transactions)
    products = set(t["Product_ID"] for t in transactions)
    stores = set(t["Store_ID"] for t in transactions)
    dates = sorted(set(t["Transaction_Date"] for t in transactions))

    print(f"\nDataset Statistics:")
    print(f"  Categories: {len(categories)}")
    print(f"  Unique Customers: {len(customers)}")
    print(f"  Unique Products: {len(products)}")
    print(f"  Stores: {len(stores)}")
    print(f"  Date Range: {dates[0]} to {dates[-1]}")
    total_revenue = sum(t["Total_Amount"] for t in transactions)
    print(f"  Total Revenue: ${total_revenue:,.2f}")
    avg_order = total_revenue / len(transactions)
    print(f"  Avg Transaction Value: ${avg_order:.2f}")


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic retail transaction data")
    parser.add_argument("--rows", type=int, default=100000, help="Number of transactions to generate")
    parser.add_argument("--customers", type=int, default=5000, help="Number of unique customers")
    parser.add_argument("--start-date", type=str, default="2023-01-01", help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end-date", type=str, default="2024-12-31", help="End date (YYYY-MM-DD)")
    parser.add_argument("--output", type=str, default="data/sample/synthetic_transactions.csv", help="Output CSV path")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")

    args = parser.parse_args()

    print(f"Generating {args.rows:,} synthetic transactions...")
    print(f"  Customers: {args.customers:,}")
    print(f"  Date range: {args.start_date} to {args.end_date}")
    print(f"  Seed: {args.seed}")
    print()

    transactions = generate_transactions(
        num_transactions=args.rows,
        num_customers=args.customers,
        start_date=args.start_date,
        end_date=args.end_date,
        seed=args.seed,
    )

    save_to_csv(transactions, args.output)


if __name__ == "__main__":
    main()
