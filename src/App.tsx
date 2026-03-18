// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import PropertyList from "./pages/properties/PropertyList";
import PropertyDetail from "./pages/properties/PropertyDetail";
import PropertyForm from "./pages/properties/PropertyForm";
import StructureEditor from "./pages/properties/StructureEditor";
import InspectionList from "./pages/inspections/InspectionList";
import InspectionForm from "./pages/inspections/InspectionForm";
import InspectionDetail from "./pages/inspections/InspectionDetail";
import IssueList from "./pages/issues/IssueList";
import IssueDetail from "./pages/issues/IssueDetail";
import AssignVendor from "./pages/jobs/AssignVendor";
import VendorList from "./pages/vendors/VendorList";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* === Public Routes === */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* === Protected Routes === */}
              <Route element={<ProtectedRoute />}>
                {/* Dashboard */}
                <Route path="/" element={<Dashboard />} />
                
                {/* Property Management (PRD §3-5) */}
                <Route path="/properties" element={<PropertyList />} />
                <Route path="/properties/new" element={<PropertyForm />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/properties/:id/structure" element={<StructureEditor />} />
                
                {/* Inspections (PRD §6-7) */}
                <Route path="/properties/:propertyId/inspections" element={<InspectionList />} />
                <Route path="/properties/:propertyId/inspections/new" element={<InspectionForm />} />
                <Route path="/inspections/:id" element={<InspectionDetail />} />
                
                {/* Issue Management (PRD §8) */}
                <Route path="/issues" element={<IssueList />} />
                <Route path="/issues/:id" element={<IssueDetail />} />
                
                {/* Vendor & Job Management (PRD §9-13) */}
                <Route path="/vendors" element={<VendorList />} />
                <Route path="/issues/:id/assign" element={<AssignVendor />} />
              </Route>
              
              {/* === 404 === */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;