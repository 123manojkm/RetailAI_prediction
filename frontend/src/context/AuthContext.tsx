import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, TokenResponse } from '../types/api';
import { authService } from '../services/endpoints';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      let activeToken = localStorage.getItem('token');

      // Auto-authenticate with default credentials if no token exists
      if (!activeToken) {
        try {
          const res = await authService.login({ username: 'admin', password: 'admin123' });
          if (!isMounted) return;
          activeToken = res.access_token;
          localStorage.setItem('token', activeToken);
          setToken(activeToken);
        } catch {
          if (isMounted) setIsLoading(false);
          return;
        }
      }

      if (activeToken) {
        try {
          const me = await authService.me();
          if (isMounted) {
            setUser(me);
            setToken(activeToken);
          }
        } catch {
          if (isMounted) {
            setToken(null);
            localStorage.removeItem('token');
          }
        } finally {
          if (isMounted) setIsLoading(false);
        }
      } else {
        if (isMounted) setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (username: string, password: string) => {
    const res: TokenResponse = await authService.login({ username, password });
    localStorage.setItem('token', res.access_token);
    setToken(res.access_token);
    const me = await authService.me();
    setUser(me);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token && !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
