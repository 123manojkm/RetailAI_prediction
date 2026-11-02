import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, Upload, BarChart3, Users, ShoppingBag,
  Package, AlertTriangle, Brain, Settings, LogOut,
  Menu, X, Sun, Moon, Bell, ChevronRight, TrendingUp,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/data', icon: Upload, label: 'Data Management' },
  { to: '/forecast', icon: TrendingUp, label: 'Demand Forecasting' },
  { to: '/customers', icon: Users, label: 'Customer Segments' },
  { to: '/recommendations', icon: ShoppingBag, label: 'Recommendations' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/risk', icon: AlertTriangle, label: 'Stock-Out Risk' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/models', icon: Brain, label: 'Model Evaluation' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-inherit">
          {sidebarOpen && <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RetailAI</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                }`
              }
            >
              <Icon size={18} />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        {/* User */}
        {sidebarOpen && (
          <div className="p-3 border-t border-inherit">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className={`h-14 flex items-center justify-between px-6 border-b ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>AI Retail Analytics</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 dark:text-gray-100 font-medium">Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
              <Bell size={18} />
            </button>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
