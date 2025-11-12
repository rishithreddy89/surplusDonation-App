import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy, Medal, Award, Loader2, AlertCircle, TrendingUp } from "lucide-react";
import { getNGOLeaderboard } from "@/lib/api";

const NGOLeaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentNGO, setCurrentNGO] = useState<any>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getNGOLeaderboard(10);

      if (response.success && response.data) {
        setLeaderboard(response.data.leaderboard || []);
        setCurrentNGO(response.data.currentNGO);
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
        <p className="text-muted-foreground">Top NGOs by requests fulfilled and community impact</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Top Organizations This Month</CardTitle>
          <CardDescription>Ranked by impact points and successful requests</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((ngo, index) => {
                const rankInfo = getRankIcon(index + 1);
                const Icon = rankInfo?.icon;
                const isCurrentNGO = currentNGO && ngo.ngoId === currentNGO.ngoId;
                
                return (
                  <div
                    key={ngo.ngoId}
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      isCurrentNGO
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-muted hover:bg-muted/70"
                    }`}
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
                        <p className="font-semibold">{ngo.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {ngo.fulfilledRequests} fulfilled requests • {ngo.location}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {ngo.points} pts
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

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
            <h3 className="font-semibold mb-1">Your Rank</h3>
            <p className="text-3xl font-bold">
              {currentNGO?.rank ? `#${currentNGO.rank}` : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-success" />
            <h3 className="font-semibold mb-1">Points to Next Rank</h3>
            <p className="text-3xl font-bold">
              {currentNGO?.pointsToNextRank > 0 ? currentNGO.pointsToNextRank : '-'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Award className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-1">Total Points</h3>
            <p className="text-3xl font-bold">
              {currentNGO?.points || 0}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NGOLeaderboard;
