import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/endpoints';
import { AlertTriangle, ShieldAlert, CheckCircle, Loader2 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const RISK_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export default function RiskPage() {
  const { data: riskSummary, isLoading } = useQuery({
    queryKey: ['inventoryRisk'],
    queryFn: () => inventoryService.getRisk(),
  });

  const dist = riskSummary?.risk_distribution || {};
  const pieData = Object.keys(dist).map((key) => ({
    name: key.toUpperCase(),
    value: dist[key],
    color: RISK_COLORS[key as keyof typeof RISK_COLORS] || '#6b7280',
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <AlertTriangle className="text-red-500" />
          Stock-Out Risk Monitoring
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Rule-Based Deterministic Risk Engine based on Lead Time, Safety Stock & Days of Supply (Clearly Labeled)
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-red-500" /></div>
      ) : riskSummary ? (
        <div className="space-y-6">
          {/* Status banner */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-red-200 dark:border-red-900/50">
              <span className="text-xs text-red-500 font-bold">CRITICAL RISK</span>
              <p className="text-2xl font-bold text-red-600 mt-1">{dist.critical || 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Stock below safety threshold</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-orange-200 dark:border-orange-900/50">
              <span className="text-xs text-orange-500 font-bold">HIGH RISK</span>
              <p className="text-2xl font-bold text-orange-600 mt-1">{dist.high || 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Days of supply &lt; Lead time</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-yellow-200 dark:border-yellow-900/50">
              <span className="text-xs text-yellow-500 font-bold">MEDIUM RISK</span>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{dist.medium || 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Approaching reorder point</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-green-200 dark:border-green-900/50">
              <span className="text-xs text-green-500 font-bold">LOW RISK</span>
              <p className="text-2xl font-bold text-green-600 mt-1">{dist.low || 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Inventory healthy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Chart */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col items-center">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 self-start mb-4">
                Risk Classification Breakdown ({riskSummary.total_products} Products)
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 text-xs mt-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical Products List */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h3 className="text-sm font-semibold text-red-600 flex items-center gap-2 mb-4">
                <ShieldAlert size={16} />
                Products Requiring Immediate Action
              </h3>
              {riskSummary.critical_products?.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                  {riskSummary.critical_products.map((cp: any) => (
                    <div key={cp.product_id} className="py-2.5 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{cp.product_name}</p>
                        <p className="font-mono text-xs text-gray-400">{cp.product_id}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-2 py-0.5 rounded font-bold">
                          {cp.days_of_supply != null ? `${cp.days_of_supply}d supply left` : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400 flex flex-col items-center">
                  <CheckCircle size={32} className="text-green-500 mb-2" />
                  <p>No critical stock-out risks detected.</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-500">
            <strong>Methodology Note:</strong> {riskSummary.service_level_assumption} service level. Risk scores are evaluated deterministically using actual lead-time demand variability, avoiding deceptive simulated ML probabilities.
          </div>
        </div>
      ) : null}
    </div>
  );
}
