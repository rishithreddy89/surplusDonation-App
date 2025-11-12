import { Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import LogisticsHome from "@/components/logistics/LogisticsHome";
import AvailableTasks from "@/components/logistics/AvailableTasks";
import ActiveDeliveries from "@/components/logistics/ActiveDeliveries";
import CompletedDeliveries from "@/components/logistics/CompletedDeliveries";
import RouteMap from "@/components/logistics/RouteMap";
import Performance from "@/components/logistics/Performance";
import LogisticsProfile from "@/components/logistics/LogisticsProfile";
import SupportCenter from "@/components/ui/SupportCenter";

const LogisticsDashboard = () => {
  return (
    <DashboardLayout userRole="logistics">
      <Routes>
        <Route index element={<LogisticsHome />} />
        <Route path="tasks" element={<AvailableTasks />} />
        <Route path="active" element={<ActiveDeliveries />} />
        <Route path="completed" element={<CompletedDeliveries />} />
        <Route path="map" element={<RouteMap />} />
        <Route path="performance" element={<Performance />} />
        <Route path="support" element={<SupportCenter />} />
        <Route path="profile" element={<LogisticsProfile />} />
      </Routes>
    </DashboardLayout>
  );
};

export default LogisticsDashboard;
