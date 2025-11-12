import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loadGoogleMapsScript, isGoogleMapsLoaded, createMap, getDirections } from "@/lib/googleMaps";

const RouteMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const waypoints = [
    { name: "Green Grocery Store", address: "123 Main St", type: "pickup", time: "10:30 AM" },
    { name: "Hope Foundation", address: "456 Community Ave", type: "delivery", time: "11:15 AM" },
    { name: "Fashion Outlet", address: "789 Fashion St", type: "pickup", time: "12:00 PM" },
    { name: "Care Center", address: "321 Support Rd", type: "delivery", time: "12:45 PM" }
  ];

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        setLoading(true);
        setError(null);

        await loadGoogleMapsScript();

        if (!isMounted || !mapRef.current) return;

        // Create map instance
        const mapInstance = createMap(mapRef.current, {
          center: { lat: 19.0760, lng: 72.8777 },
          zoom: 12,
          mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        mapInstanceRef.current = mapInstance;

        // Create directions renderer
        const renderer = new window.google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#0b66d0',
            strokeWeight: 5,
            strokeOpacity: 0.8,
          },
        });

        directionsRendererRef.current = renderer;

        // Calculate and display route
        if (waypoints.length >= 2) {
          await calculateRoute(waypoints, renderer);
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Map initialization error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load map. Please check your API key configuration.');
          setLoading(false);
        }
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      isMounted = false;
      
      // Properly clean up Google Maps instances
      if (directionsRendererRef.current) {
        try {
          directionsRendererRef.current.setMap(null);
          directionsRendererRef.current = null;
        } catch (e) {
          console.error('Error cleaning up directions renderer:', e);
        }
      }

      if (mapInstanceRef.current) {
        try {
          // Clear map reference but don't try to remove DOM elements
          mapInstanceRef.current = null;
        } catch (e) {
          console.error('Error cleaning up map:', e);
        }
      }
    };
  }, []); // Empty dependency array - only run once

  const calculateRoute = async (points: typeof waypoints, renderer: any) => {
    if (points.length < 2) return;

    try {
      const origin = points[0].address;
      const destination = points[points.length - 1].address;

      const result = await getDirections(origin, destination, 'DRIVING');
      
      if (result && renderer) {
        renderer.setDirections(result);
      }
    } catch (err) {
      console.error('Route calculation error:', err);
    }
  };

  const openInGoogleMaps = () => {
    if (waypoints.length === 0) return;
    const origin = encodeURIComponent(waypoints[0].address);
    const destination = encodeURIComponent(waypoints[waypoints.length - 1].address);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Route Map</h2>
        <p className="text-muted-foreground">View your delivery routes and navigation</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Delivery Route</CardTitle>
          <CardDescription>Your optimized delivery path for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2">Loading map...</span>
              </div>
            )}
            {/* Keep the map div mounted to prevent removeChild errors */}
            <div 
              ref={mapRef} 
              className="w-full h-full"
              style={{ visibility: loading ? 'hidden' : 'visible' }}
            />
          </div>
          {!loading && !error && (
            <div className="mt-4 flex justify-end">
              <Button onClick={openInGoogleMaps} variant="outline">
                <Navigation className="w-4 h-4 mr-2" />
                Open in Google Maps
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Route Waypoints</CardTitle>
          <CardDescription>Stops on your delivery route</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {waypoints.map((waypoint, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    waypoint.type === "pickup" ? "bg-primary" : "bg-success"
                  }`}>
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  {index < waypoints.length - 1 && (
                    <div className="absolute left-1/2 top-10 w-0.5 h-8 -ml-px bg-border" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h4 className="font-semibold">{waypoint.name}</h4>
                      <p className="text-sm text-muted-foreground">{waypoint.address}</p>
                    </div>
                    <span className="text-sm font-medium text-primary">{waypoint.time}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    waypoint.type === "pickup" 
                      ? "bg-primary/10 text-primary" 
                      : "bg-success/10 text-success"
                  }`}>
                    {waypoint.type === "pickup" ? "Pickup" : "Delivery"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Navigation className="w-8 h-8 text-primary" />
            <div>
              <p className="font-medium">AI-Optimized Route</p>
              <p className="text-sm text-muted-foreground">
                This route is optimized to minimize distance and time based on traffic patterns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteMap;
