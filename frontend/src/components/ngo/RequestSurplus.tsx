import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Navigation, Loader2 } from "lucide-react";
import { createNGORequest, RequestData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import SuccessAnimation from "@/components/ui/SuccessAnimation";
import { loadGoogleMapsScript } from "@/lib/googleMaps";

const RequestSurplus = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    quantity: "",
    unit: "",
    urgency: "",
    address: "",
    neededBy: "",
  });

  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    
    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        toast({
          title: "Error",
          description: "Geolocation is not supported by your browser",
          variant: "destructive",
        });
        setLocationLoading(false);
        return;
      }

      // Get current position
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Load Google Maps script
            await loadGoogleMapsScript();

            // Use Google's Geocoding API to convert coordinates to address
            const googleObj = (window as any).google;
            if (!googleObj || !googleObj.maps) {
              throw new Error("Google Maps SDK is not available on window");
            }
            const geocoder = new googleObj.maps.Geocoder();
            const latlng = { lat: latitude, lng: longitude };

            geocoder.geocode({ location: latlng }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                const address = results[0].formatted_address;
                setFormData({ ...formData, address });
                
                toast({
                  title: "Location Detected",
                  description: "Your current location has been set as delivery address",
                });
              } else {
                toast({
                  title: "Error",
                  description: "Could not fetch address from your location",
                  variant: "destructive",
                });
              }
              setLocationLoading(false);
            });
          } catch (error) {
            console.error("Geocoding error:", error);
            toast({
              title: "Error",
              description: "Failed to convert location to address",
              variant: "destructive",
            });
            setLocationLoading(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Could not get your location";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          
          toast({
            title: "Location Error",
            description: errorMessage,
            variant: "destructive",
          });
          setLocationLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } catch (error) {
      console.error("Location error:", error);
      toast({
        title: "Error",
        description: "Failed to get current location",
        variant: "destructive",
      });
      setLocationLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!formData.title || !formData.description || !formData.category || 
          !formData.quantity || !formData.unit || !formData.urgency || !formData.address) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const requestData: RequestData = {
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        urgency: formData.urgency as any,
        location: {
          address: formData.address,
        },
      };

      if (formData.neededBy) {
        requestData.neededBy = formData.neededBy;
      }

      const response = await createNGORequest(requestData);

      if (response.success) {
        setSuccess(true);
        
        // Show success animation
        setShowSuccessAnimation(true);

        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          quantity: "",
          unit: "",
          urgency: "",
          address: "",
          neededBy: "",
        });

        setTimeout(() => {
          navigate("/dashboard/ngo/requests");
        }, 2000);
      } else {
        if (response.errors && response.errors.length > 0) {
          const errorMessages = response.errors.map((err: any) => err.msg || err.message).join(', ');
          setError(errorMessages);
        } else {
          setError(response.message || "Failed to create request");
        }
      }
    } catch (err: any) {
      console.error('Create request error:', err);
      setError(err.message || "An error occurred while creating the request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <AnimatePresence>
        {showSuccessAnimation && (
          <SuccessAnimation
            title="Request Created!"
            description="Your surplus request has been successfully submitted"
          />
        )}
      </AnimatePresence>
      
      <div>
        <h2 className="text-3xl font-bold mb-2">Request Surplus</h2>
        <p className="text-muted-foreground">Submit a request for items your organization needs</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Request created successfully! Redirecting...</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
          <CardDescription>Provide information about what you need</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="item-type">Item Title *</Label>
              <Input
                id="item-type"
                placeholder="e.g., Winter Blankets"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select 
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                  <SelectItem value="educational">Educational</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Needed *</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  placeholder="0" 
                  min="0"
                  step="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <Select 
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                    <SelectItem value="boxes">Boxes</SelectItem>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="liters">Liters</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level *</Label>
              <Select 
                value={formData.urgency}
                onValueChange={(value) => setFormData({ ...formData, urgency: value })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
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
              <Label htmlFor="delivery-location">Delivery Location *</Label>
              <div className="flex gap-2">
                <Input 
                  id="delivery-location" 
                  placeholder="Enter delivery address" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={loading || locationLoading}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleUseCurrentLocation}
                  disabled={loading || locationLoading}
                  title="Use current location"
                  className="shrink-0"
                >
                  {locationLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click the location icon to auto-detect your current address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="needed-by">Needed By Date</Label>
              <Input 
                id="needed-by" 
                type="date" 
                value={formData.neededBy}
                onChange={(e) => setFormData({ ...formData, neededBy: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose / Justification *</Label>
              <Textarea 
                id="purpose" 
                placeholder="Explain why you need these items and how they will be used..."
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestSurplus;
