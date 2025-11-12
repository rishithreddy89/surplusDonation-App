import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import RoleSelection from "./pages/RoleSelection";
import Auth from "./pages/Auth";
import SponsorInfo from "./pages/SponsorInfo";
import DonorDashboard from "./pages/dashboards/DonorDashboard";
import NGODashboard from "./pages/dashboards/NGODashboard";
import LogisticsDashboard from "./pages/dashboards/LogisticsDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicVolunteerProfile from './pages/PublicVolunteerProfile';
import TaxBenefitsPage from './pages/donor/TaxBenefitsPage';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* Global theme toggle visible on all pages (top-right). */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/select-role" element={<RoleSelection />} />
          <Route path="/auth/:role" element={<Auth />} />
          <Route path="/be-a-sponsor" element={<SponsorInfo />} />
          <Route 
            path="/dashboard/donor/*" 
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/donor/tax-benefits" 
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <TaxBenefitsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/ngo/*" 
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <NGODashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/logistics/*" 
            element={
              <ProtectedRoute allowedRoles={['logistics']}>
                <LogisticsDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/volunteer/profile/:userId" element={<PublicVolunteerProfile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
