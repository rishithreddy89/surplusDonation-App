import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Heart,
  Package,
  Users,
  TrendingUp,
  Shield,
  Mail,
  DollarSign
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const BrowseNGOs = () => {
  const [ngos, setNgos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNGO, setSelectedNGO] = useState<any>(null);

  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      // Fetch all NGOs from the system
      const response = await fetch('http://localhost:3000/api/admin/users?role=ngo', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setNgos(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch NGOs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNGOs = ngos.filter(ngo =>
    ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ngo.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8 text-blue-600" />
          Browse NGOs & Recipients
        </h1>
        <p className="text-muted-foreground mt-1">
          Discover and directly support organizations making a difference
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search NGOs by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total NGOs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{ngos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified NGOs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {ngos.filter(n => n.isVerified).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Locations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(ngos.map(n => n.location)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NGO List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Loading NGOs...
          </div>
        ) : filteredNGOs.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No NGOs found</p>
          </div>
        ) : (
          filteredNGOs.map((ngo) => (
            <Card key={ngo._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{ngo.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {ngo.location}
                    </CardDescription>
                  </div>
                  {ngo.isVerified && (
                    <Badge variant="outline" className="text-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {ngo.email}
                </div>

                {ngo.ngoRegistrationId && (
                  <div className="text-xs text-muted-foreground">
                    Reg: {ngo.ngoRegistrationId}
                  </div>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      onClick={() => setSelectedNGO(ngo)}
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Support This NGO
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">
                        {ngo.name}
                      </DialogTitle>
                    </DialogHeader>
                    
                    {selectedNGO && (
                      <Tabs defaultValue="info" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="info">Info</TabsTrigger>
                          <TabsTrigger value="donate-items">Donate Items</TabsTrigger>
                          <TabsTrigger value="donate-money">Donate Money</TabsTrigger>
                        </TabsList>

                        {/* NGO Information */}
                        <TabsContent value="info" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>About</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedNGO.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedNGO.email}</span>
                              </div>
                              {selectedNGO.ngoRegistrationId && (
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-muted-foreground" />
                                  <span>Registration: {selectedNGO.ngoRegistrationId}</span>
                                </div>
                              )}
                              {selectedNGO.isVerified && (
                                <Badge variant="outline" className="text-green-600">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified Organization
                                </Badge>
                              )}
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Donate Items */}
                        <TabsContent value="donate-items" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>Donate Surplus Items</CardTitle>
                              <CardDescription>
                                Create a surplus donation that this NGO can claim
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                  You can create a surplus donation and the NGO will be able to claim it.
                                  The NGO will be notified about your donation.
                                </p>
                                <div className="flex gap-2">
                                  <Button 
                                    className="flex-1"
                                    onClick={() => {
                                      localStorage.setItem('preferredNGO', JSON.stringify(selectedNGO));
                                      window.location.href = '/dashboard/donor/add-surplus';
                                    }}
                                  >
                                    <Package className="h-4 w-4 mr-2" />
                                    Create Surplus Donation
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    onClick={() => window.location.href = '/dashboard/donor/ngo-requests'}
                                  >
                                    View Their Requests
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Donate Money */}
                        <TabsContent value="donate-money" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle>Monetary Donation</CardTitle>
                              <CardDescription>
                                Support with direct financial contribution
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-green-600" />
                                    Tax Benefits Available
                                  </h4>
                                  <p className="text-sm text-blue-900">
                                    If this NGO has 80G certification, you can claim tax benefits on your donation.
                                  </p>
                                </div>
                                <Button 
                                  className="w-full" 
                                  size="lg"
                                  onClick={() => {
                                    localStorage.setItem('preferredNGO', JSON.stringify(selectedNGO));
                                    window.location.href = '/dashboard/donor/donate-money';
                                  }}
                                >
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Proceed to Donate Money
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    )}
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BrowseNGOs;
