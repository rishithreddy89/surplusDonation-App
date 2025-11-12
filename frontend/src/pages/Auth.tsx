import { useState, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertCircle, Shield, CheckCircle, MapPin, Loader2 } from "lucide-react";
import { 
  register as registerUser, 
  login as loginUser, 
  setAuthToken, 
  setUser, 
  RegisterData, 
  LoginData,
  startAadhaarVerification,
  confirmAadhaarVerification,
  getCurrentProfile
} from "@/lib/api";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { loadGoogleMapsScript } from "@/lib/googleMaps";
import SuccessAnimation from "@/components/ui/SuccessAnimation";

const Auth = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "Success!", description: "" });

  // Aadhaar verification states (for donors)
  const [showAadhaarVerification, setShowAadhaarVerification] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);

  // Form states
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    donorType: "",
    ngoRegistrationId: "",
    vehicleType: "",
  });

  const roleConfig = {
    donor: { title: "Donor", dashboard: "/dashboard/donor" },
    ngo: { title: "NGO / Recipient", dashboard: "/dashboard/ngo" },
    logistics: { title: "Logistics Partner", dashboard: "/dashboard/logistics" },
    admin: { title: "Admin", dashboard: "/dashboard/admin" }
  };

  const config = roleConfig[role as keyof typeof roleConfig];

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
        setSignupForm({ ...signupForm, location: address });
        
        // Show success animation for location
        setSuccessMessage({
          title: "Success!",
          description: "Current location detected"
        });
        setShowSuccessAnimation(true);
        
        setTimeout(() => {
          setShowSuccessAnimation(false);
        }, 1500);
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

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      console.log('Attempting login with:', { email: loginForm.email, role });
      const response = await loginUser(loginForm);
      console.log('Login response:', response);
      
      if (response.success && response.data) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
        setSuccess("Login successful! Redirecting...");
        
        // Show success animation
        setSuccessMessage({
          title: "Login Successful!",
          description: `Welcome back to ${config.title} Dashboard`
        });
        setShowSuccessAnimation(true);
        
        setTimeout(() => {
          navigate(config?.dashboard || "/");
        }, 2000);
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err: any) {
      console.error('Login error details:', err);
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const registerData: RegisterData = {
        name: signupForm.name,
        email: signupForm.email,
        password: signupForm.password,
        role: role as 'donor' | 'ngo' | 'logistics' | 'admin',
        location: signupForm.location,
      };

      // Add role-specific fields
      if (role === 'donor' && signupForm.donorType) {
        registerData.donorType = signupForm.donorType as any;
      } else if (role === 'ngo' && signupForm.ngoRegistrationId) {
        registerData.ngoRegistrationId = signupForm.ngoRegistrationId;
      } else if (role === 'logistics' && signupForm.vehicleType) {
        registerData.vehicleType = signupForm.vehicleType as any;
      }

      const response = await registerUser(registerData);
      
      if (response.success && response.data) {
        // For donors, show Aadhaar verification
        if (role === 'donor') {
          setTempToken(response.data.token);
          setAuthToken(response.data.token);
          setSuccess("Account details saved! Please verify your Aadhaar to complete registration and create your account.");
          setShowAadhaarVerification(true);
        } else {
          // For other roles, proceed directly
          setAuthToken(response.data.token);
          setUser(response.data.user);
          setSuccess("Registration successful! Redirecting...");
          
          setTimeout(() => {
            navigate(config?.dashboard || "/");
          }, 1000);
        }
      } else {
        // Handle validation errors
        if (response.errors && response.errors.length > 0) {
          const errorMessages = response.errors.map((err: any) => err.msg || err.message).join(', ');
          setError(errorMessages);
        } else {
          setError(response.message || "Registration failed");
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await startAadhaarVerification(aadhaarNumber);
      
      if (response.success) {
        setOtpSent(true);
        setMaskedPhone(response.data?.maskedPhone || "");
        
        // Show OTP in success message for demo
        const demoOtp = response.data?.demoOtp;
        if (demoOtp) {
          setSuccess(`OTP sent! Demo OTP: ${demoOtp} (valid for 5 minutes)`);
        } else {
          setSuccess(response.message || "OTP sent successfully!");
        }
      } else {
        setError(response.message || "Failed to send OTP");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await confirmAadhaarVerification(aadhaarNumber, otp);
      
      if (response.success) {
        setAadhaarVerified(true);
        setSuccess("Aadhaar verified! Your donor account has been created successfully. Redirecting to dashboard...");
        
        // Update token with new verified status and actual user data
        if (response.data?.token) {
          setAuthToken(response.data.token);
        }
        
        // Set user data from response
        if (response.data?.user) {
          setUser(response.data.user);
        }
        
        setTimeout(() => {
          navigate(config?.dashboard || "/");
        }, 2000);
      } else {
        setError(response.message || "Failed to verify OTP");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during OTP verification");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAadhaar = () => {
    if (tempToken) {
      setSuccess("You can verify your Aadhaar later from your profile. Note: Some features will be limited until verification.");
      setTimeout(() => {
        navigate(config?.dashboard || "/");
      }, 2000);
    }
  };

  if (!config) {
    navigate("/select-role");
    return null;
  }

  // Show Aadhaar verification screen for donors
  if (showAadhaarVerification && role === 'donor') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Verify Your Aadhaar</CardTitle>
              <CardDescription>
                {aadhaarVerified 
                  ? "Your Aadhaar has been verified successfully!" 
                  : "Complete your donor verification to ensure trust and transparency"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
                  {aadhaarVerified && <CheckCircle className="h-4 w-4" />}
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {!aadhaarVerified && !otpSent && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aadhaar">Aadhaar Number</Label>
                    <Input 
                      id="aadhaar" 
                      type="text" 
                      placeholder="Enter 12-digit Aadhaar number"
                      required 
                      maxLength={12}
                      pattern="[0-9]{12}"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Demo Aadhaar numbers: 374839462289, 632032286346, 476089247816
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleSkipAadhaar}
                    disabled={loading}
                  >
                    Skip for Now (Limited Access)
                  </Button>
                </form>
              )}

              {!aadhaarVerified && otpSent && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input 
                      id="otp" 
                      type="text" 
                      placeholder="Enter 6-digit OTP"
                      required 
                      maxLength={6}
                      pattern="[0-9]{6}"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      OTP sent to {maskedPhone}. Check the success message above for demo OTP.
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                      setError(null);
                    }}
                    disabled={loading}
                  >
                    Resend OTP
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex items-center justify-center p-4 relative">
      <AnimatePresence>
        {showSuccessAnimation && (
          <SuccessAnimation
            title={successMessage.title}
            description={successMessage.description}
            onComplete={() => {
              // Auto-hide after animation unless it's login/signup (they redirect)
              if (!success?.includes("Redirecting")) {
                setTimeout(() => setShowSuccessAnimation(false), 1000);
              }
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Back Button - Top Left Corner */}
      <Button
        variant="ghost"
        className="absolute top-4 left-4 z-10 hover:bg-primary/10"
        onClick={() => navigate("/select-role")}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{config.title}</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-50 text-green-900 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="example@email.com" 
                      required 
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Logging in..." : "Continue"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      type="text" 
                      required 
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <Input 
                      id="email-signup" 
                      type="email" 
                      placeholder="example@gmail.com" 
                      required 
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-signup">Password (min 6 characters)</Label>
                    <Input 
                      id="password-signup" 
                      type="password" 
                      required 
                      minLength={6}
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="location" 
                        type="text" 
                        placeholder="City, State" 
                        required 
                        value={signupForm.location}
                        onChange={(e) => setSignupForm({ ...signupForm, location: e.target.value })}
                        disabled={loading || locationLoading}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleUseCurrentLocation}
                        disabled={loading || locationLoading}
                        className="shrink-0"
                      >
                        {locationLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MapPin className="w-4 h-4" />
                        )}
                        <span className="ml-2 hidden sm:inline">Use Current Location</span>
                      </Button>
                    </div>
                  </div>

                  {role === "donor" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="donor-type">Donor Type</Label>
                        <Select 
                          value={signupForm.donorType} 
                          onValueChange={(value) => setSignupForm({ ...signupForm, donorType: value })}
                          disabled={loading}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="restaurant">Restaurant</SelectItem>
                            <SelectItem value="grocery">Grocery Store</SelectItem>
                            <SelectItem value="hotel">Hotel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Alert className="bg-blue-50 text-blue-900 border-blue-200">
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          Aadhaar verification is required to complete registration and access all donor features.
                        </AlertDescription>
                      </Alert>
                    </>
                  )}

                  {role === "ngo" && (
                    <div className="space-y-2">
                      <Label htmlFor="ngo-id">NGO Registration ID</Label>
                      <Input 
                        id="ngo-id" 
                        type="text" 
                        required 
                        value={signupForm.ngoRegistrationId}
                        onChange={(e) => setSignupForm({ ...signupForm, ngoRegistrationId: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  )}

                  {role === "logistics" && (
                    <div className="space-y-2">
                      <Label htmlFor="vehicle-type">Vehicle Type</Label>
                      <Select 
                        value={signupForm.vehicleType} 
                        onValueChange={(value) => setSignupForm({ ...signupForm, vehicleType: value })}
                        disabled={loading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bike">Bike</SelectItem>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="truck">Truck</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
