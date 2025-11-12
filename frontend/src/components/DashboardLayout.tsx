import { ReactNode, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOut, Home, Plus, Package, TrendingUp, Users, Truck, Settings, QrCode, Trophy, User, AlertCircle, BarChart3, ShieldCheck, Calendar, Award, FileText, Map, CheckCircle, Bell, Megaphone, MessageSquare, AlertTriangle, Heart, Receipt, DollarSign, Wallet, Inbox } from "lucide-react";
import { logout, getNotifications, markNotificationAsRead } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Chatbot } from "@/components/Chatbot";
import { AdvertisementBanner } from "@/components/AdvertisementBanner";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'donor' | 'ngo' | 'logistics' | 'admin';
}

const DashboardLayout = ({ children, userRole }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await markNotificationAsRead(notification._id);
      fetchNotifications();
    }

    // Navigate based on notification type
    if (notification.data?.surplusId) {
      if (userRole === 'donor') {
        navigate('/dashboard/donor/donations');
      } else if (userRole === 'ngo') {
        navigate('/dashboard/ngo/browse');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/select-role");
  };

  const menuConfigs = {
    donor: [
      { path: "/dashboard/donor", label: "Overview", icon: Home },
      { path: "/dashboard/donor/add-surplus", label: "Add Surplus", icon: Plus },
      { path: "/dashboard/donor/donations", label: "My Donations", icon: Package },
      { path: "/dashboard/donor/browse-ngos", label: "Browse NGOs", icon: Users },
      { path: "/dashboard/donor/ngo-requests", label: "NGO Requests", icon: Inbox },
      { path: "/dashboard/donor/donate-money", label: "Donate Money", icon: DollarSign },
      { path: "/dashboard/donor/donation-history", label: "Donation History", icon: Wallet },
      { path: "/dashboard/donor/track", label: "Track Donation", icon: QrCode },
      { path: "/dashboard/donor/find-ngos", label: "Find NGOs", icon: Map },
      { path: "/dashboard/donor/tax-benefits", label: "Tax Benefits", icon: Receipt },
      { path: "/dashboard/donor/impact", label: "Impact", icon: TrendingUp },
      { path: "/dashboard/donor/leaderboard", label: "Leaderboard", icon: Trophy },
      { path: "/dashboard/donor/support", label: "Support Center", icon: MessageSquare },
      { path: "/dashboard/donor/profile", label: "Profile", icon: User },
    ],
    ngo: [
      { path: "/dashboard/ngo", label: "Overview", icon: Home },
      { path: "/dashboard/ngo/browse", label: "Browse Surplus", icon: Package },
      { path: "/dashboard/ngo/request", label: "Request Items", icon: Plus },
      { path: "/dashboard/ngo/requests", label: "My Requests", icon: Package },
      { path: "/dashboard/ngo/track-requests", label: "Track Requests", icon: QrCode },
      { path: "/dashboard/ngo/find-partners", label: "Find Partners", icon: Map },
      { path: "/dashboard/ngo/urgent", label: "Urgent Needs", icon: AlertCircle },
      { path: "/dashboard/ngo/impact", label: "Impact", icon: TrendingUp },
      { path: "/dashboard/ngo/leaderboard", label: "Leaderboard", icon: Trophy },
      { path: "/dashboard/ngo/give-feedback", label: "Give Feedback", icon: Heart },
      { path: "/dashboard/ngo/support", label: "Support Center", icon: MessageSquare },
      { path: "/dashboard/ngo/profile", label: "Profile", icon: User },
    ],
    logistics: [
      { path: "/dashboard/logistics", label: "Overview", icon: Home },
      { path: "/dashboard/logistics/tasks", label: "Available Tasks", icon: Package },
      { path: "/dashboard/logistics/active", label: "Active Deliveries", icon: Truck },
      { path: "/dashboard/logistics/completed", label: "Completed", icon: CheckCircle },
      { path: "/dashboard/logistics/performance", label: "Performance", icon: TrendingUp },
      { path: "/dashboard/logistics/support", label: "Support Center", icon: MessageSquare },
      { path: "/dashboard/logistics/profile", label: "Profile", icon: User },
    ],
    admin: [
      { path: "/dashboard/admin", label: "Overview", icon: Home },
      { path: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
      { path: "/dashboard/admin/users", label: "Manage Users", icon: Users },
      { path: "/dashboard/admin/verification", label: "Verification", icon: ShieldCheck },
      { path: "/dashboard/admin/advertisements", label: "Advertisements", icon: Megaphone },
      { path: "/dashboard/admin/complaints", label: "Complaints & Feedback", icon: AlertTriangle },
      { path: "/dashboard/admin/forecasting", label: "AI Forecasting", icon: TrendingUp },
      { path: "/dashboard/admin/seasonal", label: "Seasonal Insights", icon: Calendar },
      { path: "/dashboard/admin/logs", label: "System Logs", icon: FileText },
      { path: "/dashboard/admin/profile", label: "Profile", icon: User },
    ],
  };

  const menuItems = menuConfigs[userRole] || [];

  const isActive = (path: string) => {
    if (path === `/dashboard/${userRole}`) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside className="w-64 bg-card border-r border-border p-6 flex flex-col h-screen overflow-y-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">ShareGood</h1>
            <p className="text-sm text-muted-foreground capitalize">{userRole} Dashboard</p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-2 font-semibold border-b">
                Notifications ({unreadCount} unread)
              </div>
              {notifications.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <DropdownMenuItem
                      key={notification._id}
                      className={`p-3 cursor-pointer ${!notification.isRead ? 'bg-primary/5' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-start justify-between">
                          <p className="font-medium text-sm">{notification.title}</p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  "panel-hover-style hover-indigo-glow",
                  isActive(item.path) && "bg-primary text-primary-foreground"
                )}
                onClick={() => navigate(item.path)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-muted-foreground hover:text-primary"
            onClick={() => window.open('/be-a-sponsor', '_blank')}
          >
            <Award className="w-3 h-3 mr-2" />
            Be a Sponsor
          </Button>
          <Button
            variant="outline"
            className="w-full panel-hover-style hover-indigo-glow"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content - Scrollable */}
      <main className="flex-1 h-screen overflow-y-auto p-8">
        {/* Advertisement Banner for donors, NGOs, and logistics */}
        {(userRole === 'donor' || userRole === 'ngo' || userRole === 'logistics') && (
          <AdvertisementBanner userRole={userRole} />
        )}
        {children}
      </main>

      {/* Chatbot - Only for Donor */}
      {userRole === 'donor' && <Chatbot />}
    </div>
  );
};

export default DashboardLayout;
