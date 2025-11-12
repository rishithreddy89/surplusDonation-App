import { Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import NGOHome from "@/components/ngo/NGOHome";
import AvailableSurplus from "@/components/ngo/AvailableSurplus";
import RequestSurplus from "@/components/ngo/RequestSurplus";
import MyRequests from "@/components/ngo/MyRequests";
import ImpactReports from "@/components/ngo/ImpactReports";
import UrgentNeeds from "@/components/ngo/UrgentNeeds";
import NGOLeaderboard from "@/components/ngo/NGOLeaderboard";
import NGOProfile from "@/components/ngo/NGOProfile";
import RequestTracking from "@/components/ngo/RequestTracking";
import NearbyNGOFinder from "@/components/donor/NearbyNGOFinder";
import SupportCenter from "@/components/ui/SupportCenter";
import GiveDonationFeedback from "@/components/ngo/GiveDonationFeedback";

const NGODashboard = () => {
  return (
    <DashboardLayout userRole="ngo">
      <Routes>
        <Route index element={<NGOHome />} />
        <Route path="browse" element={<AvailableSurplus />} />
        <Route path="request" element={<RequestSurplus />} />
        <Route path="requests" element={<MyRequests />} />
        <Route path="track-requests" element={<RequestTracking />} />
        <Route path="find-partners" element={<NearbyNGOFinder />} />
        <Route path="urgent" element={<UrgentNeeds />} />
        <Route path="impact" element={<ImpactReports />} />
        <Route path="leaderboard" element={<NGOLeaderboard />} />
        <Route path="give-feedback" element={<GiveDonationFeedback />} />
        <Route path="support" element={<SupportCenter />} />
        <Route path="profile" element={<NGOProfile />} />
      </Routes>
    </DashboardLayout>
  );
};

export default NGODashboard;
