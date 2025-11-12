import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Loader2,
  AlertCircle,
  Star,
  Calendar,
  Package,
  CheckCircle,
  Heart,
  Send
} from "lucide-react";
import { getClaimedSurplus, submitDonationFeedback } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Simple date formatter
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

const GiveDonationFeedback = () => {
  const { toast } = useToast();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // Feedback form state
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [impact, setImpact] = useState("");

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getClaimedSurplus();

      if (response.success && response.data) {
        setDonations(response.data);
      } else {
        setError(response.message || "Failed to fetch donations");
      }
    } catch (err: any) {
      console.error("Error fetching donations:", err);
      setError("An error occurred while fetching donations");
      toast({
        title: "Error",
        description: "Could not load received donations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedDonation) return;

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !message.trim()) {
      toast({
        title: "Fields Required",
        description: "Please fill in title and message",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const feedbackData = {
        rating,
        title: title.trim(),
        message: message.trim(),
        impact: impact.trim(),
      };

      const response = await submitDonationFeedback(selectedDonation._id, feedbackData);

      if (response.success) {
        toast({
          title: "Feedback Submitted!",
          description: "Thank you for your feedback. The donor has been notified.",
        });

        // Reset form
        setRating(0);
        setTitle("");
        setMessage("");
        setImpact("");
        setSelectedDonation(null);

        // Refresh donations
        fetchDonations();
      } else {
        throw new Error(response.message || "Failed to submit feedback");
      }
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      toast({
        title: "Error",
        description: err.message || "Could not submit feedback",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDonations = donations.filter((donation) => {
    if (filter === "delivered") return donation.status === "delivered";
    if (filter === "with-feedback") return donation.ngoFeedback;
    if (filter === "no-feedback") return !donation.ngoFeedback && donation.status === "delivered";
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
        <h2 className="text-3xl font-bold mb-2">Give Donation Feedback</h2>
        <p className="text-muted-foreground">
          Thank donors by sharing feedback on received donations
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Received Donations</CardTitle>
              <CardDescription>Show appreciation to your donors</CardDescription>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Received</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="no-feedback">Pending Feedback</SelectItem>
                <SelectItem value="with-feedback">Feedback Given</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDonations.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filter === "no-feedback"
                  ? "No donations pending feedback"
                  : "No donations found"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDonations.map((donation) => (
                <Card
                  key={donation._id}
                  className={`border-l-4 ${
                    donation.ngoFeedback ? "border-l-green-500" : "border-l-blue-500"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{donation.title}</CardTitle>
                          <Badge variant={donation.status === "delivered" ? "default" : "secondary"}>
                            {donation.status}
                          </Badge>
                          {donation.ngoFeedback && (
                            <Badge className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Feedback Given
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Received {formatDate(donation.updatedAt)}
                          </span>
                          <Badge variant="outline">{donation.category}</Badge>
                          <span>
                            {donation.quantity} {donation.unit}
                          </span>
                          {donation.donorId && (
                            <span>From: {donation.donorId.name}</span>
                          )}
                        </CardDescription>
                      </div>
                      {donation.status === "delivered" && !donation.ngoFeedback && (
                        <Dialog
                          open={selectedDonation?._id === donation._id}
                          onOpenChange={(open) => {
                            if (!open) {
                              setSelectedDonation(null);
                              setRating(0);
                              setTitle("");
                              setMessage("");
                              setImpact("");
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              onClick={() => setSelectedDonation(donation)}
                              className="gap-2"
                            >
                              <Heart className="w-4 h-4" />
                              Give Feedback
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Give Feedback for {donation.title}</DialogTitle>
                              <DialogDescription>
                                Share your appreciation and let the donor know the impact of their
                                contribution
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                              {/* Rating */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Rating *</label>
                                <div className="flex gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setRating(star)}
                                      onMouseEnter={() => setHoveredRating(star)}
                                      onMouseLeave={() => setHoveredRating(0)}
                                      className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                      <Star
                                        className={`w-8 h-8 ${
                                          star <= (hoveredRating || rating)
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Title */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Feedback Title *</label>
                                <Input
                                  placeholder="e.g., Thank you for the wonderful donation!"
                                  value={title}
                                  onChange={(e) => setTitle(e.target.value)}
                                  maxLength={100}
                                />
                              </div>

                              {/* Message */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Message *</label>
                                <Textarea
                                  placeholder="Share your thoughts and appreciation..."
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value)}
                                  rows={4}
                                  maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground">
                                  {message.length}/500 characters
                                </p>
                              </div>

                              {/* Impact */}
                              <div className="space-y-2">
                                <label className="text-sm font-medium">
                                  Impact (Optional)
                                </label>
                                <Textarea
                                  placeholder="e.g., This donation helped feed 50 families in our community"
                                  value={impact}
                                  onChange={(e) => setImpact(e.target.value)}
                                  rows={3}
                                  maxLength={300}
                                />
                                <p className="text-xs text-muted-foreground">
                                  {impact.length}/300 characters
                                </p>
                              </div>
                            </div>

                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setSelectedDonation(null)}
                                disabled={submitting}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSubmitFeedback}
                                disabled={submitting}
                                className="gap-2"
                              >
                                {submitting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Submitting...
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4" />
                                    Submit Feedback
                                  </>
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {donation.description}
                    </p>

                    {donation.ngoFeedback && (
                      <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-green-900 dark:text-green-100">
                            Your Feedback
                          </h4>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= donation.ngoFeedback.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <h5 className="font-medium mb-1">{donation.ngoFeedback.title}</h5>
                        <p className="text-sm">{donation.ngoFeedback.message}</p>
                        {donation.ngoFeedback.impact && (
                          <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                            <strong>Impact:</strong> {donation.ngoFeedback.impact}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GiveDonationFeedback;
