import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, Package, TrendingUp, Truck, Loader2, AlertCircle, 
  BarChart3, CheckCircle, Clock, Award, ShieldCheck 
} from "lucide-react";
import { getUser } from "@/lib/api";

const AdminHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalNGOs: 0,
    totalLogistics: 0,
    totalSurplus: 0,
    activeSurplus: 0,
    deliveredSurplus: 0,
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
    pendingVerifications: 0,
    totalImpact: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const user = getUser();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all admin endpoints
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [usersRes, surplusRes, tasksRes] = await Promise.all([
        fetch('http://localhost:3000/api/admin/users', { headers, credentials: 'include' }),
        fetch('http://localhost:3000/api/admin/surplus', { headers, credentials: 'include' }),
        fetch('http://localhost:3000/api/admin/tasks', { headers, credentials: 'include' }),
      ]);

      const usersData = await usersRes.json();
      const surplusData = await surplusRes.json();
      const tasksData = await tasksRes.json();

      if (usersData.success && surplusData.success && tasksData.success) {
        const users = usersData.data || [];
        const surplus = surplusData.data || [];
        const tasks = tasksData.data || [];

        // Calculate statistics
        const donors = users.filter((u: any) => u.role === 'donor');
        const ngos = users.filter((u: any) => u.role === 'ngo');
        const logistics = users.filter((u: any) => u.role === 'logistics');
        const pendingVerifications = users.filter((u: any) => !u.isVerified).length;

        const activeSurplus = surplus.filter((s: any) => s.status === 'available' || s.status === 'claimed').length;
        const deliveredSurplus = surplus.filter((s: any) => s.status === 'delivered').length;

        const completedTasks = tasks.filter((t: any) => t.status === 'delivered').length;
        const activeTasks = tasks.filter((t: any) => 
          t.status === 'assigned' || t.status === 'picked-up' || t.status === 'in-transit'
        ).length;

        // Calculate total impact (total quantity of delivered surplus)
        const totalImpact = surplus
          .filter((s: any) => s.status === 'delivered')
          .reduce((sum: number, s: any) => sum + (s.quantity || 0), 0);

        setStats({
          totalUsers: users.length,
          totalDonors: donors.length,
          totalNGOs: ngos.length,
          totalLogistics: logistics.length,
          totalSurplus: surplus.length,
          activeSurplus,
          deliveredSurplus,
          totalTasks: tasks.length,
          completedTasks,
          activeTasks,
          pendingVerifications,
          totalImpact,
        });

        // Set recent activity (last 5 tasks)
        setRecentActivity(tasks.slice(0, 5));
      } else {
        setError("Failed to fetch admin data");
      }
    } catch (err: any) {
      console.error('Fetch admin data error:', err);
      setError(err.message || "An error occurred while fetching admin data");
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    { 
      label: "Total Users", 
      value: stats.totalUsers, 
      icon: Users, 
      color: "text-primary",
      bgColor: "bg-primary/10",
      subtitle: `${stats.totalDonors}D • ${stats.totalNGOs}N • ${stats.totalLogistics}L`
    },
    { 
      label: "Total Surplus", 
      value: stats.totalSurplus, 
      icon: Package, 
      color: "text-success",
      bgColor: "bg-success/10",
      subtitle: `${stats.activeSurplus} active • ${stats.deliveredSurplus} delivered`
    },
    { 
      label: "Total Tasks", 
      value: stats.totalTasks, 
      icon: Truck, 
      color: "text-warning",
      bgColor: "bg-warning/10",
      subtitle: `${stats.completedTasks} completed • ${stats.activeTasks} active`
    },
    { 
      label: "Platform Impact", 
      value: stats.totalImpact, 
      icon: Award, 
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      subtitle: "Total units delivered"
    }
  ];

  const getTaskStatusDisplay = (status: string) => {
    const statusMap: any = {
      'delivered': 'Completed',
      'picked-up': 'Picked Up',
      'in-transit': 'In Transit',
      'assigned': 'Assigned',
      'pending': 'Pending'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-success';
      case 'picked-up': 
      case 'in-transit': 
      case 'assigned': return 'text-primary';
      case 'pending': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading admin dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Admin'}!</h2>
        <p className="text-muted-foreground">Platform overview and system management</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsConfig.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 ${stat.bgColor} rounded-full`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Verification Alert */}
      {stats.pendingVerifications > 0 && (
        <Alert className="border-warning bg-warning/5">
          <ShieldCheck className="h-4 w-4 text-warning" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>{stats.pendingVerifications}</strong> users pending verification
            </span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/dashboard/admin/verification')}
            >
              Review Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dashboard/admin/users')}
          >
            <Users className="w-6 h-6" />
            <span>Manage Users</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dashboard/admin/analytics')}
          >
            <BarChart3 className="w-6 h-6" />
            <span>View Analytics</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dashboard/admin/verification')}
          >
            <ShieldCheck className="w-6 h-6" />
            <span>Verifications</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-6 flex-col gap-2"
            onClick={() => navigate('/dashboard/admin/impact')}
          >
            <TrendingUp className="w-6 h-6" />
            <span>Impact Report</span>
          </Button>
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-success/20 bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Active Users</h4>
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div className="text-2xl font-bold">{stats.totalUsers - stats.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground mt-1">Verified and active</p>
          </CardContent>
        </Card>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Active Deliveries</h4>
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
          </CardContent>
        </Card>
        <Card className="border-warning/20 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Completion Rate</h4>
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <div className="text-2xl font-bold">
              {stats.totalTasks > 0 
                ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(0)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Overall success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
          <CardDescription>Latest tasks and deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((task: any) => (
                <div key={task._id} className="flex items-start justify-between p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-primary" />
                      <p className="font-medium">
                        {task.surplusId?.title || 'Delivery Task'}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Donor → NGO delivery</p>
                      <p className="text-xs">
                        Created: {new Date(task.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
                    {getTaskStatusDisplay(task.status)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No recent activity</p>
              <p className="text-sm mt-2">Platform activity will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Platform Performance</h3>
            <div className="grid md:grid-cols-4 gap-4 mt-4">
              <div className="p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-primary mb-1">
                  {stats.totalDonors}
                </div>
                <p className="text-sm text-muted-foreground">Active Donors</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-success mb-1">
                  {stats.totalNGOs}
                </div>
                <p className="text-sm text-muted-foreground">Registered NGOs</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-warning mb-1">
                  {stats.totalLogistics}
                </div>
                <p className="text-sm text-muted-foreground">Logistics Partners</p>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-destructive mb-1">
                  {stats.deliveredSurplus}
                </div>
                <p className="text-sm text-muted-foreground">Completed Deliveries</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="mt-6"
              onClick={() => navigate('/dashboard/admin/analytics')}
            >
              View Detailed Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHome;
