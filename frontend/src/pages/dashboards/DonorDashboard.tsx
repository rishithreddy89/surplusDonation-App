import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import DonorHome from "@/components/donor/DonorHome";
import AddSurplus from "@/components/donor/AddSurplus";
import MyDonations from "@/components/donor/MyDonations";
import TrackDonation from "@/components/donor/TrackDonation";
import Impact from "@/components/donor/Impact";
import Leaderboard from "@/components/donor/Leaderboard";
import Profile from "@/components/donor/Profile";
import NearbyNGOFinder from "@/components/donor/NearbyNGOFinder";
import SupportCenter from "@/components/ui/SupportCenter";
import TaxBenefitsPage from "@/pages/donor/TaxBenefitsPage";
import DonateMoney from "@/components/donor/DonateMoney";
import DonationHistory from "@/components/donor/DonationHistory";
import ViewNGORequests from "@/components/donor/ViewNGORequests";
import BrowseNGOs from "@/components/donor/BrowseNGOs";

const DonorDashboard = () => {
  return (
    <DashboardLayout userRole="donor">
      <Routes>
        <Route index element={<DonorHome />} />
        <Route path="donations" element={<MyDonations />} />
        <Route path="add-surplus" element={<AddSurplus />} />
        <Route path="browse-ngos" element={<BrowseNGOs />} />
        <Route path="ngo-requests" element={<ViewNGORequests />} />
        <Route path="donate-money" element={<DonateMoney />} />
        <Route path="donation-history" element={<DonationHistory />} />
        <Route path="track" element={<TrackDonation />} />
        <Route path="find-ngos" element={<NearbyNGOFinder />} />
        <Route path="impact" element={<Impact />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="support" element={<SupportCenter />} />
        <Route path="profile" element={<Profile />} />
        <Route path="tax-benefits" element={<TaxBenefitsPage />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DonorDashboard;
