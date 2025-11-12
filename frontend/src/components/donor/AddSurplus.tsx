import { useState, FormEvent, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Sparkles, AlertCircle, CheckCircle, MapPin, Loader2, Camera, X } from "lucide-react";
import { createSurplus, SurplusData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { loadGoogleMapsScript } from "@/lib/googleMaps";
import { classifyByImage, classifyByText, ClassificationResult } from "@/lib/aiClassification";
import { AnimatePresence } from "framer-motion";
import SuccessAnimation from "@/components/ui/SuccessAnimation";

const AddSurplus = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string>("");
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "Success!", description: "" });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    quantity: "",
    unit: "",
    expiryDate: "",
    address: "",
  });

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
        setFormData({ ...formData, address });
        
        // Show success animation
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

  const handleClassifyImage = async (file: File) => {
    setClassifying(true);
    setAiSuggestion("");

    try {
      const result: ClassificationResult = await classifyByImage(file);
      
      // Update form data with AI suggestions
      setFormData(prev => ({
        ...prev,
        category: result.category,
        unit: result.suggestedUnit,
      }));

      setAiSuggestion(result.description);
      
      // Show success animation for AI classification
      setSuccessMessage({
        title: "✨ AI Classification Complete",
        description: result.description
      });
      setShowSuccessAnimation(true);
      
      setTimeout(() => {
        setShowSuccessAnimation(false);
      }, 1500);
    } catch (err) {
      console.error('AI classification error:', err);
      setAiSuggestion("AI classification unavailable. Please select category manually.");
      
      toast({
        title: "Note",
        description: "Automatic classification unavailable. Please select category manually.",
        variant: "default",
      });
    } finally {
      setClassifying(false);
    }
  };

  const handleClassifyByItemName = (itemName: string) => {
    if (!itemName || itemName.length < 3) return;

    const result: ClassificationResult = classifyByText(itemName);
    
    if (result.confidence > 0 && formData.category !== result.category) {
      setFormData(prev => ({
        ...prev,
        category: result.category,
        unit: prev.unit || result.suggestedUnit,
      }));

      toast({
        title: "✨ Auto-detected Category",
        description: `${result.description}. Recommended unit: ${result.suggestedUnit}`,
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please upload a valid image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Classify the uploaded image
    handleClassifyImage(file);
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(e);
  };

  const openNativeFilePicker = () => {
    fileInputRef.current?.click();
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera start error', err);
      setShowCamera(false);
      // fallback: open native file picker
      openNativeFilePicker();
    }
  };

  const stopCamera = () => {
    try {
      streamRef.current?.getTracks().forEach(t => t.stop());
    } catch (e) {
      // ignore
    }
    streamRef.current = null;
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch {}
      videoRef.current.srcObject = null as any;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
    const canvas = canvasRef.current;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setImagePreview(dataUrl);
    // convert dataUrl to File
    const file = dataURLtoFile(dataUrl, 'capture.jpg');
    setImageFile(file);
    // classify
    handleClassifyImage(file);
    stopCamera();
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setAiSuggestion("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.category || 
          !formData.quantity || !formData.unit || !formData.address) {
        setError("Please fill in all required fields");
        setLoading(false);
        return;
      }

      const surplusData: SurplusData = {
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        location: {
          address: formData.address,
        },
      };

      // Add expiry date if provided
      if (formData.expiryDate) {
        surplusData.expiryDate = formData.expiryDate;
      }

      console.log('Submitting surplus:', surplusData);

      const response = await createSurplus(surplusData);

      if (response.success) {
        setSuccess(true);
        
        // Show success animation
        setSuccessMessage({
          title: "Donation Created!",
          description: "Your surplus item has been successfully listed"
        });
        setShowSuccessAnimation(true);

        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          quantity: "",
          unit: "",
          expiryDate: "",
          address: "",
        });

        // Navigate to surplus list after 2 seconds
        setTimeout(() => {
          navigate("/dashboard/donor/donations");
        }, 2000);
      } else {
        if (response.errors && response.errors.length > 0) {
          const errorMessages = response.errors.map((err: any) => err.msg || err.message).join(', ');
          setError(errorMessages);
        } else {
          setError(response.message || "Failed to create surplus item");
        }
      }
    } catch (err: any) {
      console.error('Create surplus error:', err);
      setError(err.message || "An error occurred while creating the surplus item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <AnimatePresence>
        {showSuccessAnimation && (
          <SuccessAnimation
            title={successMessage.title}
            description={successMessage.description}
          />
        )}
      </AnimatePresence>
      
      <div>
        <h2 className="text-3xl font-bold mb-2">Add Surplus Item</h2>
        <p className="text-muted-foreground">Fill in the details of your surplus item</p>
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
          <AlertDescription>Surplus item created successfully! Redirecting...</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>Provide information about the surplus item you want to donate</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name *</Label>
              <Input 
                id="item-name" 
                placeholder="e.g., Fresh Vegetables" 
                value={formData.title}
                onChange={(e) => {
                  const newTitle = e.target.value;
                  setFormData({ ...formData, title: newTitle });
                  // Auto-classify based on item name
                  if (newTitle.length >= 3) {
                    handleClassifyByItemName(newTitle);
                  }
                }}
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
                <Label htmlFor="quantity">Quantity *</Label>
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
              <Label htmlFor="expiry">Expiry Date (if applicable)</Label>
              <Input 
                id="expiry" 
                type="date" 
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Pickup Location *</Label>
              <div className="flex gap-2">
                <Input 
                  id="location" 
                  placeholder="Enter your address" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={loading || locationLoading}
                  required
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

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description" 
                placeholder="Add any additional details..." 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Image</Label>
              
              {!imagePreview ? (
                <div className="space-y-3">
                  {/* Gallery Upload */}
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center bg-muted/50 hover:bg-muted/70 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={loading || classifying}
                    />
                    <button type="button" onClick={openNativeFilePicker} className="w-full">
                      <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-sm font-medium mb-1">Upload from Gallery</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                    </button>
                  </div>

                  {/* Camera Capture */}
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center bg-primary/5 hover:bg-primary/10 transition-colors">
                    <button type="button" onClick={startCamera} className="w-full">
                      <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-sm font-medium mb-1 text-primary">📱 Take Photo with Camera</p>
                      <p className="text-xs text-muted-foreground">Open camera to capture</p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative border-2 border-border rounded-lg overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-64 object-cover"
                  />
                  {classifying && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                        <p className="text-sm font-medium">AI Classifying...</p>
                      </div>
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                    disabled={loading || classifying}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {aiSuggestion && (
              <Card className="border-success/20 bg-success/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-success mt-1" />
                    <div>
                      <p className="font-medium text-success">AI Classification Result</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {aiSuggestion}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium text-primary">AI-Powered Smart Detection</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      • Upload an image and our AI will automatically detect the item type<br/>
                      • Type the item name and get instant category suggestions<br/>
                      • Recommended storage conditions and handling tips
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={loading}
            >
              {loading ? "Creating..." : "Submit Donation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background rounded-lg w-full max-w-md mx-4 overflow-hidden">
            <div className="relative">
              <video ref={videoRef} className="w-full h-80 bg-black object-cover" playsInline />
              <button
                type="button"
                onClick={() => stopCamera()}
                className="absolute top-3 right-3 bg-white/80 rounded-full p-2"
                aria-label="Close camera"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-between">
              <button
                type="button"
                onClick={capturePhoto}
                className="bg-primary text-white px-4 py-2 rounded-lg shadow"
              >
                Capture
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="bg-muted text-foreground px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSurplus;
