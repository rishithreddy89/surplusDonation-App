import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Package, Clock, Loader2, AlertCircle, Truck, User, Route as RouteIcon, Navigation, Heart } from "lucide-react";
import { getAvailableTasks, acceptTask, volunteerPickupTask, Task } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { loadGoogleMapsScript, createMap } from "@/lib/googleMaps";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

const AvailableTasks = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [volunteerAccepting, setVolunteerAccepting] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!dialogOpen || !selectedTask) {
      // Clean up when dialog closes
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
      return;
    }

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initMap = async () => {
      try {
        await loadGoogleMapsScript();

        if (!isMounted || !mapRef.current) return;

        // Wait for dialog animation to complete
        timeoutId = setTimeout(() => {
          if (!mapRef.current || !isMounted) return;

          const map = createMap(mapRef.current, {
            center: { lat: 19.0760, lng: 72.8777 },
            zoom: 13,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
          });

          mapInstanceRef.current = map;

          // Add markers for pickup and delivery
          if (selectedTask && window.google) {
            // Pickup marker
            new window.google.maps.Marker({
              position: { lat: 19.0760, lng: 72.8777 },
              map: map,
              title: 'Pickup Location',
              icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
              },
              label: {
                text: 'P',
                color: 'white',
                fontWeight: 'bold'
              }
            });

            // Delivery marker
            new window.google.maps.Marker({
              position: { lat: 19.0860, lng: 72.8977 },
              map: map,
              title: 'Delivery Location',
              icon: {
                url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
              },
              label: {
                text: 'D',
                color: 'white',
                fontWeight: 'bold'
              }
            });

            // Add route
            const directionsService = new window.google.maps.DirectionsService();
            const directionsRenderer = new window.google.maps.DirectionsRenderer({
              map: map,
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: '#4F46E5',
                strokeWeight: 4,
              },
            });

            directionsService.route(
              {
                origin: selectedTask.pickupLocation.address,
                destination: selectedTask.deliveryLocation.address,
                travelMode: window.google.maps.TravelMode.DRIVING,
              },
              (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK && result) {
                  directionsRenderer.setDirections(result);
                }
              }
            );
          }
        }, 300); // Wait 300ms for dialog to render
      } catch (err) {
        console.error('Map initialization error:', err);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current = null;
        } catch (e) {
          console.error('Error cleaning map:', e);
        }
      }
    };
  }, [dialogOpen, selectedTask]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getAvailableTasks();
      setTasks(response.data || []);
    } catch (err: any) {
      console.error('Fetch tasks error:', err);
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptTask = async (taskId: string) => {
    try {
      setAccepting(taskId);
      const response = await acceptTask(taskId);

      if (response.success) {
        toast({
          title: "Success!",
          description: "Task accepted successfully",
        });
        fetchTasks();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to accept task",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('Accept task error:', err);
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setAccepting(null);
    }
  };

  const handleVolunteerPickup = async (taskId: string) => {
    try {
      setVolunteerAccepting(taskId);
      const response = await volunteerPickupTask(taskId);

      if (response.success) {
        toast({
          title: "Thank you, Volunteer! 🎉",
          description: "You've accepted this delivery. Your contribution makes a difference!",
        });
        fetchTasks();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to accept volunteer task",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('Volunteer pickup error:', err);
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setVolunteerAccepting(null);
    }
  };

  const handleViewDetails = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current = null;
    }

    setTimeout(() => {
      setDialogOpen(false);
      setSelectedTask(null);
    }, 50);
  };

  const openInGoogleMaps = (task: Task) => {
    const origin = encodeURIComponent(task.pickupLocation.address);
    const destination = encodeURIComponent(task.deliveryLocation.address);
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const getDonorName = (donor: any) => {
    if (donor && typeof donor === 'object' && 'name' in donor) {
      return donor.name;
    }
    return 'Unknown';
  };

  const getNGOName = (ngo: any) => {
    if (ngo && typeof ngo === 'object' && 'name' in ngo) {
      return ngo.name;
    }
    return 'Unknown';
  };

  const getSurplusTitle = (surplus: any) => {
    if (surplus && typeof surplus === 'object' && 'title' in surplus) {
      return surplus.title;
    }
    return 'Surplus Item';
  };

  const getSurplusDetails = (surplus: any) => {
    if (surplus && typeof surplus === 'object') {
      return `${surplus.quantity || 0} ${surplus.unit || 'units'}`;
    }
    return '';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading available tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Available Tasks</h2>
        <p className="text-muted-foreground">Browse and accept delivery tasks</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Truck className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>No tasks available at the moment</p>
            <p className="text-sm mt-2">Check back later for new delivery opportunities</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tasks.map((task) => (
            <Card key={task._id} className="hover:shadow-lg transition-shadow border-2">
              <CardContent className="pt-6">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Package className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{getSurplusTitle(task.surplusId)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getSurplusDetails(task.surplusId)}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {task.status}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="w-4 h-4 text-success" />
                          Pickup
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">{getDonorName(task.donorId)}</p>
                          <p className="text-muted-foreground">
                            {task.pickupLocation.address}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{formatDate(task.scheduledPickup)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-muted rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <MapPin className="w-4 h-4 text-destructive" />
                          Delivery
                        </div>
                        <div className="text-sm">
                          <p className="font-medium">{getNGOName(task.ngoId)}</p>
                          <p className="text-muted-foreground">
                            {task.deliveryLocation.address}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{formatDate(task.scheduledDelivery)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:min-w-[140px] justify-center">
                    <Button
                      className="w-full"
                      onClick={() => handleAcceptTask(task._id)}
                      disabled={accepting === task._id || volunteerAccepting === task._id}
                    >
                      {accepting === task._id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <Truck className="w-4 h-4 mr-2" />
                          Accept Task
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="secondary"
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600"
                      onClick={() => handleVolunteerPickup(task._id)}
                      disabled={accepting === task._id || volunteerAccepting === task._id}
                    >
                      {volunteerAccepting === task._id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-2" />
                          Volunteer Pickup
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewDetails(task)}
                    >
                      <RouteIcon className="w-4 h-4 mr-2" />
                      View Route
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Route Details</DialogTitle>
            <DialogDescription>
              {selectedTask && `Pickup from ${getDonorName(selectedTask.donorId)} to ${getNGOName(selectedTask.ngoId)}`}
            </DialogDescription>
          </DialogHeader>

          {dialogOpen && selectedTask && (
            <div className="space-y-4">
              {/* Map Container */}
              <div className="relative">
                <div 
                  ref={mapRef} 
                  className="w-full h-96 rounded-lg bg-muted border"
                  style={{ minHeight: '384px' }}
                />
                <div className="absolute top-2 right-2 bg-background/90 backdrop-blur p-2 rounded-md shadow text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Pickup Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Delivery Location</span>
                  </div>
                </div>
              </div>

              {/* Open in Google Maps Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => openInGoogleMaps(selectedTask)}
                  className="gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Open in Google Maps
                </Button>
              </div>

              {/* Route Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-success mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">Pickup Location</p>
                        <p className="text-sm font-medium">{getDonorName(selectedTask.donorId)}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedTask.pickupLocation.address}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Scheduled: {formatDate(selectedTask.scheduledPickup)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-destructive mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-sm mb-1">Delivery Location</p>
                        <p className="text-sm font-medium">{getNGOName(selectedTask.ngoId)}</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedTask.deliveryLocation.address}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Scheduled: {formatDate(selectedTask.scheduledDelivery)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Item Details */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold">{getSurplusTitle(selectedTask.surplusId)}</p>
                      <p className="text-sm text-muted-foreground">
                        {getSurplusDetails(selectedTask.surplusId)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogClose asChild>
            <Button variant="outline" onClick={handleCloseDialog} className="w-full">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvailableTasks;

