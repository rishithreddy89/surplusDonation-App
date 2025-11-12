import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Send, CheckCircle, AlertCircle, Upload, X, Star } from "lucide-react";
import { createFeedback } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SubmitFeedbackProps {
  trigger?: React.ReactNode;
  relatedTo?: {
    type: 'surplus' | 'request' | 'task' | 'delivery';
    id: string;
  };
  onSuccess?: () => void;
}

const SubmitFeedback = ({ trigger, relatedTo, onSuccess }: SubmitFeedbackProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    type: "",
    rating: 0,
    title: "",
    description: "",
    proofUrls: [] as string[],
    isPublic: false,
  });

  const [proofUrl, setProofUrl] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleAddProof = () => {
    if (proofUrl.trim() && formData.proofUrls.length < 5) {
      setFormData({
        ...formData,
        proofUrls: [...formData.proofUrls, proofUrl.trim()]
      });
      setProofUrl("");
    }
  };

  const handleRemoveProof = (index: number) => {
    setFormData({
      ...formData,
      proofUrls: formData.proofUrls.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const feedbackData = {
        ...formData,
        relatedTo
      };

      const response = await createFeedback(feedbackData);

      if (response.success) {
        setSuccess(true);
        toast({
          title: "Feedback Submitted",
          description: response.message || "Thank you for your valuable feedback!",
        });

        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setFormData({
            type: "",
            rating: 0,
            title: "",
            description: "",
            proofUrls: [],
            isPublic: false,
          });
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        setError(response.message || "Failed to submit feedback");
        if (response.field) {
          toast({
            title: "Content Warning",
            description: response.message,
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      console.error("Error submitting feedback:", err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Share Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Share Your Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve! Your feedback is valuable and appreciated.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
            <p className="text-muted-foreground">
              Your feedback has been received and will help us improve our service.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="type">Feedback Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                required
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select feedback type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Feedback</SelectItem>
                  <SelectItem value="feature-request">Feature Request</SelectItem>
                  <SelectItem value="improvement">Improvement Suggestion</SelectItem>
                  <SelectItem value="appreciation">Appreciation</SelectItem>
                  <SelectItem value="bug-report">Bug Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rating *</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-transform hover:scale-110"
                    disabled={loading}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoveredRating || formData.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {formData.rating > 0 ? `${formData.rating} out of 5` : "Select a rating"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief summary of your feedback"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                maxLength={200}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Please use appropriate language. Content is automatically moderated.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Details *</Label>
              <Textarea
                id="description"
                placeholder="Share your thoughts, suggestions, or experiences"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
                maxLength={2000}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/2000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label>Supporting Materials (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste image URL or document link"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  disabled={loading || formData.proofUrls.length >= 5}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddProof}
                  disabled={!proofUrl.trim() || formData.proofUrls.length >= 5 || loading}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Add up to 5 URLs (screenshots, documents, etc.)
              </p>
              {formData.proofUrls.length > 0 && (
                <div className="space-y-1 mt-2">
                  {formData.proofUrls.map((url, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                      <span className="truncate flex-1">{url}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProof(index)}
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <Checkbox
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublic: checked as boolean })
                }
                disabled={loading}
              />
              <Label htmlFor="isPublic" className="cursor-pointer">
                Make my feedback public (visible to other users)
              </Label>
            </div>

            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                Your feedback helps us create a better experience for everyone. Thank you for contributing!
              </AlertDescription>
            </Alert>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || formData.rating === 0}>
                {loading ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubmitFeedback;
