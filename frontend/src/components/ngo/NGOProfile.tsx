import { useState, useEffect, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, MapPin, Navigation } from "lucide-react";
import { getCurrentProfile, updateProfile, UpdateProfileData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { loadGoogleMapsScript } from "@/lib/googleMaps";
import { AnimatePresence } from "framer-motion";
import SuccessAnimation from "@/components/ui/SuccessAnimation";

const NGOProfile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    ngoRegistrationId: "",
    role: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    // Check if location is empty and prompt user
    if (!loading && !formData.location) {
      setShowLocationPrompt(true);
    }
  }, [loading, formData.location]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCurrentProfile();

      if (response.success && response.data) {
        const user = (response.data as any).user ?? response.data;
        setFormData({
          name: user.name || "",
          email: user.email || "",
          location: user.location || "",
          ngoRegistrationId: user.ngoRegistrationId || "",
          role: user.role || "",
        });
      } else {
        setError(response.message || "Failed to fetch profile");
      }
    } catch (err: any) {
      console.error('Fetch profile error:', err);
      setError(err.message || "An error occurred while fetching profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const updateData: UpdateProfileData = {
        name: formData.name,
        location: formData.location,
      };

      const response = await updateProfile(updateData);

      if (response.success) {
        setSuccess(true);
        toast({
          title: "Success!",
          description: "Profile updated successfully",
        });

        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.message || "An error occurred while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
      });
      return;
    }

    setLocationLoading(true);
    setError(null);

    try {
      // Get user's current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;

      // Load Google Maps and reverse geocode
      await loadGoogleMapsScript();

      const geocoder = new window.google.maps.Geocoder();
      const result = await geocoder.geocode({
        location: { lat: latitude, lng: longitude },
      });

      if (result.results && result.results[0]) {
        const address = result.results[0].formatted_address;
        setFormData({ ...formData, location: address });
        setShowLocationPrompt(false);
        
        // Show success animation
        setShowSuccessAnimation(true);
        setTimeout(() => {
          setShowSuccessAnimation(false);
        }, 1500);

        toast({
          title: "Success!",
          description: "Location detected. Please save your profile.",
        });
      } else {
        throw new Error("Could not determine address from location");
      }
    } catch (err: any) {
      console.error("Location error:", err);
      let errorMessage = "Failed to get current location";
      
      if (err.code === 1) {
        errorMessage = "Location access denied. Please enable location permissions.";
      } else if (err.code === 2) {
        errorMessage = "Location unavailable. Please try again.";
      } else if (err.code === 3) {
        errorMessage = "Location request timed out. Please try again.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <AnimatePresence>
        {showSuccessAnimation && (
          <SuccessAnimation
            title="Success!"
            description="Current location detected"
          />
        )}
      </AnimatePresence>

      <div>
        <h2 className="text-3xl font-bold mb-2">Organization Profile</h2>
        <p className="text-muted-foreground">Manage your organization details</p>
      </div>

      {showLocationPrompt && (
        <Alert>
          <Navigation className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>📍 Help logistics partners find you easily - Set your service address</span>
            <Button 
              size="sm" 
              onClick={handleUseCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Detecting...
                </>
              ) : (
                <>
                  <MapPin className="w-3 h-3 mr-1" />
                  Use Current Location
                </>
              )}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Profile updated successfully!</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
          <CardDescription>Update your NGO details and service area</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="org-name">Organization Name</Label>
              <Input 
                id="org-name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={saving}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration">Registration Number</Label>
              <Input 
                id="registration" 
                value={formData.ngoRegistrationId}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Registration ID cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Service Address (Headquarters)</Label>
              <div className="flex gap-2">
                <Input 
                  id="address" 
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="NGO Headquarters, City, State"
                  disabled={saving || locationLoading}
                  required
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUseCurrentLocation}
                  disabled={saving || locationLoading}
                  className="shrink-0"
                >
                  {locationLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Detect Location</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This helps logistics partners calculate accurate delivery routes
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <div>
              <p className="font-medium">Account Role</p>
              <p className="text-sm text-muted-foreground capitalize">{formData.role}</p>
            </div>
          </div>
          <div className="flex justify-between items-center py-3 border-b">
            <div>
              <p className="font-medium">Registration Status</p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Verified ✓
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NGOProfile;
