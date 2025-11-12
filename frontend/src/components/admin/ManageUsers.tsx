import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Users, 
  Search, 
  Filter, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Shield,
  ShieldCheck,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  location: string;
  isVerified: boolean;
  donorType?: string;
  ngoRegistrationId?: string;
  vehicleType?: string;
  createdAt: string;
}

const ManageUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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

      const response = await fetch('http://localhost:3000/api/admin/users', {
        headers,
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success && data.data) {
        setUsers(data.data);
      } else {
        setError(data.message || "Failed to fetch users");
      }
    } catch (err: any) {
      console.error('Fetch users error:', err);
      setError(err.message || "An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/verify`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isVerified: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success!",
          description: `User ${!currentStatus ? 'verified' : 'unverified'} successfully`,
        });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update verification status",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(userId);

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success!",
          description: "User deleted successfully",
        });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesVerified = 
      verifiedFilter === "all" || 
      (verifiedFilter === "verified" && user.isVerified) ||
      (verifiedFilter === "unverified" && !user.isVerified);

    return matchesSearch && matchesRole && matchesVerified;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'donor': return 'bg-primary';
      case 'ngo': return 'bg-success';
      case 'logistics': return 'bg-warning';
      case 'admin': return 'bg-destructive';
      default: return 'bg-muted';
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
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Manage Users</h2>
        <p className="text-muted-foreground">View and manage all platform users</p>
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
                  placeholder="Search by name, email, or location..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="donor">Donors</SelectItem>
                <SelectItem value="ngo">NGOs</SelectItem>
                <SelectItem value="logistics">Logistics</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Verification status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="unverified">Unverified Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/10 rounded-full">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold text-success">
                  {users.filter(u => u.isVerified).length}
                </div>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/10 rounded-full">
                <Shield className="w-6 h-6 text-warning" />
              </div>
              <div>
                <div className="text-2xl font-bold text-warning">
                  {users.filter(u => !u.isVerified).length}
                </div>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{filteredUsers.length}</div>
                <p className="text-xs text-muted-foreground">Filtered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users List ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts and verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>No users found</p>
              <p className="text-sm mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(user.role)} text-white capitalize`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.location}
                      </TableCell>
                      <TableCell>
                        {user.isVerified ? (
                          <Badge variant="outline" className="text-success border-success">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-warning border-warning">
                            <Shield className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={user.isVerified ? "outline" : "default"}
                            onClick={() => handleVerifyUser(user._id, user.isVerified)}
                            disabled={actionLoading === user._id}
                          >
                            {actionLoading === user._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : user.isVerified ? (
                              <XCircle className="w-3 h-3" />
                            ) : (
                              <ShieldCheck className="w-3 h-3" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={actionLoading === user._id}
                            className="text-destructive hover:bg-destructive hover:text-white"
                          >
                            {actionLoading === user._id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageUsers;
