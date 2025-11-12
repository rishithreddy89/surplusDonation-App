import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, TrendingUp, Clock, Users, Loader2, AlertCircle, QrCode } from "lucide-react";
import { getNGORequests, getNGOImpact, getUser } from "@/lib/api";

const NGOHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalRequests: 0,
    fulfilledRequests: 0,
    receivedItems: 0,
    peopleServed: 0,
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const user = getUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [impactResponse, requestsResponse] = await Promise.all([
        getNGOImpact(),
        getNGORequests({}),
      ]);

      if (impactResponse.success && requestsResponse.success) {
        const impact = impactResponse.data;
        const requests = requestsResponse.data || [];

        setStats({
          totalRequests: impact.totalRequests || 0,
          fulfilledRequests: impact.fulfilledRequests || 0,
          receivedItems: impact.receivedItems || 0,
          peopleServed: impact.estimatedPeopleServed || 0,
        });

        setRecentRequests(requests.slice(0, 3));
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
    { label: "Total Requests", value: stats.totalRequests, icon: Package, color: "text-primary" },
    { label: "Fulfilled", value: stats.fulfilledRequests, icon: TrendingUp, color: "text-success" },
    { label: "Items Received", value: stats.receivedItems, icon: Users, color: "text-secondary" },
    { label: "People Served", value: stats.peopleServed, icon: Clock, color: "text-warning" }
  ];

  const getStatusDisplay = (status: string) => {
    const statusMap: any = {
      'fulfilled': 'Completed',
      'partially-fulfilled': 'In Progress',
      'open': 'Open',
      'closed': 'Closed'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled': return 'text-success';
      case 'partially-fulfilled': return 'text-primary';
      case 'open': return 'text-warning';
      default: return 'text-muted-foreground';
    }
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
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Organization'}!</h2>
        <p className="text-muted-foreground">Manage your requests and track received items</p>
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
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dashboard/ngo/browse')}
          >
            <Package className="w-6 h-6" />
            <span>Browse Surplus</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dashboard/ngo/request')}
          >
            <Clock className="w-6 h-6" />
            <span>Request Items</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dashboard/ngo/track-requests')}
          >
            <QrCode className="w-6 h-6" />
            <span>Track Requests</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dashboard/ngo/impact')}
          >
            <TrendingUp className="w-6 h-6" />
            <span>View Impact</span>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {recentRequests.length > 0 ? (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{request.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.quantity} {request.unit} - {request.category}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Priority: <span className="capitalize font-medium">{request.urgency}</span>
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(request.status)}`}>
                    {getStatusDisplay(request.status)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No recent requests</p>
              <p className="text-sm mt-2">Start by requesting items your organization needs!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impact Summary */}
      {stats.receivedItems > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Your Impact</h3>
              <p className="text-muted-foreground">
                You've received {stats.receivedItems} items, helping approximately {stats.peopleServed} people in your community.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/dashboard/ngo/impact')}
              >
                View Detailed Impact Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NGOHome;
