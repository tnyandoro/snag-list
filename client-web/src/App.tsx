// client-web/src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth, UserRole } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// ============================================================================
// PUBLIC PAGES (No authentication required)
// ============================================================================
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// ============================================================================
// PROTECTED PAGES (Authentication required)
// ============================================================================

// Dashboard (PRD §21 - MVP Core)
import Dashboard from "./pages/Dashboard";

// Property Management (PRD §3-5)
import PropertyList from "./pages/properties/PropertyList";
import PropertyDetail from "./pages/properties/PropertyDetail";
import PropertyForm from "./pages/properties/PropertyForm";
import StructureEditor from "./pages/properties/StructureEditor";

// Inspections (PRD §6-7, Architecture Task 3 - Mobile Workflow)
import InspectionList from "./pages/inspections/InspectionList";
import InspectionForm from "./pages/inspections/InspectionForm";
import InspectionDetail from "./pages/inspections/InspectionDetail";

// Issue Management (PRD §8)
import IssueList from "./pages/issues/IssueList";
import IssueDetail from "./pages/issues/IssueDetail";

// Vendor Marketplace (PRD §9-10, Architecture Task 5)
import VendorList from "./pages/vendors/VendorList";
import VendorDetail from "./pages/vendors/VendorDetail";
import VendorProfile from "./pages/vendors/VendorProfile";

// Job Management (PRD §11-13)
import AssignVendor from "./pages/jobs/AssignVendor";
import JobList from "./pages/jobs/JobList";
import JobDetail from "./pages/jobs/JobDetail";

// Reports & Analytics (PRD §16-17)
import Reports from "./pages/reports/Reports";

// User Settings (PRD §19 - Security & Profile)
import Settings from "./pages/settings/Settings";

// ============================================================================
// CONFIGURATION
// ============================================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// ============================================================================
// ROOT REDIRECT: Auth-aware landing page
// ============================================================================

const RootRedirect = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-lg" />
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect based on auth status
  return isAuthenticated 
    ? <Navigate to="/dashboard" replace /> 
    : <Navigate to="/login" replace />;
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const App = () => (
  <ThemeProvider defaultTheme="light">
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              
              {/* ═══════════════════════════════════════════════════════════ */}
              {/* PUBLIC ROUTES (No authentication required)                 */}
              {/* ═══════════════════════════════════════════════════════════ */}
              
              {/* Root path - redirect based on auth status */}
              <Route path="/" element={<RootRedirect />} />
              
              {/* Authentication flows */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              
              {/* Access denied page */}
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Public legal pages */}
              <Route path="/privacy" element={
                <div className="p-8 max-w-4xl mx-auto">
                  <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Privacy Policy</h1>
                  <div className="prose prose-sm dark:prose-invert">
                    <p className="text-gray-600 dark:text-gray-400">Your privacy is important to us...</p>
                  </div>
                </div>
              } />
              <Route path="/terms" element={
                <div className="p-8 max-w-4xl mx-auto">
                  <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Terms of Service</h1>
                  <div className="prose prose-sm dark:prose-invert">
                    <p className="text-gray-600 dark:text-gray-400">By using this platform, you agree to...</p>
                  </div>
                </div>
              } />
              
              {/* ═══════════════════════════════════════════════════════════ */}
              {/* PROTECTED ROUTES (Authentication required)                  */}
              {/* ═══════════════════════════════════════════════════════════ */}
              <Route element={<ProtectedRoute />}>
                
                {/* ───────────────────────────────────────────────────────── */}
                {/* DASHBOARD (PRD §21 - MVP Core)                            */}
                {/* ───────────────────────────────────────────────────────── */}
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* ───────────────────────────────────────────────────────── */}
                {/* PROPERTY MANAGEMENT (PRD §3-5)                            */}
                {/* Roles: admin, owner, inspector                            */}
                {/* ───────────────────────────────────────────────────────── */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'owner', 'inspector']} />}>
                  <Route path="/properties" element={<PropertyList />} />
                  <Route path="/properties/:id" element={<PropertyDetail />} />
                  <Route path="/properties/:id/structure" element={<StructureEditor />} />
                </Route>
                
                {/* Property creation/editing - Owner/Admin only */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'owner']} />}>
                  <Route path="/properties/new" element={<PropertyForm />} />
                  <Route path="/properties/:id/edit" element={<PropertyForm />} />
                </Route>
                
                {/* ───────────────────────────────────────────────────────── */}
                {/* INSPECTIONS (PRD §6-7, Task 3 - Mobile Workflow)          */}
                {/* Roles: admin, inspector                                   */}
                {/* ───────────────────────────────────────────────────────── */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'inspector']} />}>
                  <Route path="/inspections" element={<InspectionList />} />
                  <Route path="/properties/:propertyId/inspections" element={<InspectionList />} />
                  <Route path="/properties/:propertyId/inspections/new" element={<InspectionForm />} />
                  <Route path="/inspections/:id" element={<InspectionDetail />} />
                  <Route path="/inspections/:id/edit" element={<InspectionForm />} />
                </Route>
                
                {/* ───────────────────────────────────────────────────────── */}
                {/* ISSUE MANAGEMENT (PRD §8)                                 */}
                {/* Roles: admin, owner, tenant, inspector                    */}
                {/* ───────────────────────────────────────────────────────── */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'owner', 'tenant', 'inspector']} />}>
                  <Route path="/issues" element={<IssueList />} />
                  <Route path="/issues/:id" element={<IssueDetail />} />
                </Route>
                
                {/* Issue assignment - Owner/Admin only */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'owner']} permission="issues:assign" />}>
                  <Route path="/issues/:issueId/assign" element={<AssignVendor />} />
                </Route>
                
                {/* ───────────────────────────────────────────────────────── */}
                {/* VENDOR MARKETPLACE (PRD §9-10, Task 5)                    */}
                {/* Roles: admin, owner                                       */}
                {/* ───────────────────────────────────────────────────────── */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'owner']} />}>
                  <Route path="/vendors" element={<VendorList />} />
                  <Route path="/vendors/:id" element={<VendorDetail />} />
                  <Route path="/vendors/:id/profile" element={<VendorProfile />} />
                </Route>
                
                {/* Vendor application - Any authenticated user can apply */}
                <Route path="/vendors/apply" element={<VendorProfile />} />
                
                {/* ───────────────────────────────────────────────────────── */}
                {/* JOB MANAGEMENT (PRD §11-13)                               */}
                {/* Roles: admin, owner, vendor                               */}
                {/* ───────────────────────────────────────────────────────── */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'owner', 'vendor']} />}>
                  <Route path="/jobs" element={<JobList />} />
                  <Route path="/jobs/:id" element={<JobDetail />} />
                  <Route path="/jobs/:id/complete" element={<JobDetail />} />
                </Route>
                
                {/* ───────────────────────────────────────────────────────── */}
                {/* REPORTS & ANALYTICS (PRD §16-17)                          */}
                {/* Roles: admin, owner, inspector                            */}
                {/* ───────────────────────────────────────────────────────── */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'owner', 'inspector']} />}>
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/reports/:id" element={<Reports />} />
                </Route>
                
                {/* ───────────────────────────────────────────────────────── */}
                {/* USER SETTINGS (PRD §19 - Security & Profile)              */}
                {/* All authenticated users can access their own settings     */}
                {/* ───────────────────────────────────────────────────────── */}
                <Route path="/settings" element={<Settings />} />
                <Route path="/settings/profile" element={<Settings />} />
                <Route path="/settings/security" element={<Settings />} />
                <Route path="/settings/notifications" element={<Settings />} />
                
              </Route>
              
              {/* ═══════════════════════════════════════════════════════════ */}
              {/* CATCH-ALL: 404 Not Found                                    */}
              {/* ═══════════════════════════════════════════════════════════ */}
              <Route path="*" element={<NotFound />} />
              
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;