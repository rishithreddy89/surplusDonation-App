import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Package, Users, Truck, TrendingUp, BarChart3, PieChart } from "lucide-react";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalNGOs: 0,
    totalLogistics: 0,
    totalSurplus: 0,
    availableSurplus: 0,
    deliveredSurplus: 0,
    totalTasks: 0,
    completedTasks: 0,
    activeTasks: 0,
  });
  const [surplusByCategory, setSurplusByCategory] = useState<any[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState<any[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Fetch all data in parallel
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

        // User statistics
        const donors = users.filter((u: any) => u.role === 'donor');
        const ngos = users.filter((u: any) => u.role === 'ngo');
        const logistics = users.filter((u: any) => u.role === 'logistics');

        // Surplus statistics
        const availableSurplus = surplus.filter((s: any) => s.status === 'available').length;
        const deliveredSurplus = surplus.filter((s: any) => s.status === 'delivered').length;

        // Task statistics
        const completedTasks = tasks.filter((t: any) => t.status === 'delivered').length;
        const activeTasks = tasks.filter((t: any) => 
          t.status === 'assigned' || t.status === 'picked-up' || t.status === 'in-transit'
        ).length;

        setStats({
          totalUsers: users.length,
          totalDonors: donors.length,
          totalNGOs: ngos.length,
          totalLogistics: logistics.length,
          totalSurplus: surplus.length,
          availableSurplus,
          deliveredSurplus,
          totalTasks: tasks.length,
          completedTasks,
          activeTasks,
        });

        // Calculate surplus by category
        const categoryMap: any = {};
        surplus.forEach((s: any) => {
          const category = s.category || 'other';
          if (!categoryMap[category]) {
            categoryMap[category] = { count: 0, totalQuantity: 0 };
          }
          categoryMap[category].count++;
          categoryMap[category].totalQuantity += s.quantity || 0;
        });

        const categoriesArray = Object.entries(categoryMap).map(([category, data]: [string, any]) => ({
          category,
          count: data.count,
          totalQuantity: data.totalQuantity,
        }));

        setSurplusByCategory(categoriesArray);

        // Calculate tasks by status
        const statusMap: any = {};
        tasks.forEach((t: any) => {
          const status = t.status || 'unknown';
          statusMap[status] = (statusMap[status] || 0) + 1;
        });

        const statusArray = Object.entries(statusMap).map(([status, count]) => ({
          status,
          count,
        }));

        setTasksByStatus(statusArray);
      } else {
        setError("Failed to fetch analytics data");
      }
    } catch (err: any) {
      console.error('Fetch analytics error:', err);
      setError(err.message || "An error occurred while fetching analytics");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: any = {
      food: 'bg-green-500',
      clothing: 'bg-blue-500',
      medical: 'bg-red-500',
      educational: 'bg-purple-500',
      other: 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      delivered: 'bg-success',
      'in-transit': 'bg-primary',
      'picked-up': 'bg-warning',
      assigned: 'bg-blue-500',
      pending: 'bg-gray-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Platform Analytics</h2>
        <p className="text-muted-foreground">Comprehensive insights into platform performance</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* User Statistics */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          User Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Users</p>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                All registered users
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Donors</p>
                <Package className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary">{stats.totalDonors}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                {stats.totalUsers > 0 ? ((stats.totalDonors / stats.totalUsers) * 100).toFixed(0) : 0}% of total
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">NGOs</p>
                <Users className="w-4 h-4 text-success" />
              </div>
              <div className="text-3xl font-bold text-success">{stats.totalNGOs}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                {stats.totalUsers > 0 ? ((stats.totalNGOs / stats.totalUsers) * 100).toFixed(0) : 0}% of total
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Logistics</p>
                <Truck className="w-4 h-4 text-warning" />
              </div>
              <div className="text-3xl font-bold text-warning">{stats.totalLogistics}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                {stats.totalUsers > 0 ? ((stats.totalLogistics / stats.totalUsers) * 100).toFixed(0) : 0}% of total
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Surplus Statistics */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Surplus Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Surplus</p>
                <Package className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-bold">{stats.totalSurplus}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                All surplus items created
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Available</p>
                <Package className="w-4 h-4 text-warning" />
              </div>
              <div className="text-3xl font-bold text-warning">{stats.availableSurplus}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                {stats.totalSurplus > 0 ? ((stats.availableSurplus / stats.totalSurplus) * 100).toFixed(0) : 0}% of total
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Delivered</p>
                <Package className="w-4 h-4 text-success" />
              </div>
              <div className="text-3xl font-bold text-success">{stats.deliveredSurplus}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                {stats.totalSurplus > 0 ? ((stats.deliveredSurplus / stats.totalSurplus) * 100).toFixed(0) : 0}% of total
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Surplus by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Surplus by Category
          </CardTitle>
          <CardDescription>Distribution of surplus items across categories</CardDescription>
        </CardHeader>
        <CardContent>
          {surplusByCategory.length > 0 ? (
            <div className="space-y-4">
              {surplusByCategory.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{item.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{item.count} items</span>
                      <span className="font-medium">{item.totalQuantity} units</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getCategoryColor(item.category)}`}
                      style={{
                        width: `${stats.totalSurplus > 0 ? (item.count / stats.totalSurplus) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No surplus data available</p>
          )}
        </CardContent>
      </Card>

      {/* Task Statistics */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Task Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <Truck className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-bold">{stats.totalTasks}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                All delivery tasks
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Completed</p>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div className="text-3xl font-bold text-success">{stats.completedTasks}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                {stats.totalTasks > 0 ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(0) : 0}% success rate
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Active</p>
                <Truck className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary">{stats.activeTasks}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                Currently in progress
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tasks by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Tasks by Status
          </CardTitle>
          <CardDescription>Breakdown of delivery tasks by current status</CardDescription>
        </CardHeader>
        <CardContent>
          {tasksByStatus.length > 0 ? (
            <div className="space-y-4">
              {tasksByStatus.map((item) => (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{item.status.replace('-', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.count} tasks</span>
                      <span className="text-muted-foreground">
                        ({stats.totalTasks > 0 ? ((item.count / stats.totalTasks) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStatusColor(item.status)}`}
                      style={{
                        width: `${stats.totalTasks > 0 ? (item.count / stats.totalTasks) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No task data available</p>
          )}
        </CardContent>
      </Card>

      {/* Platform Performance Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle>Platform Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {stats.totalTasks > 0 ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-sm text-muted-foreground">Task Completion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-success mb-2">
                {stats.deliveredSurplus}
              </div>
              <p className="text-sm text-muted-foreground">Total Items Delivered</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-warning mb-2">
                {stats.activeTasks}
              </div>
              <p className="text-sm text-muted-foreground">Active Deliveries</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
