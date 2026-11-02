import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '../services/endpoints';
import { Upload, FileText, Loader2, Eye, RefreshCw, Sparkles, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DataPage() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedUpload, setSelectedUpload] = useState<number | null>(null);

  const { data: uploads, isLoading } = useQuery({
    queryKey: ['uploads'],
    queryFn: () => dataService.listUploads(),
  });

  const { data: quality } = useQuery({
    queryKey: ['quality', selectedUpload],
    queryFn: () => dataService.getQuality(selectedUpload!),
    enabled: !!selectedUpload,
  });

  const { data: preview } = useQuery({
    queryKey: ['preview', selectedUpload],
    queryFn: () => dataService.getPreview(selectedUpload!, 10),
    enabled: !!selectedUpload,
  });

  const invalidateAllAnalytics = () => {
    queryClient.invalidateQueries({ queryKey: ['uploads'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['segments'] });
    queryClient.invalidateQueries({ queryKey: ['customerSegments'] });
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['forecasts'] });
    queryClient.invalidateQueries({ queryKey: ['forecast'] });
    queryClient.invalidateQueries({ queryKey: ['modelEvaluation'] });
    queryClient.invalidateQueries({ queryKey: ['inventory'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-all-categories'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['salesAnalytics'] });
    queryClient.invalidateQueries({ queryKey: ['storeAnalytics'] });
    queryClient.invalidateQueries({ queryKey: ['channelAnalytics'] });
    queryClient.invalidateQueries({ queryKey: ['categoryAnalytics'] });
    queryClient.invalidateQueries({ queryKey: ['catalog'] });
    queryClient.invalidateQueries({ queryKey: ['complementary-catalog'] });
    queryClient.invalidateQueries({ queryKey: ['complementary'] });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.refetchQueries();
  };

  const uploadMutation = useMutation({
    mutationFn: (file: File) => dataService.upload(file),
    onSuccess: (data: any) => {
      toast.success(
        data?.message || 'File uploaded & processed! Customer Segments and Forecasts updated automatically.'
      );
      invalidateAllAnalytics();
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Upload failed'),
  });

  const syncMutation = useMutation({
    mutationFn: (uploadId: number) => dataService.processUpload(uploadId),
    onSuccess: (data: any) => {
      toast.success(data?.message || 'Dataset synced! Customer segments and demand forecasts recalculated.');
      invalidateAllAnalytics();
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Sync failed'),
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
      e.target.value = '';
    }
  };

  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      processed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      validated: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      uploaded: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[s] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            Data Management & ML Pipeline
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload any retail CSV dataset to automatically synchronize database records, customer clusters, and demand forecasting
          </p>
        </div>
        <button
          onClick={async () => {
            try {
              await dataService.downloadSampleTemplate();
              toast.success('Downloaded sample retail CSV template!');
            } catch (err: any) {
              toast.error('Failed to download sample template');
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 font-medium text-sm transition"
        >
          <Download size={16} />
          Download Sample Retail Template (.csv)
        </button>
      </div>

      {/* Auto-Sync Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-blue-900 dark:text-blue-200">
          <span className="font-semibold">Automatic Multi-Format External CSV Ingestion:</span> Our intelligent pipeline now supports all major external dataset formats (Kaggle Superstore, Online Retail II, Amazon Sales, Shopify POS exports, tab/semicolon-delimited files, UTF-8, Latin-1, CP1252, and currency strings like ₹ and $). Every upload automatically clusters RFM personas and recalculates 30-day demand predictions.
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-dashed border-gray-300 dark:border-gray-600 text-center">
        <Upload size={40} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-700 dark:text-gray-200 font-semibold mb-1">Upload Retail Transaction CSV</p>
        <p className="text-xs text-gray-400 mb-4 max-w-xl mx-auto">
          Accepts any retail transaction file. Flexible column matching for <span className="font-medium text-gray-600 dark:text-gray-300">Order ID, Customer ID / Name, Product / Description, Category, Quantity, Unit Price / Sales, Discount, and Date</span>.
        </p>
        <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={handleUpload} className="hidden" />
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shadow-sm font-medium transition"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 size={16} className="inline animate-spin mr-2" />
                Ingesting & Retraining Models...
              </>
            ) : (
              'Choose CSV File to Upload & Sync'
            )}
          </button>
          <button
            onClick={async () => {
              try {
                await dataService.downloadSampleTemplate();
                toast.success('Downloaded sample retail CSV template!');
              } catch (err: any) {
                toast.error('Failed to download sample template');
              }
            }}
            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition flex items-center gap-2"
          >
            <Download size={15} />
            Get Sample CSV Template
          </button>
        </div>
      </div>

      {/* Uploads List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold dark:text-white">Uploaded Datasets & Synced Models</h3>
          <span className="text-xs text-gray-400">Click &quot;Re-Sync Models&quot; to force recalculation on any past dataset</span>
        </div>
        {isLoading ? (
          <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>
        ) : uploads && uploads.items.length > 0 ? (
          <div className="divide-y dark:divide-gray-700">
            {uploads.items.map((u) => (
              <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 gap-3">
                <div className="flex items-center gap-3">
                  <FileText size={22} className="text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="font-medium dark:text-white">{u.original_filename}</p>
                    <p className="text-xs text-gray-500">
                      {u.row_count?.toLocaleString()} rows · {(u.file_size / 1024 / 1024).toFixed(2)} MB · {u.is_synthetic ? '🧪 Synthetic' : 'Uploaded'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(u.status)}`}>
                    {u.status === 'processed' ? '✓ Synced & Trained' : u.status}
                  </span>
                  <button
                    onClick={() => syncMutation.mutate(u.id)}
                    disabled={syncMutation.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition disabled:opacity-50"
                    title="Re-process this CSV and retrain segments and forecasts"
                  >
                    <RefreshCw size={13} className={syncMutation.isPending ? 'animate-spin' : ''} />
                    Re-Sync Models
                  </button>
                  <button
                    onClick={() => setSelectedUpload(u.id)}
                    className="p-1.5 text-gray-500 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    title="View quality"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400"><p>No datasets uploaded yet</p></div>
        )}
      </div>

      {/* Quality Report */}
      {quality && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-semibold dark:text-white mb-4">Data Quality Report: {quality.filename}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{quality.overall_quality_score.toFixed(0)}%</p>
              <p className="text-xs text-gray-500">Quality Score</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold dark:text-white">{quality.total_rows.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total Rows</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold dark:text-white">{quality.total_columns}</p>
              <p className="text-xs text-gray-500">Columns</p>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{quality.duplicate_rows}</p>
              <p className="text-xs text-gray-500">Duplicates</p>
            </div>
          </div>
          {quality.detected_issues.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-red-600 mb-1">Issues:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                {quality.detected_issues.map((issue, i) => <li key={i}>{issue}</li>)}
              </ul>
            </div>
          )}
          {quality.recommendations.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">Recommendations:</p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                {quality.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
              </ul>
            </div>
          )}

          {/* Sample Data Preview Table */}
          {preview && preview.rows && preview.rows.length > 0 && (
            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-semibold dark:text-white flex items-center gap-2">
                  Sample Data Preview (First {preview.rows.length} rows)
                </h4>
                <button
                  onClick={() => setSelectedUpload(null)}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Close Preview
                </button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300">
                    <tr>
                      {preview.columns.map((col: string) => (
                        <th key={col} className="py-2 px-3 whitespace-nowrap font-medium border-b dark:border-gray-700">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700 font-mono">
                    {preview.rows.map((row: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-gray-50 dark:hover:bg-gray-700/40">
                        {preview.columns.map((col: string) => (
                          <td key={col} className="py-2 px-3 whitespace-nowrap text-gray-800 dark:text-gray-200">
                            {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
