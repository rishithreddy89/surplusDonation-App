import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode, Search, CheckCircle2, Package, Truck, MapPin, Loader2, AlertCircle, CheckCircle, Star, Heart, ThumbsUp, Clock } from "lucide-react";
import { trackDonationById, getDonorSurplus } from "@/lib/api";
import { loadGoogleMapsScript, createMap, createMarker, geocodeAddress, getDirections } from "@/lib/googleMaps";

const TrackDonation = () => {
  const [donationId, setDonationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [myDonations, setMyDonations] = useState<any[]>([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const [activeTab, setActiveTab] = useState("search");
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [mapLoading, setMapLoading] = useState(false);

  // Fetch user's donations on mount
  useEffect(() => {
    fetchMyDonations();
    setInitialLoading(false);
  }, []);

  const fetchMyDonations = async () => {
    try {
      setLoadingDonations(true);
      const response = await getDonorSurplus();
      if (response.success && response.data) {
        // Filter only donations that have been picked up or delivered
        const activeDonations = response.data.filter(
          (d: any) => d.status === 'in-transit' || d.status === 'delivered' || d.status === 'claimed'
        );
        setMyDonations(activeDonations);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    } finally {
      setLoadingDonations(false);
    }
  };

  const handleTrack = async () => {
    if (!donationId.trim()) {
      setError("Please enter a donation ID");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await trackDonationById(donationId);

      if (response.success && response.data) {
        setTrackingData(response.data);
        setActiveTab("details");
        if (response.data.surplus?.location?.address) {
          initializeMap(response.data);
        }
      } else {
        setError(response.message || "Donation not found");
      }
    } catch (err: any) {
      console.error('Track donation error:', err);
      setError(err.message || "An error occurred while tracking");
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = async (data: any) => {
    try {
      setMapLoading(true);
      await loadGoogleMapsScript();

      if (!mapRef.current) return;

      const pickupAddress = data.surplus?.location?.address || "Mumbai, India";
      const deliveryAddress = data.task?.ngoId?.address || data.task?.deliveryLocation?.address;

      const pickupLocation = await geocodeAddress(pickupAddress);
      
      if (!pickupLocation) {
        console.warn('Could not geocode pickup address');
        setMapLoading(false);
        return;
      }

      const mapInstance = createMap(mapRef.current, {
        center: { lat: pickupLocation.lat(), lng: pickupLocation.lng() },
        zoom: 13,
      });

      setMap(mapInstance);

      // Pickup marker
      createMarker({
        position: pickupLocation,
        map: mapInstance,
        title: 'Pickup Location',
        label: 'P',
      });

      // Delivery marker and route if available
      if (deliveryAddress) {
        const deliveryLocation = await geocodeAddress(deliveryAddress);
        if (deliveryLocation) {
          createMarker({
            position: deliveryLocation,
            map: mapInstance,
            title: 'Delivery Location',
            label: 'D',
          });

          // Draw route if in transit or delivered
          if (data.surplus?.status === 'in-transit' || data.surplus?.status === 'delivered') {
            await getDirections(pickupLocation, deliveryLocation, mapInstance);
          }

          // Fit bounds to show both markers
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(pickupLocation);
          bounds.extend(deliveryLocation);
          mapInstance.fitBounds(bounds);
        }
      }

      setMapLoading(false);
    } catch (err) {
      console.error('Map initialization error:', err);
      setMapLoading(false);
    }
  };

  const getTimeline = () => {
    if (!trackingData) return [];

    const { surplus, task, timeline } = trackingData;

    return [
      { 
        label: "Donated", 
        icon: Package, 
        completed: true, 
        date: timeline.created ? new Date(timeline.created).toLocaleString() : 'N/A'
      },
      { 
        label: "Claimed", 
        icon: CheckCircle2, 
        completed: !!timeline.claimed, 
        date: timeline.claimed ? new Date(timeline.claimed).toLocaleString() : 'Pending'
      },
      { 
        label: "Picked Up", 
        icon: Truck, 
        completed: !!timeline.pickedUp, 
        date: timeline.pickedUp ? new Date(timeline.pickedUp).toLocaleString() : 'Pending'
      },
      { 
        label: "Delivered", 
        icon: MapPin, 
        completed: !!timeline.delivered, 
        date: timeline.delivered ? new Date(timeline.delivered).toLocaleString() : 'Pending'
      },
    ];
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading your donations...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Track Your Donations</h2>
        <p className="text-muted-foreground">Monitor delivery status, location, and see how your donations made an impact</p>
      </div>

      {/* My Donations List */}
      {!loadingDonations && myDonations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Active Donations</CardTitle>
            <CardDescription>Click on a donation to track it</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {myDonations.map((donation) => (
                <div
                  key={donation._id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer transition-colors"
                  onClick={() => {
                    setDonationId(donation._id);
                    handleTrack();
                  }}
                >
                  <div className="flex-1">
                    <p className="font-medium">{donation.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {donation.quantity} {donation.unit} - {donation.category}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="capitalize">
                      {donation.status.replace('-', ' ')}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {donation._id.slice(-8)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search">Search by ID</TabsTrigger>
          <TabsTrigger value="details">Tracking Details</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search by Donation ID</CardTitle>
              <CardDescription>Enter your donation ID to track specific item</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter Donation ID" 
                  className="flex-1" 
                  value={donationId}
                  onChange={(e) => setDonationId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                />
                <Button onClick={handleTrack} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                  Track
                </Button>
              </div>
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">OR</p>
                <Button variant="outline" disabled>
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR Code (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!trackingData && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No tracking data available</p>
                <p className="text-sm mt-2">Search for a donation ID to view tracking details</p>
              </CardContent>
            </Card>
          )}

          {trackingData && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{trackingData.surplus.title}</CardTitle>
                      <CardDescription>
                        {trackingData.surplus.quantity} {trackingData.surplus.unit} - {trackingData.surplus.category}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Donation ID</p>
                      <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                        {trackingData.surplus._id}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {getTimeline().map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.completed ? "bg-success" : "bg-muted"
                          }`}>
                            {step.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : (
                              <step.icon className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          {index < getTimeline().length - 1 && (
                            <div className={`absolute left-1/2 top-10 w-0.5 h-12 -ml-px ${
                              step.completed ? "bg-success" : "bg-muted"
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <h4 className="font-semibold mb-1">{step.label}</h4>
                          <p className="text-sm text-muted-foreground">{step.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {trackingData.task && (
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">NGO/Recipient</p>
                      <p className="text-sm text-muted-foreground">
                        {trackingData.task.ngoId?.name || 'Not assigned'}
                      </p>
                    </div>
                    {trackingData.task.logisticsPartnerId && (
                      <div>
                        <p className="text-sm font-medium">Logistics Partner</p>
                        <p className="text-sm text-muted-foreground">
                          {trackingData.task.logisticsPartnerId.name} - {trackingData.task.logisticsPartnerId.vehicleType}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {trackingData.surplus.status.replace('-', ' ')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {trackingData.surplus?.location?.address && (
                <Card>
                  <CardHeader>
                    <CardTitle>Delivery Map</CardTitle>
                    <CardDescription>Track your donation's journey on the map</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
                      {mapLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="ml-2">Loading map...</span>
                        </div>
                      )}
                      <div ref={mapRef} className="w-full h-full" />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>P = Pickup Location</span>
                      <MapPin className="w-4 h-4 text-success" />
                      <span>D = Delivery Location</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {trackingData.surplus.ngoFeedback && (
                <Card className="border-green-500/20 bg-green-50 dark:bg-green-950/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-green-600" />
                        Impact & Utilization Feedback
                      </CardTitle>
                      {getRatingStars(trackingData.surplus.ngoFeedback.rating)}
                    </div>
                    <CardDescription>See how your donation made a difference</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                        {trackingData.surplus.ngoFeedback.title}
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {trackingData.surplus.ngoFeedback.message}
                      </p>
                    </div>
                    {trackingData.surplus.ngoFeedback.impact && (
                      <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-green-200 dark:border-green-900">
                        <div className="flex items-start gap-2">
                          <ThumbsUp className="w-5 h-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-900 dark:text-green-100 mb-1">Impact Achieved:</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {trackingData.surplus.ngoFeedback.impact}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Feedback submitted {formatDate(trackingData.surplus.ngoFeedback.submittedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-primary" />
                    <div>
                      <p className="font-medium">Verified & Tracked Donation</p>
                      <p className="text-sm text-muted-foreground">
                        This donation is tracked in our system for complete transparency and accountability
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TrackDonation;