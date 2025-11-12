import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Package,
  ThumbsUp,
  Heart,
  Gift,
  HandHeart
} from "lucide-react";
import { getUserComplaints, getUserFeedback, Complaint, Feedback, getDonorSurplus, getProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import SubmitComplaint from "@/components/ui/SubmitComplaint";
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

const SupportCenter = () => {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("complaints");
  
  const [complaintFilter, setComplaintFilter] = useState("all");
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const [donationFeedbackFilter, setDonationFeedbackFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get user profile to determine role
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Please log in to view support center');
        setLoading(false);
        return;
      }

      const profileRes = await getProfile(token);
      const role = profileRes.data?.user?.role || '';
      setUserRole(role);

      // Set initial tab based on role
      if (role === 'donor' && activeTab === 'complaints') {
        setActiveTab('donation-feedback');
      }

      // Fetch complaints
      try {
        const complaintsRes = await getUserComplaints(complaintFilter !== 'all' ? { status: complaintFilter } : {});
        if (complaintsRes && complaintsRes.success) {
          setComplaints(complaintsRes.data || []);
        } else {
          console.warn('Complaints fetch failed:', complaintsRes?.message);
          setComplaints([]);
        }
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setComplaints([]);
      }

      // Fetch feedback
      try {
        const feedbackRes = await getUserFeedback(feedbackFilter !== 'all' ? { type: feedbackFilter } : {});
        if (feedbackRes && feedbackRes.success) {
          setFeedback(feedbackRes.data || []);
        } else {
          console.warn('Feedback fetch failed:', feedbackRes?.message);
          setFeedback([]);
        }
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setFeedback([]);
      }

      // Fetch donations if user is a donor
      if (role === 'donor') {
        try {
          const donationsRes = await getDonorSurplus();
          if (donationsRes && donationsRes.success) {
            setDonations(donationsRes.data || []);
          } else {
            console.warn('Donations fetch failed:', donationsRes?.message);
            setDonations([]);
          }
        } catch (err) {
          console.error('Error fetching donations:', err);
          setDonations([]);
        }
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to load your data");
      // Only show toast for critical errors (like authentication failure)
      if (err.message && err.message.includes('authentication')) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated before fetching data
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setError('Please log in to view support center');
      setLoading(false);
      return;
    }
    fetchData();
  }, [complaintFilter, feedbackFilter]);

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

  if (error && error.includes('log in')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              className="mt-4 w-full" 
              onClick={() => window.location.href = '/auth'}
            >
              Go to Login
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getHeaderDescription = () => {
    switch (userRole) {
      case 'donor':
        return 'View feedback on your donations, submit complaints, or share your experience';
      case 'ngo':
        return 'Submit complaints, share feedback, or report issues with the platform';
      case 'logistics':
        return 'Submit complaints, share feedback about deliveries, or report issues';
      default:
        return 'Submit complaints or share feedback to help us improve';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Support Center</h1>
          <p className="text-muted-foreground">
            {getHeaderDescription()}
          </p>
        </div>
        <div className="flex gap-2">
          <SubmitComplaint onSuccess={fetchData} />
          <SubmitFeedback onSuccess={fetchData} />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full ${userRole === 'donor' ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {userRole === 'donor' && (
            <TabsTrigger value="donation-feedback" className="gap-2">
              <Gift className="w-4 h-4" />
              Donation Feedback ({donations.filter((d: any) => d.ngoFeedback).length})
            </TabsTrigger>
          )}
          <TabsTrigger value="complaints" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            My Complaints ({complaints.length})
          </TabsTrigger>
          <TabsTrigger value="feedback" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Platform Feedback ({feedback.length})
          </TabsTrigger>
        </TabsList>

        {/* Donation Feedback Tab - Only for Donors */}
        {userRole === 'donor' && (
          <TabsContent value="donation-feedback" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Feedback on Your Donations</CardTitle>
                    <CardDescription>See what NGOs think about your generous contributions</CardDescription>
                  </div>
                  <Select value={donationFeedbackFilter} onValueChange={setDonationFeedbackFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Donations</SelectItem>
                      <SelectItem value="with-feedback">With Feedback</SelectItem>
                      <SelectItem value="no-feedback">No Feedback Yet</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {donations.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No donations yet</p>
                    <p className="text-sm text-muted-foreground mt-2">Start donating to see feedback from NGOs</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {donations
                      .filter((donation: any) => {
                        if (donationFeedbackFilter === 'with-feedback') return donation.ngoFeedback;
                        if (donationFeedbackFilter === 'no-feedback') return !donation.ngoFeedback;
                        if (donationFeedbackFilter === 'delivered') return donation.status === 'delivered';
                        return true;
                      })
                      .map((donation: any) => (
                        <Card key={donation._id} className={`border-l-4 ${donation.ngoFeedback ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <CardTitle className="text-lg">{donation.title}</CardTitle>
                                  <Badge variant={donation.status === 'delivered' ? 'default' : 'secondary'}>
                                    {donation.status}
                                  </Badge>
                                  {donation.ngoFeedback && (
                                    <Badge className="bg-green-600">
                                      <Heart className="w-3 h-3 mr-1" />
                                      Feedback Received
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription className="flex items-center gap-4 text-xs">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(donation.createdAt)}
                                  </span>
                                  <Badge variant="outline">{donation.category}</Badge>
                                  <span>{donation.quantity} {donation.unit}</span>
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">{donation.description}</p>
                            
                            {donation.ngoFeedback ? (
                              <div className="mt-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                                <div className="flex items-center gap-2 mb-3">
                                  <HandHeart className="w-5 h-5 text-green-600" />
                                  <h4 className="font-semibold text-green-900 dark:text-green-100">NGO Feedback</h4>
                                  {getRatingStars(donation.ngoFeedback.rating)}
                                </div>
                                <h5 className="font-medium mb-1">{donation.ngoFeedback.title}</h5>
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                  {donation.ngoFeedback.message}
                                </p>
                                {donation.ngoFeedback.impact && (
                                  <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded border">
                                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Impact:</p>
                                    <p className="text-sm">{donation.ngoFeedback.impact}</p>
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-2">
                                  Submitted {formatDate(donation.ngoFeedback.submittedAt)}
                                </p>
                              </div>
                            ) : donation.status === 'delivered' ? (
                              <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                  Waiting for NGO feedback on this donation
                                </AlertDescription>
                              </Alert>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">
                                Feedback will be available once the donation is delivered and reviewed by the NGO
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="complaints" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Your Complaints</CardTitle>
                  <CardDescription>Report issues with the platform, deliveries, or user interactions</CardDescription>
                </div>
                <Select value={complaintFilter} onValueChange={setComplaintFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {complaints.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No complaints submitted yet</p>
                  <SubmitComplaint
                    trigger={
                      <Button className="mt-4">Submit Your First Complaint</Button>
                    }
                    onSuccess={fetchData}
                  />
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
                            </div>
                            <CardDescription className="flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(complaint.createdAt)}
                              </span>
                              <Badge variant="outline">{complaint.category}</Badge>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{complaint.description}</p>
                        
                        {complaint.proofUrls && complaint.proofUrls.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {complaint.proofUrls.map((url, index) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                Proof {index + 1}
                              </a>
                            ))}
                          </div>
                        )}

                        {complaint.adminResponse && (
                          <Alert className="bg-blue-50 border-blue-200">
                            <AlertDescription className="text-blue-900">
                              <strong>Admin Response:</strong> {complaint.adminResponse}
                            </AlertDescription>
                          </Alert>
                        )}
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Platform Feedback</CardTitle>
                  <CardDescription>Share your experience, suggest features, or report bugs</CardDescription>
                </div>
                <Select value={feedbackFilter} onValueChange={setFeedbackFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="feature-request">Feature Request</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="appreciation">Appreciation</SelectItem>
                    <SelectItem value="bug-report">Bug Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {feedback.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No feedback submitted yet</p>
                  <SubmitFeedback
                    trigger={
                      <Button className="mt-4">Share Your First Feedback</Button>
                    }
                    onSuccess={fetchData}
                  />
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
                              {item.isPublic && <Badge variant="outline">Public</Badge>}
                              {item.adminReviewed && (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Reviewed
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="flex items-center gap-4 text-xs">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(item.createdAt)}
                              </span>
                              <Badge variant="outline">{item.type.replace('-', ' ')}</Badge>
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        
                        {item.proofUrls && item.proofUrls.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {item.proofUrls.map((url, index) => (
                              <a
                                key={index}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                Attachment {index + 1}
                              </a>
                            ))}
                          </div>
                        )}

                        {item.adminNotes && (
                          <Alert className="bg-green-50 border-green-200">
                            <AlertDescription className="text-green-900">
                              <strong>Admin Notes:</strong> {item.adminNotes}
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupportCenter;
