import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            RetailAI Platform
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">AI-Powered Retail Analytics</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-5">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Sign In</h2>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-xs text-center text-gray-400 dark:text-gray-500">
            Demo: admin / admin123
          </p>
        </form>
      </div>
    </div>
  );
}
