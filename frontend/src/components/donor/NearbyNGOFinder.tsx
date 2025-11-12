import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Navigation, Phone, Search, X, Route } from "lucide-react";
import { loadGoogleMapsScript } from "@/lib/googleMaps";
import { useToast } from "@/hooks/use-toast";

interface NGODetails {
  placeId: string;
  name: string;
  address: string;
  distance: number;
  phone?: string;
  rating?: number;
  location: {
    lat: number;
    lng: number;
  };
  types?: string[];
  openNow?: boolean;
}

const NearbyNGOFinder = () => {
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyNGOs, setNearbyNGOs] = useState<NGODetails[]>([]);
  const [selectedNGO, setSelectedNGO] = useState<NGODetails | null>(null);
  const [searchRadius, setSearchRadius] = useState(5000); // 5km default
  const [showRoute, setShowRoute] = useState(false);

  // Initialize map
  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    setLoading(true);
    try {
      await loadGoogleMapsScript();
      
      if (!mapRef.current) return;

      // Create map centered on default location (will update with user location)
      const map = new google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: 17.385044, lng: 78.486671 }, // Default: Hyderabad
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      googleMapRef.current = map;

      // Initialize directions renderer
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#4F46E5",
          strokeWeight: 5,
        },
      });

      // Initialize info window
      infoWindowRef.current = new google.maps.InfoWindow();

      // Get user location automatically
      getUserLocation();
    } catch (error) {
      console.error("Map initialization error:", error);
      toast({
        title: "Error",
        description: "Failed to initialize map",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);

        // Update map center
        if (googleMapRef.current) {
          googleMapRef.current.setCenter(location);
          
          // Add user location marker
          if (userMarkerRef.current) {
            userMarkerRef.current.setMap(null);
          }
          
          userMarkerRef.current = new google.maps.Marker({
            position: location,
            map: googleMapRef.current,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#4F46E5",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            },
            title: "Your Location",
            zIndex: 1000,
          });
        }

        // Automatically search for nearby NGOs
        searchNearbyNGOs(location);
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Failed to get your location";
        
        if (error.code === 1) {
          errorMessage = "Location access denied. Please enable location permissions.";
        } else if (error.code === 2) {
          errorMessage = "Location unavailable. Please try again.";
        } else if (error.code === 3) {
          errorMessage = "Location request timed out.";
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setLoading(false);
      }
    );
  };

  const searchNearbyNGOs = async (location: { lat: number; lng: number }) => {
    setSearching(true);
    setSelectedNGO(null);
    setShowRoute(false);

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Clear existing route
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }

    try {
      if (!googleMapRef.current) return;

      const service = new google.maps.places.PlacesService(googleMapRef.current);

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: searchRadius,
        keyword: "NGO charity nonprofit organization foundation",
        type: "point_of_interest",
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const ngos: NGODetails[] = results.map(place => {
            const ngoLocation = {
              lat: place.geometry?.location?.lat() || 0,
              lng: place.geometry?.location?.lng() || 0,
            };

            // Calculate distance
            const distance = calculateDistance(location, ngoLocation);

            return {
              placeId: place.place_id || "",
              name: place.name || "Unknown NGO",
              address: place.vicinity || "Address not available",
              distance: distance,
              phone: place.formatted_phone_number,
              rating: place.rating,
              location: ngoLocation,
              types: place.types,
              openNow: place.opening_hours?.open_now,
            };
          }).sort((a, b) => a.distance - b.distance); // Sort by distance

          setNearbyNGOs(ngos);

          // Add markers for NGOs
          ngos.forEach((ngo, index) => {
            if (!googleMapRef.current) return;

            const marker = new google.maps.Marker({
              position: ngo.location,
              map: googleMapRef.current,
              title: ngo.name,
              icon: {
                url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                scaledSize: new google.maps.Size(40, 40),
              },
              animation: google.maps.Animation.DROP,
              zIndex: index,
            });

            // Create info window with photo on hover
            const hoverInfoWindow = new google.maps.InfoWindow();

            // Add hover listeners
            marker.addListener("mouseover", () => {
              // Fetch place photo
              if (!googleMapRef.current) return;
              const service = new google.maps.places.PlacesService(googleMapRef.current);
              
              service.getDetails(
                {
                  placeId: ngo.placeId,
                  fields: ["photos", "name", "rating"],
                },
                (place, status) => {
                  if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                    let photoUrl = "https://via.placeholder.com/200x150?text=No+Image";
                    
                    if (place.photos && place.photos.length > 0) {
                      photoUrl = place.photos[0].getUrl({ maxWidth: 200, maxHeight: 150 });
                    }

                    const hoverContent = `
                      <div style="padding: 8px; max-width: 220px;">
                        <img src="${photoUrl}" alt="${ngo.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
                        <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px; color: #1f2937;">${ngo.name}</h3>
                        ${place.rating ? `<p style="font-size: 12px; color: #fbbf24; margin: 0;">⭐ ${place.rating}/5</p>` : ''}
                      </div>
                    `;
                    hoverInfoWindow.setContent(hoverContent);
                    hoverInfoWindow.open(googleMapRef.current, marker);
                  }
                }
              );
            });

            marker.addListener("mouseout", () => {
              hoverInfoWindow.close();
            });

            // Add click listener to marker
            marker.addListener("click", () => {
              hoverInfoWindow.close();
              handleNGOSelect(ngo, marker);
            });

            markersRef.current.push(marker);
          });

          toast({
            title: "Success",
            description: `Found ${ngos.length} NGOs nearby`,
          });
        } else {
          toast({
            title: "No Results",
            description: "No NGOs found in this area. Try increasing the search radius.",
          });
        }
        setSearching(false);
      });
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Error",
        description: "Failed to search for NGOs",
        variant: "destructive",
      });
      setSearching(false);
    }
  };

  const handleNGOSelect = async (ngo: NGODetails, marker?: google.maps.Marker) => {
    setSelectedNGO(ngo);

    // Highlight selected marker
    if (marker) {
      marker.setIcon({
        url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
        scaledSize: new google.maps.Size(50, 50),
      });
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => marker.setAnimation(null), 2000);

      // Reset other markers
      markersRef.current.forEach(m => {
        if (m !== marker) {
          m.setIcon({
            url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new google.maps.Size(40, 40),
          });
        }
      });
    }

    // Show info window with photo
    if (infoWindowRef.current && marker && googleMapRef.current) {
      const service = new google.maps.places.PlacesService(googleMapRef.current);
      
      service.getDetails(
        {
          placeId: ngo.placeId,
          fields: ["photos"],
        },
        (place, status) => {
          let photoUrl = "https://via.placeholder.com/250x150?text=No+Image";
          
          if (status === google.maps.places.PlacesServiceStatus.OK && place && place.photos && place.photos.length > 0) {
            photoUrl = place.photos[0].getUrl({ maxWidth: 250, maxHeight: 150 });
          }

          const content = `
            <div style="padding: 10px; max-width: 270px;">
              <img src="${photoUrl}" alt="${ngo.name}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;" />
              <h3 style="font-weight: bold; margin-bottom: 5px; color: #1f2937;">${ngo.name}</h3>
              <p style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">${ngo.address}</p>
              <p style="font-size: 12px; color: #4f46e5; font-weight: 600;">📍 ${ngo.distance.toFixed(2)} km away</p>
              ${ngo.phone ? `<p style="font-size: 12px; color: #6b7280; margin-top: 5px;">📞 ${ngo.phone}</p>` : ''}
              ${ngo.rating ? `<p style="font-size: 12px; color: #fbbf24; margin-top: 5px;">⭐ ${ngo.rating}/5</p>` : ''}
            </div>
          `;
          infoWindowRef.current!.setContent(content);
          infoWindowRef.current!.open(googleMapRef.current, marker);
        }
      );
    }

    // Pan to NGO location
    if (googleMapRef.current) {
      googleMapRef.current.panTo(ngo.location);
      googleMapRef.current.setZoom(15);
    }

    // Get additional details from Places API
    getPlaceDetails(ngo.placeId);
  };

  const getPlaceDetails = async (placeId: string) => {
    if (!googleMapRef.current) return;

    const service = new google.maps.places.PlacesService(googleMapRef.current);
    
    service.getDetails(
      {
        placeId: placeId,
        fields: ["formatted_phone_number", "website", "opening_hours", "rating", "reviews"],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          setSelectedNGO(prev => prev ? {
            ...prev,
            phone: place.formatted_phone_number || prev.phone,
            rating: place.rating || prev.rating,
          } : null);
        }
      }
    );
  };

  const showRouteToNGO = () => {
    if (!userLocation || !selectedNGO || !googleMapRef.current) return;

    setShowRoute(true);

    const directionsService = new google.maps.DirectionsService();

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: googleMapRef.current,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#4F46E5",
          strokeWeight: 5,
        },
      });
    }

    directionsRendererRef.current.setMap(googleMapRef.current);

    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(userLocation.lat, userLocation.lng),
      destination: new google.maps.LatLng(selectedNGO.location.lat, selectedNGO.location.lng),
      travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        directionsRendererRef.current?.setDirections(result);

        // Show route info
        const route = result.routes[0];
        const leg = route.legs[0];

        toast({
          title: "Route Found",
          description: `Distance: ${leg.distance?.text}, Duration: ${leg.duration?.text}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Could not calculate route",
          variant: "destructive",
        });
      }
    });
  };

  const clearRoute = () => {
    if (directionsRendererRef.current) {
      directionsRendererRef.current.setMap(null);
    }
    setShowRoute(false);
  };

  const calculateDistance = (
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(point2.lat - point1.lat);
    const dLng = toRad(point2.lng - point1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(point1.lat)) *
        Math.cos(toRad(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };

  const handleRadiusChange = () => {
    if (userLocation) {
      searchNearbyNGOs(userLocation);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Nearby NGO Finder
          </CardTitle>
          <CardDescription>Find and connect with NGOs in your area</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Controls */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="number"
                value={searchRadius / 1000}
                onChange={(e) => setSearchRadius(parseInt(e.target.value) * 1000)}
                placeholder="Search radius (km)"
                min={1}
                max={50}
              />
            </div>
            <Button onClick={handleRadiusChange} disabled={searching || !userLocation}>
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </Button>
            <Button variant="outline" onClick={getUserLocation} disabled={loading}>
              <Navigation className="w-4 h-4" />
            </Button>
          </div>

          {/* Map Container */}
          <div className="relative">
            <div
              ref={mapRef}
              className="w-full h-[400px] rounded-lg border border-border"
            >
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
            </div>

            {/* NGO Count Badge */}
            {nearbyNGOs.length > 0 && (
              <Badge className="absolute top-4 right-4 bg-primary text-white">
                {nearbyNGOs.length} NGOs found
              </Badge>
            )}
          </div>

          {/* NGO List */}
          {nearbyNGOs.length > 0 && (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <h3 className="font-semibold text-sm">Nearby NGOs:</h3>
              {nearbyNGOs.map((ngo) => (
                <Card
                  key={ngo.placeId}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedNGO?.placeId === ngo.placeId
                      ? "ring-2 ring-primary bg-primary/5"
                      : ""
                  }`}
                  onClick={() => handleNGOSelect(ngo)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{ngo.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{ngo.address}</p>
                        {ngo.phone && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {ngo.phone}
                          </p>
                        )}
                        {ngo.rating && (
                          <p className="text-xs text-yellow-600 mt-1">
                            ⭐ {ngo.rating}/5
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <Badge variant="secondary" className="text-xs">
                          {ngo.distance.toFixed(2)} km
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Selected NGO Actions */}
          {selectedNGO && (
            <div className="flex gap-2">
              {!showRoute ? (
                <Button onClick={showRouteToNGO} className="flex-1">
                  <Route className="w-4 h-4 mr-2" />
                  Show Route
                </Button>
              ) : (
                <Button onClick={clearRoute} variant="outline" className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Clear Route
                </Button>
              )}
            </div>
          )}

          {/* Info Alert */}
          {!userLocation && !loading && (
            <Alert>
              <Navigation className="h-4 w-4" />
              <AlertDescription>
                Click the navigation icon to enable location access and find nearby NGOs
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NearbyNGOFinder;
