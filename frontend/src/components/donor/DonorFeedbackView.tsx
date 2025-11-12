import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Package, Heart, MessageSquare, Loader2, AlertCircle, ThumbsUp } from "lucide-react";
import { getDonorSurplus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import SubmitFeedback from "@/components/ui/SubmitFeedback";

// Simple date formatter
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

const DonorFeedbackView = () => {
  const { toast } = useToast();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await getDonorSurplus();
      if (response.success) {
        // Filter donations that have been claimed/delivered
        const completedDonations = response.data.filter(
          (item: any) => item.status === 'delivered' || item.ngoFeedback
        );
        setDonations(completedDonations);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      toast({
        title: "Error",
        description: "Failed to load your donations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredDonations = donations.filter((donation) => {
    if (activeTab === "all") return true;
    if (activeTab === "with-feedback") return donation.ngoFeedback;
    if (activeTab === "no-feedback") return !donation.ngoFeedback;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Donation Feedback</h2>
        <p className="text-muted-foreground">
          See how your donations helped others
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All Donations ({donations.length})
          </TabsTrigger>
          <TabsTrigger value="with-feedback">
            With Feedback ({donations.filter(d => d.ngoFeedback).length})
          </TabsTrigger>
          <TabsTrigger value="no-feedback">
            Awaiting Feedback ({donations.filter(d => !d.ngoFeedback).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {filteredDonations.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No donations found</p>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "with-feedback"
                    ? "You don't have any feedback yet"
                    : activeTab === "no-feedback"
                    ? "All your donations have received feedback!"
                    : "Start donating to see feedback from recipients"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredDonations.map((donation) => (
              <Card key={donation._id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {donation.foodType}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Quantity: {donation.quantity} | Status: <Badge>{donation.status}</Badge>
                      </CardDescription>
                    </div>
                    {donation.ngoFeedback && (
                      <Badge variant="outline" className="bg-white">
                        <Heart className="w-3 h-3 mr-1 fill-red-500 text-red-500" />
                        Feedback Received
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {donation.ngoFeedback ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold">Rating:</span>
                            {getRatingStars(donation.ngoFeedback.rating)}
                            <span className="text-sm text-muted-foreground">
                              ({donation.ngoFeedback.rating}/5)
                            </span>
                          </div>
                          <p className="text-sm font-semibold mb-1">{donation.ngoFeedback.title}</p>
                          <p className="text-sm text-muted-foreground">{donation.ngoFeedback.message}</p>
                        </div>
                      </div>

                      {donation.ngoFeedback.impact && (
                        <Alert className="bg-blue-50 border-blue-200">
                          <ThumbsUp className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-900">
                            <strong>Impact:</strong> {donation.ngoFeedback.impact}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                        <span>Feedback by: {(donation.ngoFeedback as any).ngoName || "NGO"}</span>
                        <span>{formatDate(donation.ngoFeedback.createdAt)}</span>
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <MessageSquare className="h-4 w-4" />
                      <AlertDescription>
                        The recipient hasn't provided feedback yet. They'll share their experience soon!
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DonorFeedbackView;
