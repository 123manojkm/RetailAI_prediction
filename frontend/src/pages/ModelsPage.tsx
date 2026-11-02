import { useQuery } from '@tanstack/react-query';
import { forecastService } from '../services/endpoints';
import { Brain, CheckCircle, Loader2 } from 'lucide-react';

export default function ModelsPage() {
  const { data: evalData, isLoading } = useQuery({
    queryKey: ['modelEvaluation'],
    queryFn: () => forecastService.getModelEvaluation(),
  });

  const metrics = evalData?.metrics || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Brain className="text-blue-600" />
          Model Governance & Evaluation Metrics
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Validation metrics computed strictly on chronologically separated test sets to prevent temporal data leakage
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>
      ) : evalData && evalData.status !== 'no_model' ? (
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-wrap justify-between items-center gap-4">
            <div>
              <span className="text-xs font-mono bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded">
                Active Artifact: {evalData.model_version}
              </span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                Primary Model: XGBoost Regressor (Multi-horizon)
              </h2>
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <div>Train Samples: <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{metrics.training_samples?.toLocaleString()}</span></div>
              <div>Test Samples: <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{metrics.test_samples?.toLocaleString()}</span></div>
            </div>
          </div>

          {/* Metric Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500">Mean Absolute Error (MAE)</span>
              <p className="text-2xl font-mono font-bold text-blue-600 mt-1">{metrics.test_mae}</p>
              <p className="text-xs text-gray-400 mt-0.5">Baseline: {metrics.baseline_mae}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500">Root Mean Squared Error (RMSE)</span>
              <p className="text-2xl font-mono font-bold text-indigo-600 mt-1">{metrics.test_rmse}</p>
              <p className="text-xs text-gray-400 mt-0.5">Baseline: {metrics.baseline_rmse}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500">Mean Absolute Percentage (MAPE)</span>
              <p className="text-2xl font-mono font-bold text-purple-600 mt-1">
                {metrics.test_mape != null ? `${metrics.test_mape}%` : 'N/A'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Zero-demand adjusted</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-green-200 dark:border-green-900/50">
              <span className="text-xs text-green-600 font-bold">Improvement vs Baseline</span>
              <p className="text-2xl font-mono font-bold text-green-600 mt-1">
                +{metrics.improvement_over_baseline}%
              </p>
              <p className="text-xs text-gray-400 mt-0.5">vs Naive Historical Mean</p>
            </div>
          </div>

          {/* Feature Importance & Rules */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Model Pipeline Attributes</h3>
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                <span><strong>Split Strategy:</strong> Chronological train/validation/test (Strict zero-leakage guarantee)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                <span><strong>Engineered Features:</strong> Lag-1, Lag-7, Lag-14, Lag-30, Rolling Averages (7d/14d/30d), Rolling StDev, Sin/Cos Day of Year Seasonality</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                <span><strong>Objective:</strong> <code>reg:squarederror</code> with max_depth=6, n_estimators=200</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500">
          <p>No model has been trained yet. Navigate to <strong>Demand Forecasting</strong> or <strong>Customer Segments</strong> to run a training run.</p>
        </div>
      )}
    </div>
  );
}
