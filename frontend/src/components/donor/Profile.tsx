import { useState, useEffect, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { getCurrentProfile, updateProfile, UpdateProfileData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    donorType: "",
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
          donorType: user.donorType || "",
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

      if (formData.role === 'donor' && formData.donorType) {
        updateData.donorType = formData.donorType;
      }

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
        <p className="text-muted-foreground">Manage your account information and preferences</p>
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
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {formData.name.charAt(0).toUpperCase() || <User className="w-12 h-12" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button type="button" variant="outline" disabled>
                  Change Photo (Coming Soon)
                </Button>
              </div>
            </div>

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
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State"
                disabled={saving}
                required
              />
            </div>

            {formData.role === 'donor' && (
              <div className="space-y-2">
                <Label htmlFor="donor-type">Donor Type</Label>
                <Select 
                  value={formData.donorType}
                  onValueChange={(value) => setFormData({ ...formData, donorType: value })}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select donor type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="grocery">Grocery Store</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

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
              <p className="font-medium">Email Verification</p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Verified ✓
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Manage how you receive updates (Coming Soon)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Pickup Notifications</p>
              <p className="text-sm text-muted-foreground">Get notified when items are picked up</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Enabled
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delivery Updates</p>
              <p className="text-sm text-muted-foreground">Track delivery status in real-time</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Enabled
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Impact Reports</p>
              <p className="text-sm text-muted-foreground">Monthly summary of your contributions</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Enabled
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
