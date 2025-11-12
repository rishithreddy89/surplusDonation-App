import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertCircle } from "lucide-react";
import { getNGORequests, NGORequest } from "@/lib/api";

const MyRequests = () => {
  const [requests, setRequests] = useState<NGORequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getNGORequests({});

      if (response.success && response.data) {
        setRequests(response.data);
      } else {
        setError(response.message || "Failed to fetch requests");
      }
    } catch (err: any) {
      console.error('Fetch requests error:', err);
      setError(err.message || "An error occurred while fetching requests");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "fulfilled": return "bg-success text-white";
      case "partially-fulfilled": return "bg-primary text-white";
      case "open": return "bg-warning";
      case "closed": return "bg-muted";
      default: return "bg-muted";
    }
  };

  const getPriorityColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "text-destructive";
      case "high": return "text-warning";
      case "medium": return "text-primary";
      case "low": return "text-muted-foreground";
      default: return "text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">My Requests</h2>
        <p className="text-muted-foreground">Track all your requested items and their status</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Request History</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No requests found.</p>
              <p className="text-sm mt-2">Create your first request to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request._id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{request.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>{request.quantity} {request.unit}</TableCell>
                      <TableCell className={getPriorityColor(request.urgency)}>
                        <span className="capitalize font-medium">{request.urgency}</span>
                      </TableCell>
                      <TableCell>{formatDate(request.createdAt)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status.replace('-', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {!loading && requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {requests.length}
              </div>
              <p className="text-xs text-muted-foreground">Total Requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-success">
                {requests.filter(r => r.status === 'fulfilled').length}
              </div>
              <p className="text-xs text-muted-foreground">Fulfilled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-warning">
                {requests.filter(r => r.status === 'open').length}
              </div>
              <p className="text-xs text-muted-foreground">Open</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-destructive">
                {requests.filter(r => r.urgency === 'critical' || r.urgency === 'high').length}
              </div>
              <p className="text-xs text-muted-foreground">High Priority</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
