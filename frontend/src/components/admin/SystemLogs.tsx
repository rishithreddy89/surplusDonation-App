import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Loader2, 
  AlertCircle, 
  Search, 
  Filter,
  Activity,
  User,
  Package,
  Truck,
  UserPlus,
  Settings
} from "lucide-react";

interface ActivityLog {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  action: string;
  resourceType: string;
  resourceId?: string;
  description: string;
  metadata?: any;
  ipAddress?: string;
  createdAt: string;
}

const SystemLogs = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [limitFilter, setLimitFilter] = useState("50");

  useEffect(() => {
    fetchLogs();
  }, [typeFilter, limitFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const params = new URLSearchParams({
        limit: limitFilter,
      });

      if (typeFilter !== 'all') {
        params.append('resourceType', typeFilter);
      }

      const response = await fetch(`http://localhost:3000/api/admin/logs?${params}`, {
        headers,
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        // Handle both array and object responses
        const logsData = Array.isArray(data.data) ? data.data : [];
        setLogs(logsData);
        
        if (logsData.length === 0) {
          setError(null); // Clear error if it's just empty data
        }
      } else {
        setError(data.message || "Failed to fetch activity logs");
        setLogs([]); // Set empty array on failure
      }
    } catch (err: any) {
      console.error('Fetch logs error:', err);
      setError(err.message || "An error occurred while fetching logs");
      setLogs([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'register':
        return UserPlus;
      case 'update':
      case 'edit':
        return Settings;
      case 'delete':
      case 'remove':
        return AlertCircle;
      default:
        return Activity;
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType.toLowerCase()) {
      case 'user':
        return User;
      case 'surplus':
        return Package;
      case 'task':
        return Truck;
      default:
        return FileText;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'register':
        return 'text-success';
      case 'update':
      case 'edit':
        return 'text-primary';
      case 'delete':
      case 'remove':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading activity logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">System Activity Logs</h2>
        <p className="text-muted-foreground">Monitor all platform activities and system events</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search logs..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">User Actions</SelectItem>
                <SelectItem value="surplus">Surplus Items</SelectItem>
                <SelectItem value="task">Delivery Tasks</SelectItem>
                <SelectItem value="request">NGO Requests</SelectItem>
              </SelectContent>
            </Select>
            <Select value={limitFilter} onValueChange={setLimitFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">Last 25</SelectItem>
                <SelectItem value="50">Last 50</SelectItem>
                <SelectItem value="100">Last 100</SelectItem>
                <SelectItem value="200">Last 200</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={fetchLogs} size="sm">
              Refresh Logs
            </Button>
            <Button variant="outline" size="sm" disabled>
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{logs.length}</div>
                <p className="text-xs text-muted-foreground">Total Logs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/10 rounded-full">
                <UserPlus className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">
                  {logs.filter(l => l.action.toLowerCase().includes('create')).length}
                </div>
                <p className="text-xs text-muted-foreground">Creates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {logs.filter(l => l.action.toLowerCase().includes('update')).length}
                </div>
                <p className="text-xs text-muted-foreground">Updates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <div className="text-2xl font-bold text-destructive">
                  {logs.filter(l => l.action.toLowerCase().includes('delete')).length}
                </div>
                <p className="text-xs text-muted-foreground">Deletions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline ({filteredLogs.length} logs)</CardTitle>
          <CardDescription>Chronological record of all system activities</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No activity logs found</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                const ResourceIcon = getResourceIcon(log.resourceType);
                
                return (
                  <div key={log._id} className="flex items-start gap-4 p-4 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                    <div className="flex gap-2">
                      <div className="p-2 bg-background rounded-lg">
                        <ResourceIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div className={`p-2 bg-background rounded-lg ${getActionColor(log.action)}`}>
                        <ActionIcon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="flex-1">
                          <p className="font-medium">{log.description}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{log.userId?.name || 'System'}</span>
                            </div>
                            <span>•</span>
                            <Badge variant="outline" className="capitalize">
                              {log.resourceType}
                            </Badge>
                            <span>•</span>
                            <span className="capitalize">{log.action}</span>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </div>
                      </div>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground bg-background p-2 rounded">
                          <pre className="overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.ipAddress && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          IP: {log.ipAddress}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary mt-1" />
            <div>
              <p className="font-medium text-primary">Activity Log Retention</p>
              <p className="text-sm text-muted-foreground mt-1">
                System logs are retained for 90 days and automatically archived. 
                Critical security events are retained indefinitely.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemLogs;
