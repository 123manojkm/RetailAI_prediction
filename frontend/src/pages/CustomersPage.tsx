import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/endpoints';
import { Users, Play, Loader2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [selectedSegment, setSelectedSegment] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: segmentData, isLoading: segmentsLoading } = useQuery({
    queryKey: ['customerSegments'],
    queryFn: () => customerService.getSegments(),
  });

  const { data: customerList, isLoading: customersLoading } = useQuery({
    queryKey: ['customers', page, selectedSegment],
    queryFn: () => customerService.list(page, 15, selectedSegment || undefined),
  });

  const trainMutation = useMutation({
    mutationFn: () => customerService.trainSegmentation(),
    onSuccess: () => {
      toast.success('K-Means RFM segmentation updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['customerSegments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || 'Segmentation training failed');
    },
  });

  const segments = Array.isArray(segmentData) ? segmentData : (segmentData?.segments || []);

  const fmtINR = (val: number) => '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="text-purple-600" />
            Customer RFM Segmentation
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            K-Means clustering on Recency, Frequency & Monetary Value with rule-derived personas
          </p>
        </div>
        <button
          onClick={() => trainMutation.mutate()}
          disabled={trainMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium shadow-sm transition disabled:opacity-50"
        >
          {trainMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
          {trainMutation.isPending ? 'Clustering RFM...' : 'Run Segmentation ML'}
        </button>
      </div>

      {/* Segment Cards */}
      {segmentsLoading ? (
        <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" /></div>
      ) : segments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {segments.map((seg: any, idx: number) => (
            <div
              key={seg.segment_id || seg.id || seg.segment_name || `seg-${idx}`}
              onClick={() => setSelectedSegment(selectedSegment === seg.segment_name ? '' : seg.segment_name)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedSegment === seg.segment_name
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/30'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">{seg.segment_name}</span>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
                  {seg.customer_count.toLocaleString()} cust
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Rev Share: <span className="font-bold text-purple-600">{seg.revenue_contribution_pct}%</span>
              </p>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Avg Recency:</span>
                  <span className="font-mono">{seg.avg_recency} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Frequency:</span>
                  <span className="font-mono">{seg.avg_frequency} orders</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Monetary:</span>
                  <span className="font-mono">{fmtINR(seg.avg_monetary)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-center text-gray-500">
          <p>No customer clusters identified yet. Run segmentation ML or upload a transaction CSV to partition your customers.</p>
        </div>
      )}

      {/* Segment Revenue Chart */}
      {segments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Total Revenue Contribution by Customer Segment
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={segments}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="segment_name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: any) => [`₹${Number(v || 0).toLocaleString('en-IN')}`, 'Total Revenue']} />
              <Bar dataKey="total_revenue" fill="#9333ea" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Customer Directory Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Customer Database</h3>
            <p className="text-xs text-gray-500">
              {selectedSegment ? `Filtered by segment: ${selectedSegment}` : 'All Customer Profiles'}
            </p>
          </div>
          {selectedSegment && (
            <button
              onClick={() => setSelectedSegment('')}
              className="text-xs text-purple-600 hover:underline"
            >
              Clear segment filter
            </button>
          )}
        </div>

        {customersLoading ? (
          <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-purple-600" /></div>
        ) : customerList && customerList.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs">
                <tr>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Cluster Segment</th>
                  <th className="py-3 px-4">Total Spent</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">AOV</th>
                  <th className="py-3 px-4">Last Purchase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {customerList.items.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-3 px-4 font-mono font-medium text-gray-900 dark:text-white">{cust.customer_id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 text-xs rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
                        {cust.segment || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                      {fmtINR(cust.total_spent)}
                    </td>
                    <td className="py-3 px-4">{cust.total_orders}</td>
                    <td className="py-3 px-4">{fmtINR(cust.avg_order_value)}</td>
                    <td className="py-3 px-4 text-gray-500">{cust.last_purchase ? String(cust.last_purchase).slice(0, 10) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">No customers found</div>
        )}

        {/* Pagination */}
        {customerList && customerList.pages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs">
            <span className="text-gray-500">
              Page {customerList.page} of {customerList.pages} ({customerList.total} total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= customerList.pages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
