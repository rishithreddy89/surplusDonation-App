import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, TrendingUp, CheckCircle, Clock, Loader2, AlertCircle, Truck, Star } from "lucide-react";
import { getMyTasks, getLogisticsPerformance, getUser } from "@/lib/api";

const LogisticsHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    rating: "0.0",
    completionRate: "0",
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const user = getUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [performanceResponse, tasksResponse] = await Promise.all([
        getLogisticsPerformance(),
        getMyTasks({}),
      ]);

      if (performanceResponse.success && performanceResponse.data) {
        const perf = performanceResponse.data;
        setStats({
          totalTasks: perf.totalTasks || 0,
          completedTasks: perf.completedTasks || 0,
          activeTasks: tasksResponse.data?.filter((t: any) => t.status === 'assigned' || t.status === 'picked-up').length || 0,
          rating: perf.rating || "0.0",
          completionRate: perf.completionRate || "0",
        });
      }

      if (tasksResponse.success && tasksResponse.data) {
        setRecentTasks(tasksResponse.data.slice(0, 3));
      }
    } catch (err: any) {
      console.error('Fetch dashboard error:', err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    { label: "Total Deliveries", value: stats.totalTasks, icon: Package, color: "text-primary" },
    { label: "Completed", value: stats.completedTasks, icon: CheckCircle, color: "text-success" },
    { label: "Active Tasks", value: stats.activeTasks, icon: Clock, color: "text-warning" },
    { label: "Rating", value: stats.rating, icon: Star, color: "text-secondary" }
  ];

  const getStatusDisplay = (status: string) => {
    const statusMap: any = {
      'delivered': 'Completed',
      'picked-up': 'Picked Up',
      'assigned': 'Assigned',
      'pending': 'Pending'
    };
    return statusMap[status] || status;
  };

  const getSurplusTitle = (task: any) => {
    if (task.surplusId && typeof task.surplusId === 'object' && 'title' in task.surplusId) {
      return task.surplusId.title;
    }
    return 'Delivery Task';
  };

  const getPickupLocation = (task: any) => {
    return task.pickupLocation?.address || 'N/A';
  };

  const getDeliveryLocation = (task: any) => {
    return task.deliveryLocation?.address || 'N/A';
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
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Partner'}!</h2>
        <p className="text-muted-foreground">Track your deliveries and performance metrics</p>
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

      {/* Performance Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Completion Rate</h3>
              <p className="text-sm text-muted-foreground">Your overall delivery success rate</p>
            </div>
            <div className="text-4xl font-bold text-primary">{stats.completionRate}%</div>
          </div>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all"
              style={{ width: `${stats.completionRate}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your delivery tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dashboard/logistics/tasks')}
          >
            <Package className="w-6 h-6" />
            <span>Browse Tasks</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dashboard/logistics/active')}
          >
            <Clock className="w-6 h-6" />
            <span>Active Deliveries</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dashboard/logistics/performance')}
          >
            <TrendingUp className="w-6 h-6" />
            <span>View Performance</span>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks.length > 0 ? (
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task._id} className="flex items-start justify-between p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-primary" />
                      <p className="font-medium">{getSurplusTitle(task)}</p>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>📍 Pickup: {getPickupLocation(task)}</p>
                      <p>🎯 Delivery: {getDeliveryLocation(task)}</p>
                    </div>
                  </div>
                  <span className={`text-sm ${
                    task.status === 'delivered' ? 'text-success' : 
                    task.status === 'picked-up' ? 'text-primary' : 
                    'text-muted-foreground'
                  }`}>
                    {getStatusDisplay(task.status)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Truck className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No recent activity</p>
              <p className="text-sm mt-2">Accept tasks to start delivering!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Goals */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Today's Deliveries</h4>
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks assigned to you</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">This Week</h4>
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed deliveries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Your Rating</h4>
              <Star className="w-5 h-5 text-warning" />
            </div>
            <div className="text-2xl font-bold">{stats.rating}/5.0</div>
            <p className="text-xs text-muted-foreground mt-1">Partner rating</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LogisticsHome;
