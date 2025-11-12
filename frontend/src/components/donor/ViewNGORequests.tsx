import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Heart, 
  Search, 
  MapPin, 
  Calendar,
  AlertCircle,
  Package,
  Filter,
  CheckCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const ViewNGORequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDonateDialog, setShowDonateDialog] = useState(false);
  const [donateLoading, setDonateLoading] = useState(false);
  
  // Donation form
  const [donationForm, setDonationForm] = useState({
    quantity: '',
    unit: '',
    expiryDate: '',
    pickupLocation: '',
    notes: ''
  });

  useEffect(() => {
    fetchNGORequests();
  }, []);

  const fetchNGORequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/donor/ngo-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📊 NGO Requests data:', data);
      
      if (data.success) {
        setRequests(data.data);
      } else {
        console.error('❌ Failed to fetch requests:', data.message);
        alert(data.message || 'Failed to fetch NGO requests');
      }
    } catch (error) {
      console.error('Failed to fetch NGO requests:', error);
      alert('Error fetching NGO requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!selectedRequest || !donationForm.quantity || !donationForm.pickupLocation) {
      alert('Please fill all required fields');
      return;
    }

    setDonateLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/donor/surplus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          title: `Donation for: ${selectedRequest.title}`,
          description: `Responding to NGO request: ${selectedRequest.description}\n\nDonor Notes: ${donationForm.notes || 'None'}`,
          category: selectedRequest.category,
          quantity: parseFloat(donationForm.quantity),
          unit: donationForm.unit || selectedRequest.unit,
          expiryDate: donationForm.expiryDate || undefined,
          location: {
            address: donationForm.pickupLocation
          },
          relatedRequestId: selectedRequest._id
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Donation created successfully! The NGO has been notified.');
        setShowDonateDialog(false);
        setSelectedRequest(null);
        setDonationForm({
          quantity: '',
          unit: '',
          expiryDate: '',
          pickupLocation: '',
          notes: ''
        });
        // Optionally refresh the requests
        fetchNGORequests();
      } else {
        alert(data.message || 'Failed to create donation');
      }
    } catch (error) {
      console.error('Donation error:', error);
      alert('Error creating donation');
    } finally {
      setDonateLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants: any = {
      critical: { color: 'bg-red-100 text-red-800 border-red-200', icon: '🚨' },
      high: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '⚠️' },
      medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '⚡' },
      low: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: 'ℹ️' }
    };
    const badge = variants[urgency] || variants.low;
    return (
      <Badge variant="outline" className={`${badge.color} border`}>
        {badge.icon} {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </Badge>
    );
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || req.category === categoryFilter;
    const matchesUrgency = urgencyFilter === 'all' || req.urgency === urgencyFilter;
    
    return matchesSearch && matchesCategory && matchesUrgency;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Heart className="h-8 w-8 text-red-600" />
          NGO Requests
        </h1>
        <p className="text-muted-foreground mt-1">
          Help NGOs by donating to their urgent needs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{requests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {requests.filter(r => r.urgency === 'critical').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {requests.filter(r => r.urgency === 'high').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(requests.map(r => r.category)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <Package className="h-4 w-4 mr-2" />
                <SelectValue />
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

            {/* Urgency Filter */}
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger>
                <AlertCircle className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Requests</CardTitle>
          <CardDescription>
            {filteredRequests.length} requests found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading requests...
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div
                  key={request._id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{request.title}</h3>
                          {getUrgencyBadge(request.urgency)}
                          <Badge variant="outline">
                            {request.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {request.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {request.quantity} {request.unit} needed
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {request.location?.address || 'Location not specified'}
                          </span>
                          {request.neededBy && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Needed by: {new Date(request.neededBy).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {request.ngoId && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium">Requested by:</span>{' '}
                            <span className="text-primary">{request.ngoId.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <Dialog open={showDonateDialog && selectedRequest?._id === request._id} onOpenChange={(open) => {
                    if (!open) {
                      setShowDonateDialog(false);
                      setSelectedRequest(null);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDonateDialog(true);
                          setDonationForm({
                            ...donationForm,
                            unit: request.unit,
                            quantity: ''
                          });
                        }}
                        className="ml-4"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Donate
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Donate to Request</DialogTitle>
                        <DialogDescription>
                          You're donating to: <strong>{request.title}</strong>
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {/* Request Details */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold mb-2">Request Details</h4>
                          <div className="text-sm space-y-1">
                            <p><strong>NGO:</strong> {request.ngoId?.name}</p>
                            <p><strong>Needed:</strong> {request.quantity} {request.unit}</p>
                            <p><strong>Category:</strong> {request.category}</p>
                            <p><strong>Description:</strong> {request.description}</p>
                          </div>
                        </div>

                        {/* Donation Form */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Quantity to Donate *</Label>
                            <Input
                              type="number"
                              placeholder="Enter quantity"
                              value={donationForm.quantity}
                              onChange={(e) => setDonationForm({ ...donationForm, quantity: e.target.value })}
                              min="0"
                            />
                          </div>
                          <div>
                            <Label>Unit *</Label>
                            <Input
                              placeholder="e.g., kg, pieces"
                              value={donationForm.unit}
                              onChange={(e) => setDonationForm({ ...donationForm, unit: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Expiry Date (if applicable)</Label>
                          <Input
                            type="date"
                            value={donationForm.expiryDate}
                            onChange={(e) => setDonationForm({ ...donationForm, expiryDate: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label>Pickup Location *</Label>
                          <Input
                            placeholder="Enter your address for pickup"
                            value={donationForm.pickupLocation}
                            onChange={(e) => setDonationForm({ ...donationForm, pickupLocation: e.target.value })}
                          />
                        </div>

                        <div>
                          <Label>Additional Notes</Label>
                          <Textarea
                            placeholder="Any special instructions or details..."
                            value={donationForm.notes}
                            onChange={(e) => setDonationForm({ ...donationForm, notes: e.target.value })}
                            rows={3}
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={handleDonate}
                            disabled={donateLoading || !donationForm.quantity || !donationForm.pickupLocation}
                            className="flex-1"
                          >
                            {donateLoading ? 'Creating Donation...' : 'Confirm Donation'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowDonateDialog(false);
                              setSelectedRequest(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewNGORequests;
