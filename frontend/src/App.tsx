import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import DataPage from './pages/DataPage';
import ForecastPage from './pages/ForecastPage';
import CustomersPage from './pages/CustomersPage';
import RecommendationsPage from './pages/RecommendationsPage';
import InventoryPage from './pages/InventoryPage';
import RiskPage from './pages/RiskPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ModelsPage from './pages/ModelsPage';
import SettingsPage from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000, refetchOnWindowFocus: false },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/data" element={<DataPage />} />
        <Route path="/forecast" element={<ForecastPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/risk" element={<RiskPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster position="top-right" />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
