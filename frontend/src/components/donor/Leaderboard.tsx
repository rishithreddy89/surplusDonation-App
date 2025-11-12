import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Medal, Award, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { getDonorLeaderboard } from "@/lib/api";

const Leaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getDonorLeaderboard(10);

      if (response.success && response.data) {
        setLeaderboard(response.data.leaderboard || []);
        setCurrentUser(response.data.currentUser);
      } else {
        setError(response.message || "Failed to fetch leaderboard");
      }
    } catch (err: any) {
      console.error('Fetch leaderboard error:', err);
      setError(err.message || "An error occurred while fetching leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return { icon: Trophy, color: "text-yellow-500" };
      case 2: return { icon: Medal, color: "text-gray-400" };
      case 3: return { icon: Award, color: "text-orange-600" };
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading leaderboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Leaderboard</h2>
        <p className="text-muted-foreground">Top contributors making a difference</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Top Donors</CardTitle>
          <CardDescription>
            Ranked by impact points • Points are awarded only for donations picked up by logistics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((donor, index) => {
                const rankInfo = getRankIcon(index + 1);
                const Icon = rankInfo?.icon;
                
                return (
                  <div
                    key={donor.donorId}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 min-w-[60px]">
                        {Icon ? (
                          <Icon className={`w-6 h-6 ${rankInfo.color}`} />
                        ) : (
                          <span className="text-2xl font-bold text-muted-foreground">
                            {index + 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{donor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {donor.totalDonations} picked-up donations • {donor.location}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {donor.points} pts
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No leaderboard data available yet
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-info/20 bg-info/5 mt-6">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">ℹ️ How Points Are Calculated:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>10 points for each donation picked up by logistics</li>
              <li>1 point for each unit/kg donated</li>
              <li>Donations are counted only after pickup to ensure accuracy</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
            <h3 className="font-semibold mb-1">Your Rank</h3>
            <p className="text-3xl font-bold">
              {currentUser?.rank ? `#${currentUser.rank}` : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-success" />
            <h3 className="font-semibold mb-1">Points to Next Rank</h3>
            <p className="text-3xl font-bold">
              {currentUser?.pointsToNextRank > 0 ? currentUser.pointsToNextRank : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-1">Total Points</h3>
            <p className="text-3xl font-bold">
              {currentUser?.points || 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
