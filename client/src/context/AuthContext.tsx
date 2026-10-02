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

    try {
      const decodedUser = JSON.parse(atob(token));
      setUser(decodedUser);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    }
    setLoading(false);
  }, []);

  async function login(email: string, password: string) {
    // Local dummy login as requested (bypassing backend API)
    const name = email.split('@')[0] || 'User';
    const fakeUser = { userId: email, email, name, displayName: name };
    localStorage.setItem('token', btoa(JSON.stringify(fakeUser)));
    setUser(fakeUser);
    return { success: true, user: fakeUser };
  }

  async function signup(name: string, email: string, password: string) {
    // Local dummy signup as requested (bypassing backend API)
    const fakeUser = { userId: email, email, name, displayName: name };
    localStorage.setItem('token', btoa(JSON.stringify(fakeUser)));
    setUser(fakeUser);
    return { success: true, user: fakeUser };
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
