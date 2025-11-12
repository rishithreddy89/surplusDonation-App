import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Clock, CheckCircle, Truck, Loader2, AlertCircle, MapPin, User, Map as MapIcon } from "lucide-react";
import { getClaimedSurplus, confirmSurplusReceived, Surplus } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { loadGoogleMapsScript, createMap, createMarker, geocodeAddress, getDirections } from "@/lib/googleMaps";

const RequestTracking = () => {
  const { toast } = useToast();
  const [claimedItems, setClaimedItems] = useState<Surplus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingReceipt, setConfirmingReceipt] = useState<string | null>(null);
  const [selectedItemForMap, setSelectedItemForMap] = useState<Surplus | null>(null);
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoading, setMapLoading] = useState(false);

  useEffect(() => {
    fetchClaimedItems();
  }, []);

  const fetchClaimedItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getClaimedSurplus();

      if (response.success && response.data) {
        setClaimedItems(response.data);
      } else {
        setError(response.message || "Failed to fetch claimed items");
      }
    } catch (err: any) {
      console.error('Fetch claimed items error:', err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceived = async (surplusId: string) => {
    try {
      setConfirmingReceipt(surplusId);

      const response = await confirmSurplusReceived(surplusId);

      if (response.success) {
        toast({
          title: "Success!",
          description: "Receipt confirmed successfully. Donor has been notified.",
        });

        await fetchClaimedItems();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to confirm receipt",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to confirm receipt",
        variant: "destructive",
      });
    } finally {
      setConfirmingReceipt(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-success text-white";
      case "in-transit":
        return "bg-primary text-white";
      case "accepted":
        return "bg-blue-500 text-white";
      case "claimed":
        return "bg-warning text-black";
      default:
        return "bg-muted";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return CheckCircle;
      case "in-transit":
        return Truck;
      case "accepted":
      case "claimed":
        return Clock;
      default:
        return Package;
    }
  };

  const getDonorName = (donor: any) => {
    if (donor && typeof donor === 'object' && 'name' in donor) {
      return donor.name;
    }
    return 'Unknown Donor';
  };

  const getLogisticsName = (logistics: any) => {
    if (logistics && typeof logistics === 'object' && 'name' in logistics) {
      return logistics.name;
    }
    return null;
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

  const showItemOnMap = async (item: Surplus) => {
    setSelectedItemForMap(item);
    setShowMap(true);
    setMapLoading(true);

    try {
      await loadGoogleMapsScript();

      if (!mapRef.current) return;

      const pickupAddress = item.location?.address || "Mumbai, India";
      const pickupLocation = await geocodeAddress(pickupAddress);

      if (!pickupLocation) {
        setMapLoading(false);
        return;
      }

      const mapInstance = createMap(mapRef.current, {
        center: { lat: pickupLocation.lat(), lng: pickupLocation.lng() },
        zoom: 13,
        mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
      });

      // Pickup marker
      createMarker({
        position: pickupLocation,
        map: mapInstance,
        title: 'Pickup Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#0b66d0',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });

      setMapLoading(false);
    } catch (err) {
      console.error('Map error:', err);
      setMapLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading claimed items...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Track Claimed Items</h2>
        <p className="text-muted-foreground">Monitor the status of surplus items you've claimed</p>
      </div>

      {/* Summary Stats - Moved to Top */}
      {!loading && claimedItems.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{claimedItems.length}</div>
                  <p className="text-xs text-muted-foreground">Total Claimed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-full">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-success">
                    {claimedItems.filter(i => i.status === 'delivered').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {claimedItems.filter(i => i.status === 'in-transit').length}
                  </div>
                  <p className="text-xs text-muted-foreground">In Transit</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-warning/10 rounded-full">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-warning">
                    {claimedItems.filter(i => i.status === 'claimed' || i.status === 'accepted').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {claimedItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No claimed items found</p>
            <p className="text-sm mt-2">Browse available surplus to claim items!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {claimedItems.map((item) => {
            const StatusIcon = getStatusIcon(item.status);
            const canConfirmReceipt = item.status === 'in-transit' || item.status === 'delivered';

            return (
              <Card key={item._id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <StatusIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center gap-1">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span>{item.quantity} {item.unit}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="capitalize">{item.category}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(item.status)} text-sm px-4 py-1.5`}>
                        {item.status === 'accepted' ? 'Awaiting Pickup' : item.status.replace('-', ' ')}
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          <User className="w-4 h-4 text-primary" />
                          Donor Information
                        </div>
                        <div className="text-sm space-y-1">
                          <p className="font-medium">{getDonorName(item.donorId)}</p>
                          <p className="text-muted-foreground">{item.location.address}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium mb-2">
                          <Truck className="w-4 h-4 text-success" />
                          Delivery Status
                        </div>
                        <div className="text-sm space-y-1">
                          {getLogisticsName(item.logisticsPartnerId) ? (
                            <>
                              <p className="font-medium">{getLogisticsName(item.logisticsPartnerId)}</p>
                              <p className="text-muted-foreground">Logistics Partner Assigned</p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">Waiting for logistics assignment</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2 text-sm font-medium mb-3">
                        <Clock className="w-4 h-4 text-primary" />
                        Delivery Progress
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.status !== 'available' ? 'bg-success' : 'bg-muted'}`} />
                          <span className="text-sm">Item Claimed</span>
                          {item.status !== 'available' && <CheckCircle className="w-4 h-4 text-success ml-auto" />}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.status === 'accepted' || item.status === 'in-transit' || item.status === 'delivered' ? 'bg-success' : 'bg-muted'}`} />
                          <span className="text-sm">Donor Accepted</span>
                          {(item.status === 'accepted' || item.status === 'in-transit' || item.status === 'delivered') && (
                            <CheckCircle className="w-4 h-4 text-success ml-auto" />
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.status === 'in-transit' || item.status === 'delivered' ? 'bg-success' : 'bg-muted'}`} />
                          <span className="text-sm">In Transit</span>
                          {(item.status === 'in-transit' || item.status === 'delivered') && (
                            <CheckCircle className="w-4 h-4 text-success ml-auto" />
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.status === 'delivered' ? 'bg-success' : 'bg-muted'}`} />
                          <span className="text-sm">Delivered</span>
                          {item.status === 'delivered' && <CheckCircle className="w-4 h-4 text-success ml-auto" />}
                        </div>
                      </div>
                    </div>

                    {/* Timeline Info */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-t pt-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Claimed: {formatDate(item.createdAt)}</span>
                      </div>
                      {item.updatedAt !== item.createdAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Last Updated: {formatDate(item.updatedAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      <Button
                        onClick={() => showItemOnMap(item)}
                        variant="outline"
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <MapIcon className="w-4 h-4 mr-1.5" />
                        View Map
                      </Button>
                      {canConfirmReceipt && item.status !== 'delivered' && (
                        <Button
                          onClick={() => handleConfirmReceived(item._id)}
                          disabled={confirmingReceipt === item._id}
                          size="sm"
                          className="flex-shrink-0 bg-success hover:bg-success/90"
                        >
                          {confirmingReceipt === item._id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                              Confirming...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1.5" />
                              Confirm Received
                            </>
                          )}
                        </Button>
                      )}
                    </div>

                    {item.status === 'delivered' && (
                      <Alert className="bg-success/10 border-success/20">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <AlertDescription className="text-success">
                          Item successfully received and confirmed!
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Map Modal */}
      {showMap && selectedItemForMap && (
        <Card className="fixed inset-4 z-50 overflow-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Delivery Location</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{selectedItemForMap.title}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowMap(false)}>
              ✕
            </Button>
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
            <div className="mt-4">
              <p className="text-sm font-medium">Pickup Address:</p>
              <p className="text-sm text-muted-foreground">{selectedItemForMap.location?.address || 'Address not available'}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RequestTracking;
