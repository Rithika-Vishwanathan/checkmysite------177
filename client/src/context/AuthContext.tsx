import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api';

export interface User {
  userId: string;
  email: string;
  name: string;
  displayName?: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (name: string, email: string, password: string) => Promise<any>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        if (res.data?.success && res.data?.user) {
          setUser(res.data.user);
        } else {
          localStorage.removeItem('token');
          setUser(null);
        }
      })
      .catch(() => {
        localStorage.removeItem('token');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.success && res.data?.token) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  }

  async function signup(name: string, email: string, password: string) {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data?.success && res.data?.token) {
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
