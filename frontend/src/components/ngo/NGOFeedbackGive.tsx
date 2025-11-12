import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  Package,
  Heart,
  MessageSquare,
  Loader2,
  AlertCircle,
  Send,
  CheckCircle
} from "lucide-react";
import { getNGORequests, submitDonationFeedback } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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

const NGOFeedbackGive = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    title: "",
    message: "",
    impact: "",
  });

  const [hoveredRating, setHoveredRating] = useState(0);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await getNGORequests();
      if (response.success) {
        // Filter delivered items
        const deliveredItems = response.data.filter(
          (item: any) => item.status === 'delivered'
        );
        setRequests(deliveredItems);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "Failed to load your requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackForm.rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await submitDonationFeedback(selectedItem._id, feedbackForm);

      if (response.success) {
        toast({
          title: "Feedback Submitted!",
          description: "Thank you for sharing your experience with the donor",
        });
        setSelectedItem(null);
        setFeedbackForm({ rating: 0, title: "", message: "", impact: "" });
        fetchRequests(); // Refresh list
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to submit feedback",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setFeedbackForm({ ...feedbackForm, rating: star })}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            disabled={!interactive}
            className={interactive ? "transition-transform hover:scale-110" : ""}
          >
            <Star
              className={`w-6 h-6 ${
                star <= (hoveredRating || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const filteredRequests = requests.filter((request) => {
    if (activeTab === "all") return true;
    if (activeTab === "given") return request.ngoFeedback;
    if (activeTab === "pending") return !request.ngoFeedback;
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
        <h2 className="text-2xl font-bold mb-2">Give Feedback to Donors</h2>
        <p className="text-muted-foreground">
          Share your experience and show appreciation to donors
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All Received ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Feedback ({requests.filter(r => !r.ngoFeedback).length})
          </TabsTrigger>
          <TabsTrigger value="given">
            Feedback Given ({requests.filter(r => r.ngoFeedback).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No items found</p>
                <p className="text-sm text-muted-foreground">
                  {activeTab === "given"
                    ? "You haven't given any feedback yet"
                    : activeTab === "pending"
                    ? "All donations have received feedback!"
                    : "No delivered donations to provide feedback on"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request._id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {request.surplusId?.foodType || "Item"}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Quantity: {request.surplusId?.quantity || request.quantity} | 
                        From: {(request.surplusId?.donorId as any)?.name || "Donor"}
                      </CardDescription>
                      <p className="text-xs text-muted-foreground mt-1">
                        Delivered: {formatDate(request.updatedAt)}
                      </p>
                    </div>
                    {request.ngoFeedback ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Feedback Given
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        Pending Feedback
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {request.ngoFeedback ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">Your Rating:</span>
                        {getRatingStars(request.ngoFeedback.rating, false)}
                        <span className="text-sm text-muted-foreground">
                          ({request.ngoFeedback.rating}/5)
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold mb-1">{request.ngoFeedback.title}</p>
                        <p className="text-sm text-muted-foreground">{request.ngoFeedback.message}</p>
                      </div>
                      {request.ngoFeedback.impact && (
                        <Alert className="bg-blue-50 border-blue-200">
                          <Heart className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-900">
                            <strong>Impact Shared:</strong> {request.ngoFeedback.impact}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Alert>
                        <MessageSquare className="h-4 w-4" />
                        <AlertDescription>
                          Please share your experience with this donation to encourage the donor!
                        </AlertDescription>
                      </Alert>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full" 
                            onClick={() => setSelectedItem(request)}
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            Give Feedback
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Share Your Experience</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmitFeedback} className="space-y-4">
                            <div className="space-y-2">
                              <Label>How would you rate this donation? *</Label>
                              {getRatingStars(feedbackForm.rating, true)}
                              {feedbackForm.rating > 0 && (
                                <p className="text-sm text-muted-foreground">
                                  {feedbackForm.rating} out of 5 stars
                                </p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="title">Feedback Title *</Label>
                              <Input
                                id="title"
                                placeholder="e.g., Fresh and high quality food!"
                                value={feedbackForm.title}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, title: e.target.value })}
                                required
                                maxLength={100}
                                disabled={submitting}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="message">Your Message *</Label>
                              <Textarea
                                id="message"
                                placeholder="Share how this donation helped your organization..."
                                value={feedbackForm.message}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                                required
                                rows={4}
                                maxLength={500}
                                disabled={submitting}
                              />
                              <p className="text-xs text-muted-foreground">
                                {feedbackForm.message.length}/500 characters
                              </p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="impact">Impact (Optional)</Label>
                              <Textarea
                                id="impact"
                                placeholder="Tell the donor about the positive impact (e.g., 'Helped feed 50 families')"
                                value={feedbackForm.impact}
                                onChange={(e) => setFeedbackForm({ ...feedbackForm, impact: e.target.value })}
                                rows={2}
                                maxLength={200}
                                disabled={submitting}
                              />
                            </div>

                            <Alert className="bg-green-50 border-green-200">
                              <Heart className="h-4 w-4 text-green-600" />
                              <AlertDescription className="text-green-900">
                                Your feedback encourages donors to continue their generous contributions!
                              </AlertDescription>
                            </Alert>

                            <div className="flex gap-2 justify-end pt-4">
                              <DialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  disabled={submitting}
                                >
                                  Cancel
                                </Button>
                              </DialogTrigger>
                              <Button type="submit" disabled={submitting || feedbackForm.rating === 0}>
                                {submitting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Feedback
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
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

export default NGOFeedbackGive;
