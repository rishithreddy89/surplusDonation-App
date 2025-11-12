import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle, XCircle, Package, Users, Clock, Truck, Share2 } from "lucide-react";
import { getDonorSurplus, Surplus, acceptSurplusRequest, rejectSurplusRequest, generateImpactCard, directDonateToNGO } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ImpactCard from "./ImpactCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MyDonations = () => {
  const { toast } = useToast();
  const [donations, setDonations] = useState<Surplus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [processedDonations, setProcessedDonations] = useState<Set<string>>(new Set());
  const [impactCardData, setImpactCardData] = useState<any>(null);
  const [showImpactCard, setShowImpactCard] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, [statusFilter, categoryFilter]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (statusFilter && statusFilter !== "all") filters.status = statusFilter;
      if (categoryFilter && categoryFilter !== "all") filters.category = categoryFilter;

      const response = await getDonorSurplus(filters);

      if (response.success && response.data) {
        setDonations(response.data);
      } else {
        setError(response.message || "Failed to fetch donations");
      }
    } catch (err: any) {
      console.error('Fetch donations error:', err);
      setError(err.message || "An error occurred while fetching donations");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (donation: Surplus) => {
    try {
      setActionLoading(donation._id);

      const response = await acceptSurplusRequest(donation._id);

      if (response.success) {
        toast({
          title: "Success!",
          description: "Request accepted. NGO has been notified.",
        });
        
        // Mark this donation as processed to hide buttons immediately
        setProcessedDonations(prev => new Set(prev).add(donation._id));
        
        // Immediately update the local state to 'accepted' status
        setDonations(prevDonations => 
          prevDonations.map(d => 
            d._id === donation._id 
              ? { ...d, status: 'accepted' as any }
              : d
          )
        );
        
        // Then fetch fresh data from server
        await fetchDonations();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to accept request",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectRequest = async (donation: Surplus) => {
    try {
      setActionLoading(donation._id);

      const response = await rejectSurplusRequest(donation._id);

      if (response.success) {
        toast({
          title: "Success!",
          description: "Request rejected. Item is now available for others.",
        });
        
        // Mark this donation as processed to hide buttons immediately
        setProcessedDonations(prev => new Set(prev).add(donation._id));
        
        // Immediately update the local state
        setDonations(prevDonations => 
          prevDonations.map(d => 
            d._id === donation._id 
              ? { ...d, status: 'available' as any, claimedBy: undefined }
              : d
          )
        );
        
        // Then fetch fresh data from server
        await fetchDonations();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to reject request",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateImpactCard = async (donation: Surplus) => {
    try {
      setActionLoading(donation._id);
      const response = await generateImpactCard(donation._id);

      if (response.success && response.data) {
        setImpactCardData(response.data);
        setShowImpactCard(true);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to generate impact card",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDirectDonate = async (donation: Surplus) => {
    try {
      setActionLoading(donation._id);

      const response = await directDonateToNGO(donation._id);

      if (response.success) {
        toast({
          title: "Success!",
          description: "You are now delivering directly. Please deliver the item to the NGO.",
        });
        
        // Mark as processed and update local state
        setProcessedDonations(prev => new Set(prev).add(donation._id));
        setDonations(prevDonations => 
          prevDonations.map(d => 
            d._id === donation._id 
              ? { ...d, status: 'in-transit' as any }
              : d
          )
        );
        
        await fetchDonations();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to initiate direct delivery",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success text-white";
      case "in-transit":
        return "bg-primary text-white";
      case "accepted":
        return "bg-blue-500 text-white"; // Changed from bg-info to bg-blue-500
      case "claimed":
        return "bg-warning text-black font-medium"; // Waiting for donor approval
      case "available":
        return "bg-secondary";
      case "expired":
        return "bg-destructive text-white";
      default:
        return "bg-muted";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRecipientName = (donation: Surplus) => {
    if (donation.claimedBy && typeof donation.claimedBy === 'object' && 'name' in donation.claimedBy) {
      return (donation.claimedBy as any).name;
    }
    return donation.status === 'available' ? 'Not claimed yet' : 'N/A';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">My Donations</h2>
        <p className="text-muted-foreground">Track all your past and ongoing donations</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-64">
              <Label htmlFor="status-filter" className="mb-2 block">Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="claimed">Awaiting Your Approval</SelectItem>
                  <SelectItem value="accepted">Accepted - Awaiting Pickup</SelectItem>
                  <SelectItem value="in-transit">Picked Up (In Transit)</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-64">
              <Label htmlFor="category-filter" className="mb-2 block">Filter by Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category-filter">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Donation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading donations...</span>
            </div>
          ) : donations.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
              <p className="text-lg font-medium text-muted-foreground">No donations found</p>
              <p className="text-sm text-muted-foreground mt-2">Create your first surplus item to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {donations.map((donation) => (
                <Card key={donation._id} className="border-2 hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left Section - Item Details */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{donation.title}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="outline" className="capitalize">
                                {donation.category}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {donation.quantity} {donation.unit}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Recipient:</span>
                            <span className="font-medium">{getRecipientName(donation)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Created:</span>
                            <span className="font-medium">{formatDate(donation.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Status & Actions */}
                      <div className="flex flex-col items-start lg:items-end gap-3 lg:min-w-[200px]">
                        {donation.status === 'claimed' && !processedDonations.has(donation._id) ? (
                          <div className="w-full space-y-3">
                            <Badge className={`${getStatusColor(donation.status)} text-sm px-3 py-1`}>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Awaiting Your Approval
                            </Badge>
                            <div className="flex gap-2 w-full">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleAcceptRequest(donation)}
                                disabled={actionLoading === donation._id || processedDonations.has(donation._id)}
                                className="flex-1"
                              >
                                {actionLoading === donation._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Accept
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectRequest(donation)}
                                disabled={actionLoading === donation._id || processedDonations.has(donation._id)}
                                className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-white"
                              >
                                {actionLoading === donation._id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                              Accept to confirm and wait for logistics pickup
                            </p>
                          </div>
                        ) : donation.status === 'accepted' && !processedDonations.has(donation._id) ? (
                          <div className="w-full space-y-3">
                            <Badge className={`${getStatusColor(donation.status)} text-sm px-3 py-1`}>
                              <Clock className="w-3 h-3 mr-1" />
                              Awaiting Pickup
                            </Badge>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="default"
                                  disabled={actionLoading === donation._id}
                                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                                >
                                  <Truck className="w-4 h-4 mr-2" />
                                  Deliver Directly
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Deliver Item Directly?</AlertDialogTitle>
                                  <AlertDialogDescription className="space-y-3">
                                    <p>
                                      You are about to deliver <strong>{donation.title}</strong> directly to{' '}
                                      <strong>{getRecipientName(donation)}</strong>.
                                    </p>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                                      <p className="font-semibold mb-2">📦 What happens next:</p>
                                      <ul className="list-disc list-inside space-y-1">
                                        <li>You will be responsible for delivering this item</li>
                                        <li>The NGO will be notified of your direct delivery</li>
                                        <li>No logistics partner will be involved</li>
                                        <li>You can mark as delivered after handover</li>
                                      </ul>
                                    </div>
                                    <p className="text-sm">
                                      Are you sure you want to handle the delivery yourself?
                                    </p>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDirectDonate(donation)}>
                                    Yes, I'll Deliver
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            <p className="text-xs text-muted-foreground text-center">
                              Deliver yourself or wait for logistics pickup
                            </p>
                          </div>
                        ) : donation.status === 'delivered' ? (
                          <div className="w-full space-y-3">
                            <Badge className={`${getStatusColor(donation.status)} text-sm px-4 py-1.5`}>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Delivered
                            </Badge>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleGenerateImpactCard(donation)}
                              disabled={actionLoading === donation._id}
                              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                            >
                              {actionLoading === donation._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share Impact
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Badge className={`${getStatusColor(donation.status)} text-sm px-4 py-1.5`}>
                            {donation.status === 'in-transit' && <Truck className="w-3 h-3 mr-1" />}
                            {donation.status === 'available' && <Clock className="w-3 h-3 mr-1" />}
                            {donation.status === 'claimed' && <AlertCircle className="w-3 h-3 mr-1" />}
                            {donation.status === 'accepted' ? 'Awaiting Pickup' : donation.status.replace('-', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {!loading && donations.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{donations.length}</div>
                  <p className="text-xs text-muted-foreground">Total Donations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-full">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">
                    {donations.filter(d => d.status === 'delivered').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-warning/10 rounded-full">
                  <Truck className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-warning">
                    {donations.filter(d => d.status === 'in-transit' || d.status === 'accepted').length}
                  </div>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary/10 rounded-full">
                  <Clock className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary">
                    {donations.filter(d => d.status === 'available').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Impact Card Modal */}
      {impactCardData && (
        <ImpactCard
          data={impactCardData}
          open={showImpactCard}
          onClose={() => setShowImpactCard(false)}
        />
      )}
    </div>
  );
};

export default MyDonations;
