import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/endpoints';
import {
  BarChart3, Store, Globe, Layers, Loader2, TrendingUp,
  DollarSign, Package, ShoppingCart, ArrowUpRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { Link } from 'react-router-dom';

export default function AnalyticsPage() {
  const { data: salesAnalytics, isLoading: salesLoading } = useQuery({
    queryKey: ['salesAnalytics'],
    queryFn: () => dashboardService.getSalesAnalytics(),
  });

  const { data: storeAnalytics, isLoading: storeLoading } = useQuery({
    queryKey: ['storeAnalytics'],
    queryFn: () => dashboardService.getStoreAnalytics(),
  });

  const { data: channelAnalytics, isLoading: channelLoading } = useQuery({
    queryKey: ['channelAnalytics'],
    queryFn: () => dashboardService.getChannelAnalytics(),
  });

  const { data: categoryAnalytics, isLoading: categoryLoading } = useQuery({
    queryKey: ['categoryAnalytics'],
    queryFn: () => dashboardService.getCategoryAnalytics(),
  });

  // Handle both direct array responses and object wrapper responses
  const stores = Array.isArray(storeAnalytics)
    ? storeAnalytics
    : (storeAnalytics?.stores || []);

  const channels = Array.isArray(channelAnalytics)
    ? channelAnalytics
    : (channelAnalytics?.channels || []);

  const categories = Array.isArray(categoryAnalytics)
    ? categoryAnalytics
    : (categoryAnalytics?.categories || []);

  const salesTrends = salesAnalytics?.trends || [];
  const totalRevenue = salesAnalytics?.total_revenue || 0;
  const totalUnits = salesAnalytics?.total_units || 0;
  const totalOrders = salesAnalytics?.total_orders || 0;

  // Format currency in Indian Rupees
  const fmtCurrency = (n: number) => {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
    return `₹${Number(n || 0).toLocaleString('en-IN')}`;
  };

  // Sample or aggregate timeline if there are too many daily data points
  const displayTrends = salesTrends.length > 50
    ? salesTrends.filter((_: any, i: number) => i % Math.ceil(salesTrends.length / 40) === 0)
    : salesTrends;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-indigo-600" />
            Multi-Dimensional Business Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time analytics dynamically calculated from your uploaded retail CSV dataset
          </p>
        </div>
        <Link
          to="/data"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 text-xs font-semibold transition"
        >
          <span>Upload Another CSV</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Sales Revenue</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-lg">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {salesLoading ? <Loader2 className="animate-spin inline" size={20} /> : fmtCurrency(totalRevenue)}
          </p>
          <p className="text-xs text-gray-400 mt-1">From active uploaded CSV</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Units Ingested</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Package size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {salesLoading ? <Loader2 className="animate-spin inline" size={20} /> : Number(totalUnits).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-400 mt-1">Total volume sold</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Transactions</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 rounded-lg">
              <ShoppingCart size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {salesLoading ? <Loader2 className="animate-spin inline" size={20} /> : Number(totalOrders).toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-gray-400 mt-1">Line-item orders</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Categories</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-lg">
              <Layers size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {categoryLoading ? <Loader2 className="animate-spin inline" size={20} /> : categories.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">Dataset departments</p>
        </div>
      </div>

      {/* Sales Revenue Velocity Timeline */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-600" />
            Revenue Velocity & Order Trends Over Time
          </h3>
          <span className="text-xs text-gray-400 font-mono">
            {salesTrends.length} historical dates recorded
          </span>
        </div>
        {salesLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600" size={28} />
          </div>
        ) : displayTrends.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={displayTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => String(v).slice(5)} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(val: any, name: any) => [
                  name === 'revenue' ? `₹${Number(val || 0).toLocaleString('en-IN')}` : val,
                  name === 'revenue' ? 'Daily Revenue' : 'Daily Orders',
                ]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} dot={false} name="Revenue (₹)" />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={1.5} dot={false} name="Orders Count" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-gray-400 text-sm">
            <p>No date trend data available in current dataset.</p>
          </div>
        )}
      </div>

      {/* Grid of Store and Channel Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Store / Location */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Store size={16} className="text-blue-500" />
              Revenue by Store Location
            </h3>
            <span className="text-xs text-gray-400 font-mono">{stores.length} locations</span>
          </div>
          {storeLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-500" />
            </div>
          ) : stores.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stores}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                <XAxis dataKey="location" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: any) => [`₹${Number(v || 0).toLocaleString('en-IN')}`, 'Revenue']} />
                <Bar dataKey="total_revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">
              No store location data available
            </div>
          )}
        </div>

        {/* Sales by Channel */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Globe size={16} className="text-purple-500" />
              Sales Channel Breakdown
            </h3>
            <span className="text-xs text-gray-400 font-mono">{channels.length} channels</span>
          </div>
          {channelLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-purple-500" />
            </div>
          ) : channels.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={channels}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                <XAxis dataKey="sales_channel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: any) => [`₹${Number(v || 0).toLocaleString('en-IN')}`, 'Revenue']} />
                <Bar dataKey="total_revenue" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-sm text-gray-400">
              No sales channel data available
            </div>
          )}
        </div>
      </div>

      {/* Category Performance Matrix */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Category Performance Matrix</h3>
          </div>
          <span className="text-xs text-gray-400 font-mono">{categories.length} categories</span>
        </div>
        {categoryLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="animate-spin mx-auto text-green-500" />
          </div>
        ) : categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs">
                <tr>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Product Count</th>
                  <th className="py-3 px-4">Units Sold</th>
                  <th className="py-3 px-4">Total Revenue</th>
                  <th className="py-3 px-4">Market Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {categories.map((c: any) => (
                  <tr key={c.category} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">{c.category}</td>
                    <td className="py-3 px-4 font-mono">{c.total_products}</td>
                    <td className="py-3 px-4 font-mono">{c.total_units_sold?.toLocaleString()}</td>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                      ₹{Number(c.total_revenue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.min(100, c.market_share_percentage || 0)}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-medium">{c.market_share_percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-gray-400">
            No categories available in the active dataset.
          </div>
        )}
      </div>
    </div>
  );
}
