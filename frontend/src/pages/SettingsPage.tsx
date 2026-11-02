import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Settings as SettingsIcon, Server, Shield, Sun, Moon } from 'lucide-react';
import api from '../services/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    api.get('/health', { baseURL: 'http://localhost:8000' })
      .then((res) => setHealthStatus(res.data))
      .catch((err) => setHealthStatus({ status: 'error', detail: err.message }));
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="text-gray-600" />
          System Settings & Platform Configuration
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Runtime infrastructure, environment parameters and security diagnostics
        </p>
      </div>

      {/* Backend & Database Health */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Server size={18} className="text-blue-500" />
          Service Health & Connectivity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-xs text-gray-400 block">FastAPI Backend</span>
            <span className="font-semibold text-green-600">
              {healthStatus?.status === 'healthy' ? '● Online (Port 8000)' : 'Connecting...'}
            </span>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-xs text-gray-400 block">Database Status</span>
            <span className="font-semibold text-green-600">
              {healthStatus?.database === 'connected' ? '● SQLite / PostgreSQL Connected' : 'Checking...'}
            </span>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-xs text-gray-400 block">Platform Version</span>
            <span className="font-mono font-medium">{healthStatus?.version || '1.0.0'}</span>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          {theme === 'dark' ? <Moon size={18} className="text-purple-400" /> : <Sun size={18} className="text-amber-500" />}
          Display & Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Color Theme</p>
            <p className="text-xs text-gray-500">Currently active: <span className="capitalize font-bold">{theme}</span> mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        </div>
      </div>

      {/* User Session */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Shield size={18} className="text-green-500" />
          Active Session & Permissions
        </h2>
        <div className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
          <div>User: <strong className="text-gray-900 dark:text-white font-mono">{user?.username}</strong></div>
          <div>Email: <span className="font-mono">{user?.email}</span></div>
          <div>Role: <span className="px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-bold uppercase">{user?.role}</span></div>
        </div>
      </div>
    </div>
  );
}
