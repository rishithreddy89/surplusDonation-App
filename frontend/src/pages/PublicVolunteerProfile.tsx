import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, Award, Heart, Loader2, Crown } from "lucide-react";
import { getPublicProfile } from "@/lib/api";

const PublicVolunteerProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await getPublicProfile(userId!);
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
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
      case 'champion': return 'Champion';
      case 'hero': return 'Hero';
      case 'weekly_warrior': return 'Weekly Warrior';
      default: return badge;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Volunteer profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-950 dark:to-blue-950 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card className="text-center border-2 border-primary/20">
          <CardContent className="pt-8 pb-6">
            <div className="mb-4">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mx-auto flex items-center justify-center text-4xl text-white font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-semibold text-muted-foreground">
                Level {profile.level} Volunteer
              </span>
            </div>
            <p className="text-muted-foreground">
              Making a difference, one delivery at a time 💚
            </p>
          </CardContent>
        </Card>

        {/* Impact Stats */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{profile.totalDeliveries}</div>
                  <p className="text-sm text-muted-foreground">Volunteer Deliveries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-pink-500/10 rounded-full">
                  <Users className="w-8 h-8 text-pink-500" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{profile.peopleHelped}</div>
                  <p className="text-sm text-muted-foreground">People Helped</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Badges Earned ({profile.badges?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profile.badges && profile.badges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {profile.badges.map((badge: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-lg py-3 px-4">
                    {getBadgeIcon(badge)} {getBadgeName(badge)}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No badges earned yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-r from-pink-500 to-purple-500 border-0 text-white">
          <CardContent className="pt-8 pb-8 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Join Our Volunteer Network</h2>
            <p className="mb-6 opacity-90">
              Help deliver surplus food to those in need and make a real impact in your community.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => window.location.href = '/auth'}
            >
              Become a Volunteer
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          Powered by Surplus Spark Network 🌟
        </p>
      </div>
    </div>
  );
};

export default PublicVolunteerProfile;
