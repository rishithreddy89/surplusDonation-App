import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, Users, Loader2, Info, Package } from "lucide-react";
import { getUrgentNeeds, createNGORequest, NGORequest } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const UrgentNeeds = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [urgentItems, setUrgentItems] = useState<NGORequest[]>([]);

  useEffect(() => {
    fetchUrgentNeeds();
  }, []);

  const fetchUrgentNeeds = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getUrgentNeeds();

      if (response.success && response.data) {
        setUrgentItems(response.data);
      } else {
        setError(response.message || "Failed to fetch urgent needs");
      }
    } catch (err: any) {
      console.error('Fetch urgent needs error:', err);
      setError(err.message || "An error occurred while fetching urgent needs");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (urgency: string) => {
    return urgency === 'critical' ? 'text-destructive' : 'text-warning';
  };

  const getPriorityLabel = (urgency: string) => {
    return urgency === 'critical' ? 'Critical' : 'High';
  };

  const calculateDeadline = (neededBy?: string) => {
    if (!neededBy) return "Not specified";
    
    const deadline = new Date(neededBy);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffHours < 0) return "Overdue";
    if (diffHours < 24) return `${diffHours} hours left`;
    const diffDays = Math.ceil(diffHours / 24);
    return `${diffDays} days left`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading urgent needs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <AlertCircle className="w-8 h-8 text-destructive" />
          Urgent Needs
        </h2>
        <p className="text-muted-foreground">High-priority items needed immediately across the platform</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {urgentItems.length === 0 && !loading ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Info className="w-12 h-12 mx-auto mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">No Urgent Needs Currently</h3>
              <p className="text-sm text-muted-foreground mb-4">
                There are no critical or high-priority requests at the moment.
              </p>
              <Button onClick={() => navigate('/dashboard/ngo/request')}>
                Create a Request
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {urgentItems.map((item) => (
            <Card 
              key={item._id} 
              className="border-2 border-destructive/20 bg-destructive/5 hover:shadow-xl transition-shadow"
            >
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertCircle className="w-6 h-6 text-destructive mt-1" />
                      <div>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-muted-foreground mb-3">{item.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm mb-2">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <span>{item.quantity} {item.unit}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className={`w-4 h-4 ${getPriorityColor(item.urgency)}`} />
                            <span className={`font-medium ${getPriorityColor(item.urgency)}`}>
                              {calculateDeadline(item.neededBy)}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Requested by:</span> {
                            typeof item.ngoId === 'object' && 'name' in item.ngoId 
                              ? (item.ngoId as any).name 
                              : 'NGO'
                          } • {
                            typeof item.ngoId === 'object' && 'location' in item.ngoId 
                              ? (item.ngoId as any).location 
                              : item.location?.address
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:min-w-[140px]">
                    <Button 
                      size="lg" 
                      className="w-full bg-destructive hover:bg-destructive/90"
                      onClick={() => navigate('/dashboard/ngo/browse')}
                    >
                      Browse Matches
                    </Button>
                    <span className={`text-center text-xs font-medium ${getPriorityColor(item.urgency)}`}>
                      {getPriorityLabel(item.urgency)} Priority
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Set Up Urgent Alerts</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get notified when matching donations become available for your urgent needs (Coming Soon)
            </p>
            <Button variant="outline" disabled>Configure Alerts</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UrgentNeeds;
