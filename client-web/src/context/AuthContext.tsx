// client-web/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from '@/components/ui/use-toast';

// ============================================================================
// TYPES & INTERFACES (Aligned with PRD §2 & Architecture Task 2)
// ============================================================================

export type UserRole = 'admin' | 'owner' | 'tenant' | 'inspector' | 'vendor';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  company?: string;
  is_active: boolean;
  email_verified_at?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  // Notification preferences (PRD §19)
  notify_email?: boolean;
  notify_push?: boolean;
  notify_sms?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

interface AuthContextType {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<{ success: boolean; error?: string }>;
  
  // Password management
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;
  
  // Profile management
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  
  // Role-based access (PRD §19 - RBAC)
  hasRole: (roles: UserRole[]) => boolean;
  can: (permission: string) => boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  company?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'property_platform_auth_token';
const USER_KEY = 'property_platform_user';

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================================
  // INITIALIZATION: Check for existing auth on mount
  // ============================================================================
  
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        
        if (storedToken && storedUser) {
          // Verify token with backend
          const isValid = await verifyToken(storedToken);
          if (isValid) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token invalid, clear storage
            clearAuth();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // ============================================================================
  // TOKEN VERIFICATION
  // ============================================================================
  
  const verifyToken = async (authToken: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return false;
      }
      
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.error('Token verification failed:', error);
      return false;
    }
  };

  // ============================================================================
  // AUTHENTICATION ACTIONS
  // ============================================================================
  
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Invalid email or password' };
      }

      // Store auth data
      const { user: userData, token: authToken, expires_at } = result.data;
      
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      setToken(authToken);
      setUser(userData);

      toast({
        title: '🎉 Welcome back!',
        description: `Signed in as ${userData.full_name}`,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: '🔌 Connection error',
        description: 'Could not connect to the server. Please try again.',
        variant: 'destructive',
      });
      return { success: false, error: 'Network error. Please check your connection.' };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Registration failed' };
      }

      // Store auth data
      const { user: userData, token: authToken } = result.data;
      
      localStorage.setItem(TOKEN_KEY, authToken);
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      setToken(authToken);
      setUser(userData);

      toast({
        title: '✅ Account created!',
        description: 'Welcome to Property Platform',
      });

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An unexpected error occurred during registration.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Notify backend of logout (optional)
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {}); // Ignore errors on logout
      }
    } finally {
      clearAuth();
      toast({
        title: '👋 Logged out',
        description: 'You have been signed out successfully',
      });
    }
  }, [token]);

  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: token }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Token refresh failed' };
      }

      const { token: newToken, expires_at } = result.data;
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);

      return { success: true };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error: 'Failed to refresh session' };
    }
  }, [token]);

  // ============================================================================
  // PASSWORD MANAGEMENT
  // ============================================================================
  
  const forgotPassword = useCallback(async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Request failed' };
      }

      toast({
        title: '📧 Check your email',
        description: 'Password reset instructions have been sent',
      });

      return { success: true };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, error: 'Failed to send reset instructions' };
    }
  }, []);

  const resetPassword = useCallback(async (resetToken: string, newPassword: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, password: newPassword }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Password reset failed' };
      }

      toast({
        title: '✅ Password updated',
        description: 'You can now sign in with your new password',
      });

      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  }, []);

  // ============================================================================
  // PROFILE MANAGEMENT
  // ============================================================================
  
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!token || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return { success: false, error: result.error || 'Update failed' };
      }

      // Update local state
      const updatedUser = { ...user, ...result.data, ...updates };
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

      toast({
        title: '✅ Profile updated',
        description: 'Your changes have been saved',
      });

      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }, [token, user]);

  // ============================================================================
  // ROLE-BASED ACCESS CONTROL (PRD §19)
  // ============================================================================
  
  const hasRole = useCallback((roles: UserRole[]): boolean => {
    if (!user?.role) return false;
    return roles.includes(user.role);
  }, [user]);

  const can = useCallback((permission: string): boolean => {
    if (!user?.role) return false;
    
    // Role-based permissions mapping (PRD §19 - RBAC)
    const permissions: Record<UserRole, string[]> = {
      admin: ['*'], // Admin has all permissions
      owner: [
        'properties:create', 'properties:read', 'properties:update', 'properties:delete',
        'inspections:read', 'issues:read', 'issues:assign',
        'jobs:approve', 'payments:approve', 'reports:read',
      ],
      inspector: [
        'properties:read',
        'inspections:create', 'inspections:read', 'inspections:update',
        'issues:create', 'issues:read',
        'reports:read',
      ],
      vendor: [
        'properties:read',
        'jobs:read_assigned', 'jobs:update', 'jobs:complete',
        'invoices:create', 'invoices:read',
      ],
      tenant: [
        'properties:read_assigned',
        'issues:create', 'issues:read_assigned',
        'reports:read_assigned',
      ],
    };

    const userPermissions = permissions[user.role] || [];
    
    // Admin has all permissions
    if (userPermissions.includes('*')) return true;
    
    return userPermissions.includes(permission);
  }, [user]);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const clearAuth = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================
  
  const value: AuthContextType = {
    // State
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    
    // Actions
    login,
    register,
    logout,
    refreshToken,
    
    // Password management
    forgotPassword,
    resetPassword,
    
    // Profile management
    updateProfile,
    
    // RBAC
    hasRole,
    can,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}