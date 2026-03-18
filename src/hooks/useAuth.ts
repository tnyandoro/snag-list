// src/hooks/useAuth.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import { authService, User, LoginRequest, RegisterRequest, AuthResponse } from '@/services/api';
import { useAuth as useAuthContext } from '@/context/AuthContext';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const authQueryKeys = {
  all: ['auth'] as const,
  user: () => [...authQueryKeys.all, 'user'] as const,
  me: () => [...authQueryKeys.user(), 'me'] as const,
};

// ============================================================================
// CURRENT USER HOOK
// PRD §19 - Security Requirements
// ============================================================================

export const useCurrentUser = (enabled = true) => {
  return useQuery({
    queryKey: authQueryKeys.me(),
    queryFn: () => authService.me().then((res) => res.data),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry on 401
  });
};

// ============================================================================
// LOGIN MUTATION
// PRD §19 - Secure Authentication
// ============================================================================

export const useLogin = (
  options?: UseMutationOptions<AuthResponse, Error, LoginRequest>
) => {
  const queryClient = useQueryClient();
  const { login: loginContext } = useAuthContext();

  return useMutation({
    mutationFn: (credentials: LoginRequest) =>
      authService.login(credentials).then((res) => res.data),
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem('auth_token', data.token);
      
      // Update AuthContext
      loginContext(data.user.email, ''); // Password not stored
      
      // Set user in query cache
      queryClient.setQueryData(authQueryKeys.me(), data.user);
      
      options?.onSuccess?.(data);
    },
    ...options,
  });
};

// ============================================================================
// REGISTER MUTATION
// PRD §2, §19 - User Roles & Authentication
// ============================================================================

export const useRegister = (
  options?: UseMutationOptions<AuthResponse, Error, RegisterRequest>
) => {
  const queryClient = useQueryClient();
  const { login: loginContext } = useAuthContext();

  return useMutation({
    mutationFn: (userData: RegisterRequest) =>
      authService.register(userData).then((res) => res.data),
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      loginContext(data.user.email, '');
      queryClient.setQueryData(authQueryKeys.me(), data.user);
      options?.onSuccess?.(data);
    },
    ...options,
  });
};

// ============================================================================
// LOGOUT MUTATION
// ============================================================================

export const useLogout = (
  options?: UseMutationOptions<void, Error, void>
) => {
  const queryClient = useQueryClient();
  const { logout: logoutContext } = useAuthContext();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear token
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // Clear auth context
      logoutContext();
      
      // Clear all queries
      queryClient.clear();
      
      options?.onSuccess?.();
    },
    onError: () => {
      // Even if API call fails, clear local state
      localStorage.removeItem('auth_token');
      logoutContext();
      queryClient.clear();
    },
    ...options,
  });
};

// ============================================================================
// REFRESH TOKEN MUTATION
// PRD §19 - Session Management
// ============================================================================

export const useRefreshToken = (
  options?: UseMutationOptions<AuthResponse, Error, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      authService.refreshToken().then((res) => res.data),
    onSuccess: (data) => {
      localStorage.setItem('auth_token', data.token);
      queryClient.setQueryData(authQueryKeys.me(), data.user);
      options?.onSuccess?.(data);
    },
    ...options,
  });
};

// ============================================================================
// FORGOT PASSWORD MUTATION
// ============================================================================

export const useForgotPassword = (
  options?: UseMutationOptions<void, Error, string>
) => {
  return useMutation({
    mutationFn: (email: string) =>
      authService.forgotPassword(email),
    ...options,
  });
};

// ============================================================================
// RESET PASSWORD MUTATION
// ============================================================================

export const useResetPassword = (
  options?: UseMutationOptions<void, Error, { token: string; password: string }>
) => {
  return useMutation({
    mutationFn: ({ token, password }) =>
      authService.resetPassword(token, password),
    ...options,
  });
};

// ============================================================================
// ROLE-BASED ACCESS HOOKS
// PRD §2, §19 - Role-Based Access Control
// ============================================================================

export const useHasRole = (allowedRoles: string[]) => {
  const {  user } = useCurrentUser();
  return user ? allowedRoles.includes(user.role) : false;
};

export const useIsAdmin = () => {
  return useHasRole(['admin']);
};

export const useIsOwner = () => {
  return useHasRole(['owner', 'admin']);
};

export const useIsInspector = () => {
  return useHasRole(['inspector', 'admin']);
};

export const useIsVendor = () => {
  return useHasRole(['vendor', 'admin']);
};

// ============================================================================
// PERMISSION CHECK HOOK
// For fine-grained permission control
// ============================================================================

export const useHasPermission = (permission: string) => {
  const {  user } = useCurrentUser();
  // This would integrate with your backend permissions system
  // For now, role-based check
  const rolePermissions: Record<string, string[]> = {
    admin: ['all'],
    owner: ['properties:create', 'properties:edit', 'jobs:approve', 'payments:approve'],
    inspector: ['inspections:create', 'inspections:edit', 'issues:create'],
    vendor: ['jobs:view_assigned', 'jobs:complete', 'invoices:submit'],
    tenant: ['issues:create', 'reports:view'],
  };

  if (!user) return false;
  if (rolePermissions[user.role]?.includes('all')) return true;
  return rolePermissions[user.role]?.includes(permission) || false;
};