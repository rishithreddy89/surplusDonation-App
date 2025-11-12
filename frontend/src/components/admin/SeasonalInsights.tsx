import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, TrendingUp, AlertCircle } from "lucide-react";

const SeasonalInsights = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Seasonal Insights</h2>
        <p className="text-muted-foreground">Understand seasonal trends and patterns</p>
      </div>

      <Card className="border-warning/20 bg-warning/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Calendar className="w-10 h-10 text-warning mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-2">Winter Season Alert</h3>
              <p className="text-lg font-bold text-warning mb-2">Clothing donations up 40%</p>
              <p className="text-muted-foreground">
                Historical data shows increased demand for winter clothing and blankets during December-February period.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Spring Trends
            </CardTitle>
            <CardDescription>March - May</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Books & Education</span>
                <span className="text-success font-medium">+25%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Fresh Produce</span>
                <span className="text-success font-medium">+35%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Hygiene Products</span>
                <span className="text-success font-medium">+15%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Summer Trends
            </CardTitle>
            <CardDescription>June - August</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Food Supplies</span>
                <span className="text-primary font-medium">+30%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Light Clothing</span>
                <span className="text-primary font-medium">+20%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Sports Equipment</span>
                <span className="text-primary font-medium">+18%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Fall Trends
            </CardTitle>
            <CardDescription>September - November</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>School Supplies</span>
                <span className="text-secondary font-medium">+45%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Books</span>
                <span className="text-secondary font-medium">+40%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Warm Clothing</span>
                <span className="text-secondary font-medium">+22%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Winter Trends
            </CardTitle>
            <CardDescription>December - February</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Winter Clothing</span>
                <span className="text-warning font-medium">+40%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Blankets</span>
                <span className="text-warning font-medium">+50%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Hot Meals</span>
                <span className="text-warning font-medium">+35%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeasonalInsights;
