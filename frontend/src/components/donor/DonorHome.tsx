import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, TrendingUp, Clock, Heart, Loader2, AlertCircle } from "lucide-react";
import { getDonorSurplus, getDonorImpact, getUser } from "@/lib/api";

const DonorHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalDonations: 0,
    peopleHelped: 0,
    pendingPickups: 0,
    impactScore: 0,
  });
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const user = getUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch impact data
      const impactResponse = await getDonorImpact();
      
      // Fetch recent donations
      const donationsResponse = await getDonorSurplus({});

      if (impactResponse.success && donationsResponse.success) {
        const impact = impactResponse.data;
        const donations = donationsResponse.data || [];

        setStats({
          totalDonations: impact.totalDonations || 0, // Only in-transit + delivered
          peopleHelped: (impact.totalQuantity || 0) * 3,
          pendingPickups: donations.filter((d: any) => d.status === 'available' || d.status === 'claimed').length,
          impactScore: (impact.deliveredDonations || 0) * 10 + (impact.totalQuantity || 0),
        });

        setRecentDonations(donations.slice(0, 3));
      } else {
        setError("Failed to fetch dashboard data");
      }
    } catch (err: any) {
      console.error('Fetch dashboard error:', err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    { label: "Total Donations", value: stats.totalDonations, icon: Package, color: "text-primary" },
    { label: "People Helped", value: stats.peopleHelped, icon: Heart, color: "text-destructive" },
    { label: "Pending Pickups", value: stats.pendingPickups, icon: Clock, color: "text-warning" },
    { label: "Impact Score", value: stats.impactScore, icon: TrendingUp, color: "text-success" }
  ];

  const getStatusDisplay = (status: string) => {
    const statusMap: any = {
      'delivered': 'Completed',
      'in-transit': 'In Transit',
      'claimed': 'Claimed',
      'available': 'Available'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Donor'}!</h2>
        <p className="text-muted-foreground">Here's your donation summary and quick actions.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get started</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dashboard/donor/add-surplus')}
          >
            <Package className="w-6 h-6" />
            <span>Donate Surplus</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dashboard/donor/track')}
          >
            <Clock className="w-6 h-6" />
            <span>Track Status</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dashboard/donor/impact')}
          >
            <TrendingUp className="w-6 h-6" />
            <span>View Impact</span>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentDonations.length > 0 ? (
            <div className="space-y-4">
              {recentDonations.map((donation) => (
                <div key={donation._id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{donation.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {donation.quantity} {donation.unit} - {donation.category}
                    </p>
                  </div>
                  <span className={`text-sm ${
                    donation.status === 'delivered' ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    {getStatusDisplay(donation.status)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No recent activity. Start by donating surplus items!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DonorHome;
