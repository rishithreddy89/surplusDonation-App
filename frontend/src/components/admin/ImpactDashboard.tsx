import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Users, Package, TrendingUp } from "lucide-react";

const ImpactDashboard = () => {
  const impactStats = [
    { label: "Items Redistributed", value: "1,247", icon: Package, color: "text-primary" },
    { label: "People Served", value: "8,350", icon: Users, color: "text-success" },
    { label: "CO₂ Saved", value: "2.5 tons", icon: TrendingUp, color: "text-secondary" },
    { label: "Impact Score", value: "9,450", icon: Award, color: "text-warning" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Impact Dashboard</h2>
        <p className="text-muted-foreground">Platform-wide impact metrics and social contribution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {impactStats.map((stat, index) => (
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
          <CardTitle>Social Impact Growth</CardTitle>
          <CardDescription>Platform growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 55, 65, 75, 82, 90].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-success to-primary rounded-t-lg"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-muted-foreground">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Environmental Impact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
              <span>Waste Diverted</span>
              <span className="font-bold text-success">3.2 tons</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
              <span>CO₂ Emissions Saved</span>
              <span className="font-bold text-success">2.5 tons</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
              <span>Water Conserved</span>
              <span className="font-bold text-success">850 liters</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community Reach</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <span>Active NGOs</span>
              <span className="font-bold text-primary">45</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <span>Regular Donors</span>
              <span className="font-bold text-primary">328</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <span>Logistics Partners</span>
              <span className="font-bold text-primary">18</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-success/20 bg-success/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-success" />
            <h3 className="text-2xl font-bold mb-2">8,350 Lives Impacted</h3>
            <p className="text-muted-foreground">
              Through collective efforts of our community, we've made a significant difference 
              in the lives of thousands of people.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImpactDashboard;
