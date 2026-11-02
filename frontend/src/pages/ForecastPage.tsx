import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forecastService, recommendationService } from '../services/endpoints';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { TrendingUp, Play, Loader2, AlertCircle, Calendar, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForecastPage() {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [horizon, setHorizon] = useState(30);

  const { data: catalog } = useQuery({
    queryKey: ['catalog'],
    queryFn: () => recommendationService.getCatalog(),
  });

  useEffect(() => {
    if (catalog && catalog.length > 0) {
      const exists = catalog.some((p: any) => p.product_id === selectedProduct);
      if (!exists) {
        setSelectedProduct(catalog[0].product_id);
      }
    }
  }, [catalog, selectedProduct]);

  const { data: forecastData, isLoading, error } = useQuery({
    queryKey: ['forecast', selectedProduct, horizon],
    queryFn: () => forecastService.getProductForecast(selectedProduct, horizon),
    enabled: !!selectedProduct,
    retry: 1,
  });

  const { data: modelEval } = useQuery({
    queryKey: ['modelEvaluation'],
    queryFn: () => forecastService.getModelEvaluation(),
    retry: false,
  });

  const trainMutation = useMutation({
    mutationFn: () => forecastService.train(),
    onSuccess: () => {
      toast.success('XGBoost model training completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['forecast'] });
      queryClient.invalidateQueries({ queryKey: ['modelEvaluation'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Training failed');
    },
  });

  // Prepare chart data combining historical and predictions
  const chartData: any[] = [];
  if (forecastData?.historical) {
    // Take recent 60 days of historical
    const recentHist = forecastData.historical.slice(-60);
    recentHist.forEach((h: any) => {
      chartData.push({
        date: h.date,
        historical: h.demand,
        forecast: null,
      });
    });
  }

  if (forecastData?.predictions) {
    forecastData.predictions.forEach((p: any) => {
      chartData.push({
        date: p.date || p.forecast_date,
        historical: null,
        forecast: p.predicted_demand,
      });
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-blue-600" />
            AI Demand Forecasting
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chronological XGBoost Regressor with lagged demand, rolling averages & seasonality
          </p>
        </div>
        <button
          onClick={() => trainMutation.mutate()}
          disabled={trainMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-sm transition disabled:opacity-50"
        >
          {trainMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Play size={16} />
          )}
          {trainMutation.isPending ? 'Training Model...' : 'Train / Retrain Model'}
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Package size={16} className="text-gray-400" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Product:</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none"
          >
            {catalog && catalog.length > 0 ? (
              catalog.map((p: any) => (
                <option key={p.product_id} value={p.product_id}>
                  {p.product_id} - {p.product_name} ({p.category})
                </option>
              ))
            ) : (
              <>
                <option value="ELEC-001">ELEC-001 (Wireless Headphones)</option>
                <option value="ELEC-002">ELEC-002 (Bluetooth Speaker)</option>
                <option value="ELEC-005">ELEC-005 (Smart Watch)</option>
                <option value="CLTH-001">CLTH-001 (Cotton T-Shirt)</option>
                <option value="CLTH-003">CLTH-003 (Running Shoes)</option>
                <option value="GROC-001">GROC-001 (Organic Milk 1L)</option>
                <option value="GROC-003">GROC-003 (Fresh Chicken 1kg)</option>
                <option value="HOME-003">HOME-003 (Kitchen Knife Set)</option>
              </>
            )}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Horizon:</label>
          <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 text-xs">
            {[7, 14, 30, 60, 90].map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 font-medium ${
                  horizon === h
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                {h}d
              </button>
            ))}
          </div>
        </div>

        {forecastData?.model_version && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
            Model Version: {forecastData.model_version}
          </span>
        )}
      </div>

      {/* KPI summaries */}
      {forecastData && !forecastData.error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total {horizon}-Day Forecast</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {forecastData.total_predicted_demand?.toLocaleString() ?? 0} units
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Daily Expected Demand</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {forecastData.avg_daily_predicted?.toFixed(1) ?? 0} units/day
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Projected Growth vs History</p>
            <p className={`text-2xl font-bold mt-1 ${
              (forecastData.expected_growth_pct || 0) >= 0 ? 'text-green-600' : 'text-red-500'
            }`}>
              {(forecastData.expected_growth_pct || 0) > 0 ? '+' : ''}
              {forecastData.expected_growth_pct?.toFixed(1) ?? 0}%
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Historical Demand vs. XGBoost Future Predictions ({horizon} Days)
        </h3>

        {isLoading ? (
          <div className="h-72 flex items-center justify-center">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="ml-2 text-gray-500">Generating forecast predictions...</span>
          </div>
        ) : error || forecastData?.error ? (
          <div className="h-72 flex flex-col items-center justify-center text-amber-600 dark:text-amber-400 p-4 text-center">
            <AlertCircle size={36} className="mb-2" />
            <p className="font-semibold">Model Artifacts Not Trained Yet</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md">
              Click the "Train / Retrain Model" button above to run real XGBoost training on your historical dataset.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: 'Units', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="historical"
                name="Historical Demand"
                stroke="#6b7280"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Predicted Demand"
                stroke="#3b82f6"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Model Performance Banner */}
      {modelEval?.metrics && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800 text-sm">
          <p className="font-semibold text-blue-900 dark:text-blue-300">
            Chronological Validation Metrics (Held-out Test Set):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
            <div><span className="text-gray-500">MAE:</span> <span className="font-mono font-medium">{modelEval.metrics.test_mae}</span></div>
            <div><span className="text-gray-500">RMSE:</span> <span className="font-mono font-medium">{modelEval.metrics.test_rmse}</span></div>
            <div><span className="text-gray-500">MAPE:</span> <span className="font-mono font-medium">{modelEval.metrics.test_mape}%</span></div>
            <div><span className="text-gray-500">vs Baseline:</span> <span className="font-mono font-medium text-green-600">+{modelEval.metrics.improvement_over_baseline}%</span></div>
          </div>
        </div>
      )}
    </div>
  );
}
