import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Trophy, Heart, Users, Star, Award, Share2, Facebook, Linkedin, Twitter, MessageCircle, TrendingUp, Zap, Crown } from "lucide-react";
import { getVolunteerStats, getLeaderboard } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const VolunteerDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('all');
  const [challenges, setChallenges] = useState([
    { id: 1, title: "Weekend Warrior", description: "Complete 5 deliveries this weekend", progress: 0, target: 5, reward: 50 },
    { id: 2, title: "Speed Demon", description: "Complete 3 deliveries in under 2 hours each", progress: 0, target: 3, reward: 75 },
    { id: 3, title: "Community Hero", description: "Help 100 people this month", progress: 0, target: 100, reward: 200 },
  ]);

  const [rewards, setRewards] = useState([
    { id: 1, name: "Free Coffee", points: 50, icon: "☕", available: true },
    { id: 2, name: "NGO Certificate", points: 100, icon: "📜", available: true },
    { id: 3, name: "Premium Badge", points: 200, icon: "💎", available: true },
    { id: 4, name: "Volunteer T-Shirt", points: 500, icon: "👕", available: true },
  ]);

  const [showImpactDialog, setShowImpactDialog] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchLeaderboard();
  }, [period]);

  const fetchStats = async () => {
    try {
      const response = await getVolunteerStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await getLeaderboard(period);
      if (response.success) {
        setLeaderboard(response.data.leaderboard);
        setCurrentUserRank(response.data.currentUserRank);
      }
    } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const shareImpact = (platform: string) => {
    const url = `${window.location.origin}/volunteer/profile/${stats?.userId}`;
    const message = `🌟 I've completed ${stats?.totalDeliveries || 0} volunteer deliveries and helped ${stats?.peopleHelped || 0} people through Surplus Spark Network! Join me in making a difference! 💚`;

    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(url);

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedMessage}%20${encodedUrl}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      toast({
        title: "Sharing your impact! 🎉",
        description: "Thank you for spreading awareness!",
      });
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'first_delivery': return '🎯';
      case 'champion': return '🏆';
      case 'hero': return '🦸';
      case 'weekly_warrior': return '⚡';
      default: return '⭐';
    }
  };

  const getBadgeName = (badge: string) => {
    switch (badge) {
      case 'first_delivery': return 'First Delivery';
      case 'champion': return 'Champion (10 Deliveries)';
      case 'hero': return 'Hero (50 Deliveries)';
      case 'weekly_warrior': return 'Weekly Warrior';
      default: return badge;
    }
  };

  const redeemReward = (reward: any) => {
    if (!stats || stats.points < reward.points) {
      toast({
        title: "Not enough points",
        description: `You need ${reward.points} points to redeem this reward`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Reward Redeemed! 🎉",
      description: `You've redeemed ${reward.name}. Check your email for details.`,
    });

    // Show share dialog after reward redemption
    setShowImpactDialog(true);
  };

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Volunteer Impact Dashboard</h2>
          <p className="text-muted-foreground">Your contribution is changing lives! 💚</p>
        </div>
        <Button onClick={() => shareImpact('facebook')} className="gap-2">
          <Share2 className="w-4 h-4" />
          Share Impact
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deliveries</p>
                <p className="text-2xl font-bold">{stats.totalDeliveries || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-500/10 rounded-lg">
                <Users className="w-6 h-6 text-pink-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">People Helped</p>
                <p className="text-2xl font-bold">{stats.peopleHelped || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Points</p>
                <p className="text-2xl font-bold">{stats.points || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{stats.currentStreak || 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Level {stats.level || 1} Volunteer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{stats.points || 0} points</span>
            <span>Next: {stats.nextLevelPoints || 100} points</span>
          </div>
          <Progress value={stats.progressToNextLevel || 0} />
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Badges Earned ({stats.badges?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {stats.badges?.map((badge: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-lg py-2 px-4">
                {getBadgeIcon(badge)} {getBadgeName(badge)}
              </Badge>
            ))}
            {(!stats.badges || stats.badges.length === 0) && (
              <p className="text-muted-foreground text-sm">Complete deliveries to earn badges!</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Share Impact Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Inspire others by sharing your volunteer journey on social media!
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => shareImpact('facebook')} variant="outline" className="gap-2">
              <Facebook className="w-4 h-4" />
              Facebook
            </Button>
            <Button onClick={() => shareImpact('linkedin')} variant="outline" className="gap-2">
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </Button>
            <Button onClick={() => shareImpact('twitter')} variant="outline" className="gap-2">
              <Twitter className="w-4 h-4" />
              Twitter
            </Button>
            <Button onClick={() => shareImpact('whatsapp')} variant="outline" className="gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Challenges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{challenge.title}</h4>
                  <p className="text-sm text-muted-foreground">{challenge.description}</p>
                </div>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500">
                  +{challenge.reward} pts
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{challenge.progress} / {challenge.target}</span>
                  <span>{((challenge.progress / challenge.target) * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(challenge.progress / challenge.target) * 100} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rewards Catalog */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Rewards Catalog
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="text-5xl">{reward.icon}</div>
                    <div>
                      <h4 className="font-semibold">{reward.name}</h4>
                      <p className="text-sm text-muted-foreground">{reward.points} points</p>
                    </div>
                    <Button
                      onClick={() => redeemReward(reward)}
                      disabled={!stats || stats.points < reward.points}
                      className="w-full"
                      size="sm"
                    >
                      {stats && stats.points >= reward.points ? 'Redeem' : 'Not enough points'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="all">All Time</TabsTrigger>
            </TabsList>

            <TabsContent value={period}>
              <div className="space-y-3">
                {leaderboard.map((user: any, index: number) => (
                  <div
                    key={user._id}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      index < 3 ? 'bg-yellow-50 dark:bg-yellow-950/20 border-2 border-yellow-200' : 'bg-muted'
                    }`}
                  >
                    <div className="text-2xl font-bold w-8">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.volunteerStats.totalDeliveries} deliveries • {user.volunteerStats.peopleHelped} helped
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{user.volunteerStats.points}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
                {currentUserRank && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg border-2 border-primary">
                    <p className="text-sm font-medium">Your Rank: #{currentUserRank}</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Impact Share Dialog */}
      <Dialog open={showImpactDialog} onOpenChange={setShowImpactDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Share Your Impact!</DialogTitle>
            <DialogDescription className="text-center">
              Let others know about your amazing volunteer work
            </DialogDescription>
          </DialogHeader>

          {stats && (
            <div className="space-y-6">
              {/* Stats Card */}
              <Card className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
                <CardContent className="pt-6 space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">{stats.totalDeliveries}</div>
                    <p className="text-sm text-muted-foreground">Volunteer Deliveries</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-pink-600">{stats.peopleHelped}</div>
                      <p className="text-xs text-muted-foreground">People Helped</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{stats.points}</div>
                      <p className="text-xs text-muted-foreground">Points Earned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Share Buttons */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-center">Share on social media</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => shareImpact('facebook')} variant="outline" size="sm">
                    📘 Facebook
                  </Button>
                  <Button onClick={() => shareImpact('linkedin')} variant="outline" size="sm">
                    💼 LinkedIn
                  </Button>
                  <Button onClick={() => shareImpact('twitter')} variant="outline" size="sm">
                    🐦 Twitter
                  </Button>
                  <Button onClick={() => shareImpact('whatsapp')} variant="outline" size="sm">
                    💬 WhatsApp
                  </Button>
                </div>
                <Button onClick={() => setShowImpactDialog(false)} variant="default" className="w-full">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VolunteerDashboard;
