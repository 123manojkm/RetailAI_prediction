import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/endpoints';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, ShoppingCart, Users, Package, Loader2, AlertCircle,
} from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

function KPICard({ title, value, icon: Icon, color, subtitle }: {
  title: string; value: string; icon: any; color: string; subtitle?: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getMetrics(),
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <span className="ml-2 text-gray-500">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle size={20} className="mr-2" />
        Failed to load dashboard. Please check backend connectivity.
      </div>
    );
  }

  if (!data) return null;

  const fmt = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${Number(n || 0).toFixed(2)}`;
  };
  const fmtN = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : n.toString();

  // Aggregate trend to weekly for cleaner charts if large date range, otherwise keep daily
  const rawTrend = data.revenue_trend || [];
  const trendData = rawTrend.length > 35
    ? rawTrend.reduce((acc: any[], pt, i) => {
        if (i % 7 === 0) acc.push({ date: pt.date, revenue: 0, orders: 0 });
        if (acc.length) {
          acc[acc.length - 1].revenue += pt.revenue;
          acc[acc.length - 1].orders += pt.orders;
        }
        return acc;
      }, [])
    : rawTrend;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Executive Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Real-time analytics from {fmtN(data.total_orders)} transactions</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={fmt(data.total_revenue)} icon={DollarSign} color="bg-blue-600" subtitle="All time" />
        <KPICard title="Total Orders" value={fmtN(data.total_orders)} icon={ShoppingCart} color="bg-purple-600" subtitle={`AOV: ₹${data.avg_order_value.toFixed(2)}`} />
        <KPICard title="Customers" value={fmtN(data.unique_customers)} icon={Users} color="bg-green-600" />
        <KPICard title="Products" value={data.total_products.toString()} icon={Package} color="bg-amber-600" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Revenue Trend ({rawTrend.length > 35 ? 'Weekly' : 'Daily'})
          </h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: any) => [`₹${Number(v || 0).toLocaleString('en-IN')}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-20">No trend data available</p>}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Revenue by Category</h3>
          {data.category_breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.category_breakdown}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%" cy="50%"
                  outerRadius={100}
                  label={(entry: any) => `${entry.category} ${(entry.percentage || 0).toFixed(1)}%`}
                >
                  {data.category_breakdown.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => [`₹${Number(v || 0).toLocaleString('en-IN')}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-sm text-gray-400 text-center py-20">No category data</p>}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Top Products by Revenue</h3>
        {data.top_products.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.top_products} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="product_name" width={140} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => [`₹${Number(v || 0).toLocaleString('en-IN')}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <p className="text-sm text-gray-400 text-center py-10">No product data</p>}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Recent Transactions</h3>
        {data.recent_activity.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
                <th className="pb-2 pr-4">Transaction</th><th className="pb-2 pr-4">Customer</th>
                <th className="pb-2 pr-4">Amount</th><th className="pb-2 pr-4">Date</th><th className="pb-2">Store</th>
              </tr></thead>
              <tbody>
                {data.recent_activity.map((tx: any) => (
                  <tr key={tx.id} className="border-b dark:border-gray-700 last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">{tx.transaction_id}</td>
                    <td className="py-2 pr-4">{tx.customer_id}</td>
                    <td className="py-2 pr-4 font-medium">₹{tx.total_amount.toFixed(2)}</td>
                    <td className="py-2 pr-4 text-gray-500">{tx.transaction_date}</td>
                    <td className="py-2">{tx.store_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-sm text-gray-400 text-center py-10">No recent transactions</p>}
      </div>
    </div>
  );
}
