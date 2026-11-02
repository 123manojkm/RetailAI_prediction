# Retail AI Predictive Analytics & Demand Forecasting Platform

A complete, production-ready full-stack AI platform for retail inventory optimization, daily demand forecasting, customer RFM persona clustering, and market basket recommendation analysis.

---

## 📁 Project Structure

```
Retail_AI_Prediction_Platform_Complete/
├── backend/
│   ├── app/
│   │   ├── main.py                          # FastAPI main entrypoint
│   │   ├── core/                            # JWT Security, configurations, logging
│   │   ├── database/                        # SQLAlchemy database models & session
│   │   ├── models/                          # Database ORM models
│   │   ├── schemas/                         # Pydantic validation schemas
│   │   ├── services/                        # Business logic, auto-remodeling, ML sync
│   │   ├── ml/                              # Forecasting & customer clustering engines
│   │   └── api/routes/                      # FastAPI routers (analytics, forecast, data, etc.)
│   └── requirements.txt                     # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                          # Router & global notification toaster
│   │   ├── pages/                           # Dashboard, Analytics, Forecast, Inventory, Data
│   │   ├── components/                      # Charts, metric cards, layouts
│   │   └── services/                        # API clients & query endpoints
│   ├── package.json                         # Frontend dependencies
│   └── vite.config.ts                       # Vite build configuration
│
└── data/
    └── retail_ai.db                         # Production SQLite database (WAL mode)
```

---

## 🚀 How to Run the Project

### Option A: One-Click Launch (Windows)
Double-click `start_project.bat` in this folder. It will launch both the FastAPI backend and the React Vite frontend in separate terminal windows.

---

### Option B: Manual Command Line Launch

#### 1. Start Backend:
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend Swagger Docs:* `http://localhost:8000/docs`

#### 2. Start Frontend:
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```
*Frontend Web App:* `http://localhost:5173`

---

## 🔑 Default Login Credentials

| Role | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` |

---

## 🌟 Key Features

1. **Universal CSV Auto-Remodeling:** Ingests any external retail dataset across encodings (UTF-8, Latin-1, CP1252) and formats (Kaggle Superstore, Amazon, POS exports). Dynamically remaps schemas and updates all charts automatically.
2. **Dynamic Multi-Dimensional Analytics:** Real-time revenue timeline, regional store location breakdowns, omni-channel distribution, and category performance matrix.
3. **AI Demand Predictions:** 30-day daily demand forecasting with confidence intervals, MAPE/RMSE accuracy metrics, and historical trend comparison.
4. **Smart Inventory Optimization:** Automated safety stock calculations, supplier lead times, and critical stockout risk alerts.
5. **Customer RFM Personas:** K-Means clustering and RFM analysis identifying *Champions*, *Loyal Customers*, *New Customers*, and *At Risk* segments.
6. **Market Basket Recommendation Engine:** Association rule mining identifying complementary product pairings and bundle discounts.
