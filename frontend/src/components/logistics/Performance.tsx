import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Star, MapPin } from "lucide-react";

const Performance = () => {
  const stats = [
    { label: "Total Deliveries", value: "47", icon: MapPin, color: "text-primary" },
    { label: "Distance Covered", value: "325 km", icon: TrendingUp, color: "text-success" },
    { label: "Avg. Rating", value: "4.8", icon: Star, color: "text-warning" },
    { label: "Avg. Time", value: "42 min", icon: Clock, color: "text-secondary" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Performance Metrics</h2>
        <p className="text-muted-foreground">Track your delivery statistics and efficiency</p>
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
          <CardTitle>Weekly Performance</CardTitle>
          <CardDescription>Deliveries completed per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {[5, 8, 6, 9, 7, 10, 8].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${height * 10}%` }}
                />
                <span className="text-xs text-muted-foreground">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Efficiency Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-success mb-2">92%</div>
              <p className="text-muted-foreground">Above average performance</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Earnings</span>
              <span className="font-bold text-success">$1,250</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Completed</span>
              <span className="font-bold">47 deliveries</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">On-time Rate</span>
              <span className="font-bold">96%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Performance;
