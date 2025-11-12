import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Package, Clock, Filter, Loader2, AlertCircle, X, Navigation } from "lucide-react";
import { getAvailableSurplus, claimSurplus, Surplus, getUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { loadGoogleMapsScript } from "@/lib/googleMaps";

const AvailableSurplus = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Surplus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [claiming, setClaiming] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Surplus | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    fetchSurplus();
  }, []);

  const fetchSurplus = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (categoryFilter && categoryFilter !== "all") filters.category = categoryFilter;
      if (searchFilter) filters.search = searchFilter;

      const response = await getAvailableSurplus(filters);

      if (response.success && response.data) {
        setItems(response.data);
      } else {
        setError(response.message || "Failed to fetch surplus items");
      }
    } catch (err: any) {
      console.error('Fetch surplus error:', err);
      setError(err.message || "An error occurred while fetching surplus");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchSurplus();
  };

  const handleViewLocation = async (item: Surplus) => {
    setSelectedItem(item);
    setShowMapModal(true);
    setMapLoading(true);
    setRouteInfo(null);

    try {
      const user = getUser();
      if (!user || !user.location) {
        toast({
          title: "Error",
          description: "Please update your NGO profile with a location to see the route",
          variant: "destructive",
        });
        setMapLoading(false);
        return;
      }

      await loadGoogleMapsScript();

      setTimeout(async () => {
        if (!mapRef.current) {
          setMapLoading(false);
          return;
        }

        const donorAddress = item.location.address;
        const ngoAddress = user.location;

        // Check if addresses are the same
        if (donorAddress.trim().toLowerCase() === ngoAddress.trim().toLowerCase()) {
          setRouteInfo({
            distance: "0 m (Same Location)",
            duration: "0 mins",
          });
          setMapLoading(false);

          // Show single marker
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ address: donorAddress }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              const location = results[0].geometry.location;
              const map = new google.maps.Map(mapRef.current!, {
                zoom: 15,
                center: location,
                mapTypeControl: false,
                streetViewControl: false,
              });

              new google.maps.Marker({
                position: location,
                map: map,
                title: "Pickup & Delivery Location (Same)",
              });

              googleMapRef.current = map;
            }
          });
          return;
        }

        // Initialize map
        const map = new google.maps.Map(mapRef.current, {
          zoom: 12,
          center: { lat: 17.385044, lng: 78.486671 },
          mapTypeControl: false,
          streetViewControl: false,
        });

        googleMapRef.current = map;

        // Initialize directions renderer
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: "#10b981",
            strokeWeight: 5,
          },
        });

        directionsRendererRef.current = directionsRenderer;

        // Get directions
        const directionsService = new google.maps.DirectionsService();

        const request: google.maps.DirectionsRequest = {
          origin: donorAddress,
          destination: ngoAddress,
          travelMode: google.maps.TravelMode.DRIVING,
        };

        console.log('Calculating route from donor:', donorAddress, 'to NGO:', ngoAddress);

        directionsService.route(request, (result, status) => {
          console.log('Directions API status:', status);

          if (status === google.maps.DirectionsStatus.OK && result) {
            directionsRenderer.setDirections(result);

            const route = result.routes[0];
            const leg = route.legs[0];

            setRouteInfo({
              distance: leg.distance?.text || "N/A",
              duration: leg.duration?.text || "N/A",
            });

            toast({
              title: "Route Calculated",
              description: `Distance: ${leg.distance?.text}, Duration: ${leg.duration?.text}`,
            });
          } else {
            let errorMessage = "Could not calculate route. ";

            switch (status) {
              case google.maps.DirectionsStatus.NOT_FOUND:
                errorMessage += "One or both locations could not be found.";
                break;
              case google.maps.DirectionsStatus.ZERO_RESULTS:
                errorMessage += "No route could be found between these locations.";
                break;
              case google.maps.DirectionsStatus.INVALID_REQUEST:
                errorMessage += "Invalid route request.";
                break;
              default:
                errorMessage += `Error: ${status}`;
            }

            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
          }
          setMapLoading(false);
        });
      }, 300);
    } catch (error) {
      console.error("Map error:", error);
      toast({
        title: "Error",
        description: "Failed to load map: " + (error as Error).message,
        variant: "destructive",
      });
      setMapLoading(false);
    }
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    setSelectedItem(null);
    setRouteInfo(null);
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
      directionsRendererRef.current = null;
    }
    googleMapRef.current = null;
  };

  const handleClaim = async (item: Surplus) => {
    try {
      setClaiming(item._id);

      // Get the current user's location from their profile
      const user = getUser();
      
      if (!user || !user.location) {
        toast({
          title: "Error",
          description: "Please update your NGO profile with a delivery address before claiming items",
          variant: "destructive",
        });
        setClaiming(null);
        return;
      }

      // Use the NGO's registered location as delivery location
      const deliveryLocation = {
        address: user.location
      };

      const response = await claimSurplus(item._id, deliveryLocation);

      if (response.success) {
        toast({
          title: "Success!",
          description: "Surplus item claimed successfully. Your delivery address: " + user.location,
        });

        // Refresh the list
        fetchSurplus();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to claim surplus",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('Claim surplus error:', err);
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setClaiming(null);
    }
  };

  const getDonorName = (donor: any) => {
    if (donor && typeof donor === 'object' && 'name' in donor) {
      return donor.name;
    }
    return 'Unknown Donor';
  };

  const getDonorLocation = (donor: any) => {
    if (donor && typeof donor === 'object' && 'location' in donor) {
      return donor.location;
    }
    return 'Location not available';
  };

  const formatExpiry = (expiryDate?: string) => {
    if (!expiryDate) return "N/A";
    
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return "Expired";
    return `${diffDays} days`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading available surplus...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Available Surplus</h2>
        <p className="text-muted-foreground">Browse real-time donations available for your organization</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
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
            <Input 
              placeholder="Search items..." 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
            />
            <Button onClick={handleApplyFilters}>Apply Filters</Button>
          </div>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No surplus items available at the moment</p>
            <p className="text-sm mt-2">Check back later or adjust your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {items.map((item) => (
            <Card key={item._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground">By {getDonorName(item.donorId)}</p>
                      </div>
                      <Badge>{item.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span>{item.quantity} {item.unit}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="flex-1">{item.location.address}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewLocation(item)}
                          className="h-6 px-2 text-xs"
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          View on Map
                        </Button>
                      </div>
                      {item.expiryDate && (
                        <div className="flex items-center gap-2 text-sm text-warning">
                          <Clock className="w-4 h-4" />
                          <span>Expires: {formatExpiry(item.expiryDate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:min-w-[120px]">
                    <Button 
                      className="w-full" 
                      onClick={() => handleClaim(item)}
                      disabled={claiming === item._id}
                    >
                      {claiming === item._id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Claiming...
                        </>
                      ) : (
                        "Request"
                      )}
                    </Button>
                    <Button variant="outline" className="w-full">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Map Modal */}
      <Dialog open={showMapModal} onOpenChange={(open) => !open && closeMapModal()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Location & Route Details</DialogTitle>
                <DialogDescription>
                  Route from donor location to your NGO headquarters
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeMapModal}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-4">
              {/* Item Info */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold">{selectedItem.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedItem.quantity} {selectedItem.unit} • {selectedItem.category}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Summary */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Pickup Location (Donor)</p>
                        <p className="text-sm text-muted-foreground">
                          {getDonorName(selectedItem.donorId)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedItem.location.address}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-500 mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Delivery Location (Your NGO)</p>
                        <p className="text-sm text-muted-foreground">
                          {getUser()?.name || 'Your Organization'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {getUser()?.location || 'Location not set'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Route Info */}
              {routeInfo && (
                <div className="flex gap-4 justify-center flex-wrap">
                  <Badge variant="secondary" className="text-base py-2 px-4">
                    📏 Distance: {routeInfo.distance}
                  </Badge>
                  <Badge variant="secondary" className="text-base py-2 px-4">
                    ⏱️ Duration: {routeInfo.duration}
                  </Badge>
                </div>
              )}

              {/* Warning for same addresses */}
              {selectedItem.location.address.trim().toLowerCase() === 
               getUser()?.location?.trim().toLowerCase() && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>⚠️ Same Location:</strong> The donor and your NGO have the same address. Please verify the locations are correct.
                  </AlertDescription>
                </Alert>
              )}

              {/* Map Container */}
              <div className="relative">
                <div
                  ref={mapRef}
                  className="w-full h-[450px] rounded-lg border border-border"
                >
                  {mapLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg z-10">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Calculating route...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvailableSurplus;
