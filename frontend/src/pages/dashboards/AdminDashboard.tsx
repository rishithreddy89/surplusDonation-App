import { Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import AdminHome from "@/components/admin/AdminHome";
import Analytics from "@/components/admin/Analytics";
import ManageUsers from "@/components/admin/ManageUsers";
import VerificationCenter from "@/components/admin/VerificationCenter";
import Forecasting from "@/components/admin/Forecasting";
import SeasonalInsights from "@/components/admin/SeasonalInsights";
import ImpactDashboard from "@/components/admin/ImpactDashboard";
import SystemLogs from "@/components/admin/SystemLogs";
import AdminProfile from "@/components/admin/AdminProfile";
import Advertisements from "@/pages/admin/Advertisements";
import ComplaintsManagement from "@/components/admin/ComplaintsManagement";

const AdminDashboard = () => {
  return (
    <DashboardLayout userRole="admin">
      <Routes>
        <Route index element={<AdminHome />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="verification" element={<VerificationCenter />} />
        <Route path="complaints" element={<ComplaintsManagement />} />
        <Route path="forecasting" element={<Forecasting />} />
        <Route path="seasonal" element={<SeasonalInsights />} />
        <Route path="impact" element={<ImpactDashboard />} />
        <Route path="logs" element={<SystemLogs />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="advertisements" element={<Advertisements />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;
