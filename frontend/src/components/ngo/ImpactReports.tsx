import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, TrendingUp, Calendar, Loader2, AlertCircle } from "lucide-react";
import { getNGOImpact } from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MonthlyData {
  month: string;
  year: number;
  count: number;
  quantity: number;
}

interface ImpactData {
  totalRequests: number;
  fulfilledRequests: number;
  receivedItems: number;
  totalQuantity: number;
  estimatedPeopleServed: number;
  monthlyDistribution: MonthlyData[];
}

const ImpactReports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [impactData, setImpactData] = useState<ImpactData | null>(null);

  useEffect(() => {
    fetchImpactData();
  }, []);

  const fetchImpactData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNGOImpact();
      
      if (response.success && response.data) {
        setImpactData(response.data);
      } else {
        setError(response.message || "Failed to fetch impact data");
      }
    } catch (err: any) {
      console.error('Fetch impact error:', err);
      setError(err.message || "An error occurred while fetching impact data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading impact data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!impactData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No impact data available</AlertDescription>
      </Alert>
    );
  }

  const stats = [
    { label: "Total Items Received", value: impactData.receivedItems.toString(), icon: Package, color: "text-primary" },
    { label: "People Served", value: impactData.estimatedPeopleServed.toString(), icon: Users, color: "text-success" },
    { label: "Active Requests", value: (impactData.totalRequests - impactData.fulfilledRequests).toString(), icon: TrendingUp, color: "text-secondary" },
    { label: "Fulfilled Requests", value: impactData.fulfilledRequests.toString(), icon: Calendar, color: "text-warning" },
  ];

  // Calculate max value for chart scaling
  const maxCount = Math.max(...impactData.monthlyDistribution.map(d => d.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Impact Reports</h2>
        <p className="text-muted-foreground">Track your organization's impact and metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Monthly Distribution Trend</CardTitle>
          <CardDescription>Items received over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          {impactData.monthlyDistribution.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <p>No distribution data available yet</p>
            </div>
          ) : (
            <div className="h-64 flex items-end justify-between gap-2">
              {impactData.monthlyDistribution.map((data, i) => {
                const heightPercentage = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                const displayHeight = Math.max(heightPercentage, 5); // Minimum 5% height for visibility
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full">
                      <div
                        className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                        style={{ height: `${displayHeight * 2.5}px` }}
                        title={`${data.count} items (${data.quantity} total quantity)`}
                      />
                      {data.count > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                          {data.count} items
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {data.month}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {data.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Needs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div>
                <p className="font-medium">Winter Supplies</p>
                <p className="text-sm text-muted-foreground">Estimated need: 200 items by Feb 1</p>
              </div>
              <span className="text-sm text-warning font-medium">High Priority</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-medium">Educational Materials</p>
                <p className="text-sm text-muted-foreground">Estimated need: 150 books by Mar 1</p>
              </div>
              <span className="text-sm text-muted-foreground">Medium Priority</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImpactReports;
