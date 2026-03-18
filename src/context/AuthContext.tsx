import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'agent' | 'end_user';
  department: string;
  avatar: string;
  phone?: string;
  timezone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, department?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'itsm_auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (authToken: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth', {
        body: { action: 'verify', token: authToken },
      });

      if (error || data?.error) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } else if (data?.user) {
        setToken(authToken);
        setUser(data.user);
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth', {
        body: { action: 'login', email, password },
      });

      if (error) {
        return { success: false, error: 'Network error. Please try again.' };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      if (data?.user && data?.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: 'Login failed. Please try again.' };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, department?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth', {
        body: { action: 'register', email, password, name, department },
      });

      if (error) {
        return { success: false, error: 'Network error. Please try again.' };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      if (data?.user && data?.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: 'Registration failed. Please try again.' };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await supabase.functions.invoke('auth', {
          body: { action: 'logout', token },
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, [token]);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth', {
        body: { action: 'request-reset', email },
      });

      if (error) {
        return { success: false, error: 'Network error. Please try again.' };
      }

      return { success: true };
    } catch (err) {
      console.error('Password reset request error:', err);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  }, []);

  const resetPassword = useCallback(async (resetToken: string, newPassword: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('auth', {
        body: { action: 'reset-password', token: resetToken, newPassword },
      });

      if (error) {
        return { success: false, error: 'Network error. Please try again.' };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      return { success: true };
    } catch (err) {
      console.error('Password reset error:', err);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await supabase.functions.invoke('auth', {
        body: { action: 'update-profile', token, updates },
      });

      if (error) {
        return { success: false, error: 'Network error. Please try again.' };
      }

      if (data?.error) {
        return { success: false, error: data.error };
      }

      if (data?.user) {
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: 'Update failed. Please try again.' };
    } catch (err) {
      console.error('Profile update error:', err);
      return { success: false, error: 'An unexpected error occurred.' };
    }
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
