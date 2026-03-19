// client-web/src/components/auth/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  /**
   * Restrict access to specific user roles (PRD §19 - RBAC)
   * Example: allowedRoles={['admin', 'owner']}
   */
  allowedRoles?: UserRole[];
  
  /**
   * Restrict access by specific permission
   * Example: permission="properties:create"
   */
  permission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles, 
  permission 
}) => {
  const { isAuthenticated, isLoading, user, hasRole, can } = useAuth();
  const location = useLocation();

  // ============================================================================
  // LOADING STATE: Wait for auth initialization
  // ============================================================================
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // UNAUTHENTICATED: Redirect to login with return path
  // ============================================================================
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location, message: 'Please sign in to continue' }} 
        replace 
      />
    );
  }

  // ============================================================================
  // ROLE-BASED ACCESS CONTROL (PRD §19)
  // ============================================================================
  if (allowedRoles && allowedRoles.length > 0) {
    if (!hasRole(allowedRoles)) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ 
            message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
            userRole: user.role 
          }} 
          replace 
        />
      );
    }
  }

  // ============================================================================
  // PERMISSION-BASED ACCESS CONTROL (Fine-grained RBAC)
  // ============================================================================
  if (permission) {
    if (!can(permission)) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ 
            message: `Access denied. Required permission: ${permission}`,
            userRole: user.role,
            userPermissions: 'Contact admin for access'
          }} 
          replace 
        />
      );
    }
  }

  // ============================================================================
  // AUTHORIZED: Render child routes
  // ============================================================================
  return <Outlet />;
};

export default ProtectedRoute;