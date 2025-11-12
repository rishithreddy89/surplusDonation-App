import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  MessageSquare,
  Loader2,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Star,
  Eye,
  Filter,
  TrendingUp,
  Users,
  FileText
} from "lucide-react";
import {
  getAllComplaints,
  updateComplaintStatus,
  getComplaintStats,
  getAllFeedback,
  reviewFeedback,
  getFeedbackStats,
  Complaint,
  Feedback
} from "@/lib/api";
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

const ComplaintsManagement = () => {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [complaintStats, setComplaintStats] = useState<any>(null);
  const [feedbackStats, setFeedbackStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("complaints");
  
  const [complaintFilter, setComplaintFilter] = useState({ status: "", priority: "", category: "" });
  const [feedbackFilter, setFeedbackFilter] = useState({ type: "", rating: "" });
  
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const fetchComplaints = async () => {
    try {
      const filter = Object.fromEntries(
        Object.entries(complaintFilter).filter(([_, v]) => v !== "")
      );
      const response = await getAllComplaints(filter);
      if (response.success) {
        setComplaints(response.data);
      }
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
  };

  const fetchFeedback = async () => {
    try {
      const filter = Object.fromEntries(
        Object.entries(feedbackFilter).filter(([_, v]) => v !== "")
      );
      const response = await getAllFeedback(filter);
      if (response.success) {
        setFeedback(response.data);
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const [complaintStatsRes, feedbackStatsRes] = await Promise.all([
        getComplaintStats(),
        getFeedbackStats()
      ]);
      
      if (complaintStatsRes.success) {
        setComplaintStats(complaintStatsRes.data);
      }
      if (feedbackStatsRes.success) {
        setFeedbackStats(feedbackStatsRes.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchComplaints(), fetchFeedback(), fetchStats()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [complaintFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [feedbackFilter]);

  const handleUpdateComplaint = async (status: string) => {
    if (!selectedComplaint) return;

    setUpdateLoading(true);
    try {
      const response = await updateComplaintStatus(selectedComplaint._id, {
        status,
        adminResponse: adminResponse || undefined
      });

      if (response.success) {
        toast({
          title: "Complaint Updated",
          description: "Complaint status has been updated successfully",
        });
        setSelectedComplaint(null);
        setAdminResponse("");
        fetchComplaints();
        fetchStats();
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update complaint",
        variant: "destructive",
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleReviewFeedback = async () => {
    if (!selectedFeedback) return;

    setUpdateLoading(true);
    try {
      const response = await reviewFeedback(selectedFeedback._id, {
        adminNotes: adminNotes || undefined,
        adminReviewed: true
      });

      if (response.success) {
        toast({
          title: "Feedback Reviewed",
          description: "Feedback has been marked as reviewed",
        });
        setSelectedFeedback(null);
        setAdminNotes("");
        fetchFeedback();
        fetchStats();
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to review feedback",
        variant: "destructive",
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: { variant: "secondary", icon: Clock, text: "Pending" },
      "in-progress": { variant: "default", icon: Loader2, text: "In Progress" },
      resolved: { variant: "default", icon: CheckCircle, text: "Resolved", className: "bg-green-600" },
      closed: { variant: "outline", icon: XCircle, text: "Closed" },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: any = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={colors[priority] || colors.medium}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

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
        <h1 className="text-3xl font-bold mb-2">Complaints & Feedback Management</h1>
        <p className="text-muted-foreground">
          Monitor and respond to user complaints and feedback
        </p>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Complaints</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaintStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {complaintStats?.pending || 0} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Complaints</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complaintStats?.resolved || 0}</div>
            <p className="text-xs text-muted-foreground">
              {complaintStats?.total > 0
                ? Math.round(((complaintStats?.resolved || 0) / complaintStats.total) * 100)
                : 0}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedbackStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {feedbackStats?.unreviewed || 0} unreviewed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feedbackStats?.averageRating ? feedbackStats.averageRating.toFixed(1) : "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="complaints">
            Complaints ({complaints.length})
          </TabsTrigger>
          <TabsTrigger value="feedback">
            Feedback ({feedback.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="complaints" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1">
                  <CardTitle>All Complaints</CardTitle>
                  <CardDescription>Review and manage user complaints</CardDescription>
                </div>
                <Select
                  value={complaintFilter.status}
                  onValueChange={(value) => setComplaintFilter({ ...complaintFilter, status: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={complaintFilter.priority}
                  onValueChange={(value) => setComplaintFilter({ ...complaintFilter, priority: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {complaints.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No complaints found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <Card key={complaint._id} className="border-l-4 border-l-orange-500">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">{complaint.title}</CardTitle>
                              {getStatusBadge(complaint.status)}
                              {getPriorityBadge(complaint.priority)}
                              <Badge variant="outline">{(complaint as any).userId?.role || complaint.userRole}</Badge>
                            </div>
                            <CardDescription className="flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {(complaint as any).userId?.name || "Unknown User"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(complaint.createdAt)}
                              </span>
                              <Badge variant="outline">{complaint.category}</Badge>
                            </CardDescription>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setAdminResponse(complaint.adminResponse || "");
                            }}
                          >
                            Manage
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {complaint.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1">
                  <CardTitle>All Feedback</CardTitle>
                  <CardDescription>Review user feedback and suggestions</CardDescription>
                </div>
                <Select
                  value={feedbackFilter.type}
                  onValueChange={(value) => setFeedbackFilter({ ...feedbackFilter, type: value })}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="feature-request">Feature Request</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="appreciation">Appreciation</SelectItem>
                    <SelectItem value="bug-report">Bug Report</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={feedbackFilter.rating}
                  onValueChange={(value) => setFeedbackFilter({ ...feedbackFilter, rating: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Ratings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {feedback.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No feedback found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedback.map((item) => (
                    <Card key={item._id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-lg">{item.title}</CardTitle>
                              {getRatingStars(item.rating)}
                              {item.adminReviewed && (
                                <Badge className="bg-green-100 text-green-800">Reviewed</Badge>
                              )}
                            </div>
                            <CardDescription className="flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {(item as any).userId?.name || "Unknown User"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(item.createdAt)}
                              </span>
                              <Badge variant="outline">{item.type.replace('-', ' ')}</Badge>
                            </CardDescription>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedFeedback(item);
                              setAdminNotes(item.adminNotes || "");
                            }}
                          >
                            Review
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Complaint Management Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={(open) => !open && setSelectedComplaint(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Complaint</DialogTitle>
            <DialogDescription>
              Review and respond to this complaint
            </DialogDescription>
          </DialogHeader>
          
          {selectedComplaint && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{selectedComplaint.title}</h3>
                <div className="flex gap-2 mb-3">
                  {getStatusBadge(selectedComplaint.status)}
                  {getPriorityBadge(selectedComplaint.priority)}
                  <Badge variant="outline">{selectedComplaint.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedComplaint.description}
                </p>
              </div>

              {selectedComplaint.proofUrls && selectedComplaint.proofUrls.length > 0 && (
                <div>
                  <Label className="mb-2">Evidence:</Label>
                  <div className="flex gap-2 flex-wrap">
                    {selectedComplaint.proofUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View Proof {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="adminResponse">Admin Response</Label>
                <Textarea
                  id="adminResponse"
                  placeholder="Provide a response to the user..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={4}
                  disabled={updateLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>Update Status</Label>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateComplaint("pending")}
                    disabled={updateLoading || selectedComplaint.status === "pending"}
                  >
                    Mark Pending
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateComplaint("in-progress")}
                    disabled={updateLoading || selectedComplaint.status === "in-progress"}
                  >
                    In Progress
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateComplaint("resolved")}
                    disabled={updateLoading || selectedComplaint.status === "resolved"}
                  >
                    Mark Resolved
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleUpdateComplaint("closed")}
                    disabled={updateLoading || selectedComplaint.status === "closed"}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Feedback Review Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Feedback</DialogTitle>
            <DialogDescription>
              Add your notes and mark as reviewed
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">{selectedFeedback.title}</h3>
                <div className="flex gap-2 mb-3">
                  {getRatingStars(selectedFeedback.rating)}
                  <Badge variant="outline">{selectedFeedback.type.replace('-', ' ')}</Badge>
                  {selectedFeedback.isPublic && <Badge>Public</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedFeedback.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNotes">Admin Notes (Internal)</Label>
                <Textarea
                  id="adminNotes"
                  placeholder="Add internal notes about this feedback..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  disabled={updateLoading}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFeedback(null)}
                  disabled={updateLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReviewFeedback}
                  disabled={updateLoading || selectedFeedback.adminReviewed}
                >
                  {updateLoading ? "Saving..." : "Mark as Reviewed"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComplaintsManagement;
