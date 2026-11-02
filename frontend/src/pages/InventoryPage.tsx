import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/endpoints';
import { Package, Loader2, Sparkles } from 'lucide-react';

export default function InventoryPage() {
  const [categoryFilter, setCategoryFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory', categoryFilter, riskFilter],
    queryFn: () => inventoryService.list({ category: categoryFilter || undefined, risk_level: riskFilter || undefined }),
  });

  const { data: allInventoryData } = useQuery({
    queryKey: ['inventory-all-categories'],
    queryFn: () => inventoryService.list({ page_size: 200 }),
    staleTime: 60000,
  });

  const items = inventoryData?.items || [];

  // Extract distinct categories dynamically from the uploaded dataset
  const availableCategories = useMemo(() => {
    const source = allInventoryData?.items?.length ? allInventoryData.items : items;
    const set = new Set<string>();
    source.forEach((item: any) => {
      if (item.category && String(item.category).trim()) {
        set.add(String(item.category).trim());
      }
    });
    return Array.from(set).sort();
  }, [allInventoryData, items]);

  const riskBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200';
      default:
        return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="text-amber-600" />
            Inventory Intelligence & Safety Stock
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Formulas: Safety Stock = Z × σ_daily × √(Lead Time), Reorder Point = Demand_LT + SS (95% Service Level)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none"
          >
            <option value="">All Categories ({availableCategories.length})</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock Risk:</label>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white outline-none"
          >
            <option value="">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <span className="text-xs text-gray-400 ml-auto font-mono">
          Items showing: {items.length}
        </span>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-amber-600" /></div>
        ) : items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs">
                <tr>
                  <th className="py-3 px-4">Product ID / Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Daily Demand (Avg)</th>
                  <th className="py-3 px-4">Lead Time</th>
                  <th className="py-3 px-4">Safety Stock</th>
                  <th className="py-3 px-4">Reorder Point</th>
                  <th className="py-3 px-4">Rec. Reorder Qty</th>
                  <th className="py-3 px-4">Risk Status</th>
                  <th className="py-3 px-4 text-center">AI Recommendations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {items.map((inv: any) => (
                  <tr key={inv.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{inv.product_name}</p>
                      <p className="font-mono text-xs text-gray-400">{inv.product_id}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{inv.category}</td>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{inv.current_stock}</td>
                    <td className="py-3 px-4 font-mono">{inv.avg_daily_demand?.toFixed(1)} u/d</td>
                    <td className="py-3 px-4 font-mono">{inv.supplier_lead_time} days</td>
                    <td className="py-3 px-4 font-mono text-blue-600">{inv.safety_stock}</td>
                    <td className="py-3 px-4 font-mono font-bold text-purple-600">{inv.reorder_point}</td>
                    <td className="py-3 px-4">
                      {inv.recommended_reorder_qty > 0 ? (
                        <span className="font-bold text-amber-600">
                          +{inv.recommended_reorder_qty}
                        </span>
                      ) : (
                        <span className="text-gray-400">0 (Adequate)</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium border ${riskBadge(inv.risk_level)}`}>
                        {inv.risk_level.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/recommendations?product=${encodeURIComponent(inv.product_id || inv.product_name)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 hover:bg-pink-100 transition border border-pink-200 dark:border-pink-800"
                      >
                        <Sparkles size={12} /> AI Accessories
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">No inventory products match criteria</div>
        )}
      </div>
    </div>
  );
}
