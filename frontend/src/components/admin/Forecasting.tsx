import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp } from "lucide-react";

const Forecasting = () => {
  const predictions = [
    { item: "Food", predicted: "35 kg", confidence: "High", trend: "up" },
    { item: "Clothing", predicted: "50 items", confidence: "Medium", trend: "stable" },
    { item: "Books", predicted: "80 items", confidence: "High", trend: "up" },
    { item: "Hygiene Products", predicted: "25 boxes", confidence: "Medium", trend: "down" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">AI Forecasting</h2>
        <p className="text-muted-foreground">Predictive analytics for demand and supply</p>
      </div>

      <Card className="border-secondary/20 bg-secondary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Sparkles className="w-10 h-10 text-secondary mt-1" />
            <div>
              <h3 className="text-xl font-bold mb-2">Next Week Prediction</h3>
              <p className="text-2xl font-bold text-secondary mb-2">Predicted food need: 35 kg</p>
              <p className="text-muted-foreground">
                Based on historical data and current trends, we predict high demand for food supplies 
                in the coming week.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category Predictions</CardTitle>
          <CardDescription>Forecasted needs for the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium mb-1">{prediction.item}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Confidence: {prediction.confidence}</span>
                    <TrendingUp className={`w-4 h-4 ${
                      prediction.trend === "up" ? "text-success" :
                      prediction.trend === "down" ? "text-destructive" : "text-muted-foreground"
                    }`} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-secondary">{prediction.predicted}</p>
                  <p className="text-xs text-muted-foreground">predicted need</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end justify-between gap-2">
            {[60, 65, 70, 72, 75, 80, 85].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-secondary to-primary rounded-t-lg"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-muted-foreground">
                  {["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"][i]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Forecasting;
