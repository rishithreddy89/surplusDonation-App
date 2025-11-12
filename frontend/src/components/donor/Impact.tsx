import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Award, Package, TrendingUp, Heart } from "lucide-react";
import { getDonorImpact } from "@/lib/api";

const Impact = () => {
  const [impact, setImpact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchImpact();
  }, []);

  const fetchImpact = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getDonorImpact();

      if (response.success && response.data) {
        setImpact(response.data);
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Your Impact</h2>
        <p className="text-muted-foreground">See the difference you're making in the community</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Donations</p>
                <p className="text-3xl font-bold">{impact?.totalDonations || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Picked up & in transit</p>
              </div>
              <Package className="w-12 h-12 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Items Delivered</p>
                <p className="text-3xl font-bold">{impact?.deliveredDonations || 0}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-success opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Quantity</p>
                <p className="text-3xl font-bold">{impact?.totalQuantity || 0}</p>
              </div>
              <Heart className="w-12 h-12 text-destructive opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Badges</CardTitle>
          <CardDescription>Achievements unlocked through your contributions</CardDescription>
        </CardHeader>
        <CardContent>
          {impact?.badges && impact.badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {impact.badges.map((badge: any, index: number) => (
                <Card key={index} className="border-2 border-primary/20">
                  <CardContent className="pt-6 text-center">
                    <div className="text-6xl mb-3">{badge.icon}</div>
                    <h3 className="font-semibold text-lg">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Keep up the great work!
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Award className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No badges earned yet</p>
              <p className="text-sm mt-2">Make more donations to unlock badges!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Impact Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Thank You for Your Contribution!</h3>
            <p className="text-muted-foreground">
              Your {impact?.totalDonations || 0} donations have been picked up by logistics partners and are making a real difference in people's lives.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              💡 <strong>Note:</strong> Donations are counted only after logistics partners pick them up (status: "in-transit" or "delivered"), ensuring accurate impact tracking.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Impact;
