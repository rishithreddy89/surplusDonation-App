import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Package, Clock, Loader2, AlertCircle, CheckCircle, Truck, User, Heart, Share2 } from "lucide-react";
import { getMyTasks, updateTaskStatus, completeVolunteerDelivery, Task, getUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const ActiveDeliveries = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showImpactDialog, setShowImpactDialog] = useState(false);
  const [impactData, setImpactData] = useState<any>(null);

  useEffect(() => {
    fetchActiveTasks();
  }, []);

  const fetchActiveTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getMyTasks();
      
      if (response.success && response.data) {
        // Filter out delivered tasks
        const activeTasks = response.data.filter((task: Task) => task.status !== 'delivered');
        setTasks(activeTasks);
      } else {
        setError(response.message || "Failed to fetch active deliveries");
      }
    } catch (err: any) {
      console.error('Fetch active tasks error:', err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: string, isVolunteer: boolean) => {
    try {
      setUpdatingStatus(taskId);

      // If it's a volunteer delivery being completed, use the volunteer endpoint
      if (isVolunteer && newStatus === 'delivered') {
        const response = await completeVolunteerDelivery(taskId);

        if (response.success && response.data?.impact) {
          setImpactData(response.data.impact);
          setShowImpactDialog(true);
          
          toast({
            title: "🎉 Volunteer Delivery Completed!",
            description: response.message,
          });
          
          fetchActiveTasks();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to complete delivery",
            variant: "destructive",
          });
        }
      } else {
        // Regular task status update
        const response = await updateTaskStatus(taskId, newStatus);

        if (response.success) {
          toast({
            title: "Success!",
            description: "Status updated successfully",
          });
          fetchActiveTasks();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to update status",
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      console.error('Update status error:', err);
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const shareImpact = (platform: string) => {
    const user = getUser();
    const url = `${window.location.origin}/volunteer/profile/${user?.id}`;
    const message = `🌟 Just completed a volunteer delivery! I've helped ${impactData?.peopleHelped || 0} people and earned ${impactData?.pointsEarned || 0} points through Surplus Spark Network! Join me in making a difference! 💚`;

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
      case 'instagram':
        navigator.clipboard.writeText(`${message}\n${url}`);
        toast({
          title: "Copied to clipboard!",
          description: "Paste this in your Instagram post or story",
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'assigned':
        return 'picked-up';
      case 'picked-up':
      case 'in-transit':
        return 'delivered';
      default:
        return null;
    }
  };

  const getStatusButtonText = (status: string, isVolunteer: boolean) => {
    switch (status) {
      case 'assigned':
        return 'Mark as Picked Up';
      case 'picked-up':
      case 'in-transit':
        return isVolunteer ? 'Complete Volunteer Delivery' : 'Mark as Delivered';
      default:
        return 'Update Status';
    }
  };

  const getSurplusTitle = (surplus: any) => {
    if (surplus && typeof surplus === 'object' && 'title' in surplus) {
      return surplus.title;
    }
    return 'Delivery Task';
  };

  const getSurplusDetails = (surplus: any) => {
    if (surplus && typeof surplus === 'object') {
      return `${surplus.quantity || 0} ${surplus.unit || 'units'}`;
    }
    return '';
  };

  const getDonorName = (donor: any) => {
    if (donor && typeof donor === 'object' && 'name' in donor) {
      return donor.name;
    }
    return 'Unknown';
  };

  const getNGOName = (ngo: any) => {
    if (ngo && typeof ngo === 'object' && 'name' in ngo) {
      return ngo.name;
    }
    return 'Unknown';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading active deliveries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Active Deliveries</h2>
        <p className="text-muted-foreground">Manage your ongoing delivery tasks</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Truck className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No active deliveries</p>
            <p className="text-sm mt-2">Your accepted tasks will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tasks.map((task: any) => {
            const nextStatus = getNextStatus(task.status);
            const isVolunteer = task.isVolunteerPickup === true;

            return (
              <Card key={task._id} className="hover:shadow-lg transition-shadow border-2">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{getSurplusTitle(task.surplusId)}</h3>
                          <p className="text-sm text-muted-foreground">
                            {getSurplusDetails(task.surplusId)}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge variant="outline" className="capitalize">
                          {task.status}
                        </Badge>
                        {isVolunteer && (
                          <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                            <Heart className="w-3 h-3 mr-1" />
                            Volunteer
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Locations */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="w-4 h-4 text-success" />
                          Pickup
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">{getDonorName(task.donorId)}</p>
                          <p className="text-muted-foreground">{task.pickupLocation.address}</p>
                          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{formatDate(task.scheduledPickup)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="w-4 h-4 text-destructive" />
                          Delivery
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">{getNGOName(task.ngoId)}</p>
                          <p className="text-muted-foreground">{task.deliveryLocation.address}</p>
                          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{formatDate(task.scheduledDelivery)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {nextStatus && (
                      <div className="border-t pt-4">
                        <Button
                          onClick={() => handleUpdateStatus(task._id, nextStatus, isVolunteer)}
                          disabled={updatingStatus === task._id}
                          className={`w-full ${isVolunteer && nextStatus === 'delivered' ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600' : ''}`}
                        >
                          {updatingStatus === task._id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              {nextStatus === 'delivered' ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  {getStatusButtonText(task.status, isVolunteer)}
                                </>
                              ) : (
                                <>
                                  <Truck className="w-4 h-4 mr-2" />
                                  {getStatusButtonText(task.status, isVolunteer)}
                                </>
                              )}
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Impact Achievement Dialog */}
      <Dialog open={showImpactDialog} onOpenChange={setShowImpactDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Amazing Work!</DialogTitle>
            <DialogDescription className="text-center">
              You've made a real difference today
            </DialogDescription>
          </DialogHeader>

          {impactData && (
            <div className="space-y-6">
              {/* Achievement Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
                  <div className="text-3xl font-bold text-yellow-600">{impactData.pointsEarned}</div>
                  <p className="text-sm text-muted-foreground">Points Earned</p>
                </Card>
                <Card className="text-center p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20">
                  <div className="text-3xl font-bold text-pink-600">{impactData.peopleHelped}</div>
                  <p className="text-sm text-muted-foreground">People Helped</p>
                </Card>
              </div>

              {/* New Badges */}
              {impactData.newBadges && impactData.newBadges.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-center">🏆 New Badges Unlocked!</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {impactData.newBadges.map((badge: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-lg py-2 px-4">
                        {badge === 'first_delivery' && '🎯 First Delivery'}
                        {badge === 'champion' && '🏆 Champion'}
                        {badge === 'hero' && '🦸 Hero'}
                        {badge === 'weekly_warrior' && '⚡ Weekly Warrior'}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Progress */}
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Your Total Impact</p>
                <p className="text-2xl font-bold">{impactData.totalDeliveries} Deliveries</p>
                <p className="text-sm text-muted-foreground">{impactData.totalPoints} Total Points</p>
              </div>

              {/* Share Buttons */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-center">Share your achievement!</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={() => shareImpact('facebook')} variant="outline" size="sm" className="gap-2">
                    📘 Facebook
                  </Button>
                  <Button onClick={() => shareImpact('linkedin')} variant="outline" size="sm" className="gap-2">
                    💼 LinkedIn
                  </Button>
                  <Button onClick={() => shareImpact('twitter')} variant="outline" size="sm" className="gap-2">
                    🐦 Twitter
                  </Button>
                  <Button onClick={() => shareImpact('whatsapp')} variant="outline" size="sm" className="gap-2">
                    💬 WhatsApp
                  </Button>
                  <Button onClick={() => shareImpact('instagram')} variant="outline" size="sm" className="gap-2">
                    📷 Instagram
                  </Button>
                  <Button onClick={() => setShowImpactDialog(false)} variant="default" size="sm">
                    ✨ Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActiveDeliveries;
