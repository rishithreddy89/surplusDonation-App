import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUser, getDonorImpact, getDonorSurplus } from '@/lib/api';
import { Chatbot } from '@/components/Chatbot';
import { TaxBenefits } from '@/components/TaxBenefits';
import { 
  Package, 
  Users, 
  TrendingUp, 
  Heart,
  Plus,
  Eye,
  MessageCircle
} from 'lucide-react';

const DonorDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [impact, setImpact] = useState<any>(null);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);
  const [deliveredDonations, setDeliveredDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [impactResponse, surplusResponse, deliveredResponse] = await Promise.all([
        getDonorImpact(),
        getDonorSurplus({ status: 'available' }),
        getDonorSurplus({ status: 'delivered' })
      ]);

      if (impactResponse.success) {
        setImpact(impactResponse.data);
      }

      if (surplusResponse.success) {
        setRecentDonations(surplusResponse.data?.slice(0, 5) || []);
      }

      if (deliveredResponse.success) {
        setDeliveredDonations(deliveredResponse.data || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const impactStats = [
    {
      title: 'Total Donations',
      value: impact?.totalDonations || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Items Donated',
      value: impact?.totalItems || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Lives Helped',
      value: impact?.livesHelped || 0,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Impact Score',
      value: impact?.impactScore || 0,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground mt-1">
            Track your impact and manage your donations
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/donor/create-donation')} size="lg">
          <Plus className="h-5 w-5 mr-2" />
          New Donation
        </Button>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {impactStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Recent Donations</CardTitle>
              <CardDescription>Your latest surplus donations</CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard/donor/my-donations')}>
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading donations...
            </div>
          ) : recentDonations.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No donations yet</p>
              <Button 
                className="mt-4" 
                onClick={() => navigate('/dashboard/donor/create-donation')}
              >
                Create Your First Donation
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDonations.map((donation) => (
                <div
                  key={donation._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{donation.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {donation.quantity} {donation.unit} • {donation.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      donation.status === 'available' 
                        ? 'bg-green-100 text-green-700'
                        : donation.status === 'claimed'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {donation.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/dashboard/donor/tracking/${donation._id}`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Benefits Section */}
      <TaxBenefits deliveredDonations={deliveredDonations} />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/dashboard/donor/create-donation')}
            >
              <Plus className="h-6 w-6" />
              <span>New Donation</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/dashboard/donor/impact')}
            >
              <TrendingUp className="h-6 w-6" />
              <span>View Impact</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/dashboard/donor/leaderboard')}
            >
              <Users className="h-6 w-6" />
              <span>Leaderboard</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Chatbot Assistant */}
      <Chatbot />
    </div>
  );
};

export default DonorDashboard;