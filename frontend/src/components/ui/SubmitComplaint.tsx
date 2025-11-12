import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertTriangle, Send, CheckCircle, AlertCircle, Upload, X } from "lucide-react";
import { createComplaint } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface SubmitComplaintProps {
  trigger?: React.ReactNode;
  relatedTo?: {
    type: 'surplus' | 'request' | 'task' | 'user';
    id: string;
  };
  onSuccess?: () => void;
}

const SubmitComplaint = ({ trigger, relatedTo, onSuccess }: SubmitComplaintProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium",
    proofUrls: [] as string[],
  });

  const [proofUrl, setProofUrl] = useState("");

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
      const complaintData = {
        ...formData,
        relatedTo
      };

      const response = await createComplaint(complaintData);

      if (response.success) {
        setSuccess(true);
        toast({
          title: "Complaint Submitted",
          description: "Your complaint has been recorded. We'll review it shortly.",
        });

        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setFormData({
            title: "",
            description: "",
            category: "",
            priority: "medium",
            proofUrls: [],
          });
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        setError(response.message || "Failed to submit complaint");
        if (response.field) {
          toast({
            title: "Content Warning",
            description: response.message,
            variant: "destructive",
          });
        }
      }
    } catch (err: any) {
      console.error("Error submitting complaint:", err);
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
            <AlertTriangle className="w-4 h-4" />
            Submit Complaint
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Submit a Complaint
          </DialogTitle>
          <DialogDescription>
            Report any issues or concerns. Your feedback helps us improve our service.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Complaint Submitted!</h3>
            <p className="text-muted-foreground">
              We've received your complaint and will investigate it promptly.
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
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief summary of your complaint"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                maxLength={200}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Please use appropriate language. Profanity will be automatically rejected.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select complaint category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service Quality</SelectItem>
                  <SelectItem value="delivery">Delivery Issues</SelectItem>
                  <SelectItem value="quality">Product Quality</SelectItem>
                  <SelectItem value="behavior">Behavior/Conduct</SelectItem>
                  <SelectItem value="technical">Technical Problems</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your complaint"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={5}
                maxLength={2000}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/2000 characters. Please maintain respectful language.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Proof/Evidence (Optional)</Label>
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
                Add up to 5 proof URLs (images, documents, screenshots)
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

            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                All complaints are reviewed by our team. Inappropriate language or false complaints may result in account warnings.
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
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>Submitting...</>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Complaint
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

export default SubmitComplaint;
