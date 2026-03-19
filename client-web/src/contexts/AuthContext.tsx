// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/api'; // We'll create this next

export type Role = 'admin' | 'owner' | 'tenant' | 'inspector' | 'vendor';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (allowedRoles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));

  useEffect(() => {
    if (token) {
      // Validate token with backend on mount
      api.get('/auth/me')
        .then(({ data }) => setUser(data))
        .catch(() => logout());
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const hasRole = (allowedRoles: Role[]) => {
    return user?.role ? allowedRoles.includes(user.role) : false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: user?.role || null,
      token,
      login,
      logout,
      isAuthenticated: !!token,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};