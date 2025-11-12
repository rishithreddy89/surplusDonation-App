import { useState, useEffect, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { getCurrentProfile, updateProfile, UpdateProfileData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const LogisticsProfile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    vehicleType: "",
    role: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCurrentProfile();

      if (response.success && response.data?.user) {
        const user = response.data.user;
        setFormData({
          name: user.name || "",
          email: user.email || "",
          location: user.location || "",
          vehicleType: user.vehicleType || "",
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
      <div>
        <h2 className="text-3xl font-bold mb-2">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your delivery partner details</p>
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
          <AlertDescription>Profile updated successfully!</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={saving}
                required
              />
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
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State"
                disabled={saving}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b">
            <div>
              <p className="font-medium">Vehicle Type</p>
              <p className="text-sm text-muted-foreground capitalize">{formData.vehicleType || 'Not specified'}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Vehicle type cannot be changed. Contact support to update.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Availability Schedule (Coming Soon)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Weekdays</p>
              <p className="text-sm text-muted-foreground">9:00 AM - 6:00 PM</p>
            </div>
            <Button variant="outline" size="sm" disabled>Edit</Button>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Weekends</p>
              <p className="text-sm text-muted-foreground">10:00 AM - 4:00 PM</p>
            </div>
            <Button variant="outline" size="sm" disabled>Edit</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogisticsProfile;
