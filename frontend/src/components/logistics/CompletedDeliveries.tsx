import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Package, Clock, Loader2, AlertCircle, CheckCircle, Calendar, User, Truck, Check, Share2, Heart } from "lucide-react";
import { getMyTasks, Task, completeVolunteerDelivery, getUser } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const CompletedDeliveries = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingTask, setCompletingTask] = useState<string | null>(null);
  const [showImpactDialog, setShowImpactDialog] = useState(false);
  const [impactData, setImpactData] = useState<any>(null);
  const [confirmingReceipt, setConfirmingReceipt] = useState<string | null>(null);
  const [confirmedTasks, setConfirmedTasks] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalCompleted: 0,
    thisWeek: 0,
    thisMonth: 0,
    onTimeDeliveries: 0,
  });
  const [generatingImpactCard, setGeneratingImpactCard] = useState<string | null>(null);

  useEffect(() => {
    fetchCompletedTasks();
  }, []);

  const fetchCompletedTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getMyTasks({ status: 'delivered' });

      if (response.success && response.data) {
        const completedTasks = response.data;
        setTasks(completedTasks);

        // Calculate stats
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const thisWeek = completedTasks.filter((t: Task) => 
          new Date(t.actualDelivery || t.createdAt) >= weekAgo
        ).length;

        const thisMonth = completedTasks.filter((t: Task) => 
          new Date(t.actualDelivery || t.createdAt) >= monthAgo
        ).length;

        const onTime = completedTasks.filter((t: Task) => {
          if (!t.actualDelivery || !t.scheduledDelivery) return false;
          return new Date(t.actualDelivery) <= new Date(t.scheduledDelivery);
        }).length;

        setStats({
          totalCompleted: completedTasks.length,
          thisWeek,
          thisMonth,
          onTimeDeliveries: onTime,
        });
      } else {
        setError(response.message || "Failed to fetch completed deliveries");
      }
    } catch (err: any) {
      console.error('Fetch completed tasks error:', err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteVolunteerDelivery = async (taskId: string, isVolunteer: boolean) => {
    if (!isVolunteer) return;

    try {
      setCompletingTask(taskId);
      const response = await completeVolunteerDelivery(taskId);

      if (response.success && response.data?.impact) {
        // Show impact dialog with achievement
        setImpactData(response.data.impact);
        setShowImpactDialog(true);
        
        toast({
          title: "🎉 Delivery Completed!",
          description: response.message,
        });
        
        fetchCompletedTasks();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to complete delivery",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to complete delivery",
        variant: "destructive",
      });
    } finally {
      setCompletingTask(null);
    }
  };

  const shareImpact = (platform: string) => {
    const user = getUser();
    const url = `${window.location.origin}/volunteer/profile/${user?.id}`;
    const message = `🌟 Just completed a volunteer delivery! I've now helped ${impactData?.peopleHelped || 0} people and earned ${impactData?.pointsEarned || 0} points through Surplus Spark Network! Join me in making a difference! 💚`;

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
        // Instagram doesn't support URL sharing, copy to clipboard
        navigator.clipboard.writeText(`${message}\n${url}`);
        toast({
          title: "Copied to clipboard!",
          description: "Paste this in your Instagram post or story",
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      setShowImpactDialog(false);
    }
  };

  const handleConfirmReceived = async (taskId: string) => {
    try {
      setConfirmingReceipt(taskId);

      // In production, this would call an API endpoint to confirm delivery
      // For now, we'll just update the local state
      toast({
        title: "Success!",
        description: "Delivery confirmed. Donor and NGO have been notified.",
      });

      // Mark this task as confirmed
      setConfirmedTasks(prev => new Set(prev).add(taskId));

    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to confirm delivery",
        variant: "destructive",
      });
    } finally {
      setConfirmingReceipt(null);
    }
  };

  const handleGenerateImpactCard = async (task: any) => {
    if (!task.isVolunteerPickup) return;

    try {
      setGeneratingImpactCard(task._id);
      
      // Calculate impact data for this specific delivery
      const surplus = task.surplusId as any;
      const ngo = task.ngoId as any;
      const peopleHelped = ngo?.beneficiaries || surplus?.quantity || 10;
      const pointsEarned = Math.floor(peopleHelped * 1.5);

      // Set impact data and show dialog
      setImpactData({
        pointsEarned,
        peopleHelped,
        deliveryDate: task.actualDelivery,
        surplusTitle: getSurplusTitle(task.surplusId),
        ngoName: getNGOName(task.ngoId),
      });
      setShowImpactDialog(true);

      toast({
        title: "Impact Card Generated! 📊",
        description: "Share your volunteer achievement on social media",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to generate impact card",
        variant: "destructive",
      });
    } finally {
      setGeneratingImpactCard(null);
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
      return `${surplus.quantity || 0} ${surplus.unit || 'units'} • ${surplus.category || 'N/A'}`;
    }
    return 'No details';
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
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (pickup?: string, delivery?: string) => {
    if (!pickup || !delivery) return "N/A";
    
    const pickupTime = new Date(pickup).getTime();
    const deliveryTime = new Date(delivery).getTime();
    const diffMs = deliveryTime - pickupTime;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  const isOnTime = (task: Task) => {
    if (!task.actualDelivery || !task.scheduledDelivery) return null;
    return new Date(task.actualDelivery) <= new Date(task.scheduledDelivery);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading completed deliveries...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Completed Deliveries</h2>
        <p className="text-muted-foreground">Your delivery history and performance</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/10 rounded-full">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.totalCompleted}</div>
                <p className="text-xs text-muted-foreground">Total Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.thisWeek}</div>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/10 rounded-full">
                <Package className="w-6 h-6 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.thisMonth}</div>
                <p className="text-xs text-muted-foreground">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/10 rounded-full">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.onTimeDeliveries}</div>
                <p className="text-xs text-muted-foreground">On-Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Deliveries List */}
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No completed deliveries yet</p>
            <p className="text-sm mt-2">Your completed tasks will appear here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const onTime = isOnTime(task);
            const isConfirmed = confirmedTasks.has(task._id);
            const isVolunteer = task.isVolunteerPickup === true;
            
            return (
              <Card key={task._id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-success/10 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{getSurplusTitle(task.surplusId)}</h3>
                          <p className="text-sm text-muted-foreground">{getSurplusDetails(task.surplusId)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="default" className="bg-success">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Delivered
                        </Badge>
                        {isVolunteer && (
                          <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                            <Heart className="w-3 h-3 mr-1" />
                            Volunteer
                          </Badge>
                        )}
                        {onTime !== null && (
                          <Badge variant={onTime ? "outline" : "destructive"} className="text-xs">
                            {onTime ? "On Time ✓" : "Delayed"}
                          </Badge>
                        )}
                        {isConfirmed && (
                          <Badge variant="outline" className="text-xs bg-success/10 text-success border-success">
                            <Check className="w-3 h-3 mr-1" />
                            Confirmed
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Pickup Details */}
                      <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          <MapPin className="w-4 h-4 text-success" />
                          Pickup Details
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium">{getDonorName(task.donorId)}</span>
                          </div>
                          <p className="text-muted-foreground pl-5">{task.pickupLocation.address}</p>
                          {task.actualPickup && (
                            <div className="flex items-center gap-2 text-muted-foreground pl-5">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">{formatDate(task.actualPickup)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Delivery Details */}
                      <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          <MapPin className="w-4 h-4 text-destructive" />
                          Delivery Details
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span className="font-medium">{getNGOName(task.ngoId)}</span>
                          </div>
                          <p className="text-muted-foreground pl-5">{task.deliveryLocation.address}</p>
                          {task.actualDelivery && (
                            <div className="flex items-center gap-2 text-muted-foreground pl-5">
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">{formatDate(task.actualDelivery)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-3">
                      <div className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        <span>Duration: {formatDuration(task.actualPickup, task.actualDelivery)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Completed: {formatDate(task.actualDelivery)}</span>
                      </div>
                      {task.scheduledDelivery && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Expected: {formatDate(task.scheduledDelivery)}</span>
                        </div>
                      )}
                    </div>

                    {/* Generate Impact Card Button (Only for Volunteer Deliveries) */}
                    {isVolunteer && (
                      <div className="border-t pt-3">
                        <Button
                          onClick={() => handleGenerateImpactCard(task)}
                          disabled={generatingImpactCard === task._id}
                          className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                          size="sm"
                        >
                          {generatingImpactCard === task._id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Share2 className="w-4 h-4 mr-2" />
                              Generate Impact Card & Share
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          Share your volunteer contribution on social media
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Performance Summary */}
      {tasks.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-success mb-1">
                  {stats.totalCompleted}
                </div>
                <p className="text-sm text-muted-foreground">Total Deliveries</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-primary mb-1">
                  {stats.totalCompleted > 0 
                    ? ((stats.onTimeDeliveries / stats.totalCompleted) * 100).toFixed(0)
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground">On-Time Rate</p>
              </div>
              <div className="text-center p-4 bg-background rounded-lg">
                <div className="text-3xl font-bold text-warning mb-1">
                  {stats.thisMonth}
                </div>
                <p className="text-sm text-muted-foreground">Last 30 Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Impact Achievement Dialog */}
      <Dialog open={showImpactDialog} onOpenChange={setShowImpactDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Volunteer Impact Card</DialogTitle>
            <DialogDescription className="text-center">
              Share your amazing contribution!
            </DialogDescription>
          </DialogHeader>

          {impactData && (
            <div className="space-y-6">
              {/* Impact Card Preview */}
              <Card className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-blue-950/20 border-2 border-primary">
                <CardContent className="pt-6 space-y-4">
                  {/* Header */}
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mx-auto flex items-center justify-center mb-3">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg">Volunteer Delivery Complete!</h3>
                    <p className="text-sm text-muted-foreground">
                      {impactData.deliveryDate && formatDate(impactData.deliveryDate)}
                    </p>
                  </div>

                  {/* Delivery Info */}
                  <div className="bg-background/50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-center mb-1">
                      {impactData.surplusTitle}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">
                      Delivered to {impactData.ngoName}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {impactData.pointsEarned || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Points Earned</p>
                    </div>
                    <div className="bg-pink-100 dark:bg-pink-900/20 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-pink-600">
                        {impactData.peopleHelped || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">People Helped</p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-muted-foreground">
                      Powered by Surplus Spark Network 💚
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Share Buttons */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-center">Share on social media</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={() => shareImpact('facebook')} variant="outline" size="sm" className="gap-1">
                    📘 Facebook
                  </Button>
                  <Button onClick={() => shareImpact('linkedin')} variant="outline" size="sm" className="gap-1">
                    💼 LinkedIn
                  </Button>
                  <Button onClick={() => shareImpact('twitter')} variant="outline" size="sm" className="gap-1">
                    🐦 Twitter
                  </Button>
                  <Button onClick={() => shareImpact('whatsapp')} variant="outline" size="sm" className="gap-1">
                    💬 WhatsApp
                  </Button>
                  <Button onClick={() => shareImpact('instagram')} variant="outline" size="sm" className="gap-1">
                    📷 Instagram
                  </Button>
                  <Button onClick={() => setShowImpactDialog(false)} variant="default" size="sm">
                    ✨ Close
                  </Button>
                </div>
              </div>

              {/* Download Hint */}
              <div className="bg-muted p-3 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Take a screenshot of the impact card above to share on Instagram or save for your portfolio!
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompletedDeliveries;
