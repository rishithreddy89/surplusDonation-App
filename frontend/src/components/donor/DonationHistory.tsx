import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Calendar, 
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Receipt,
  Filter
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DonationHistory = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchDonationHistory();
  }, []);

  const fetchDonationHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/donations/history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDonations(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch donation history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (donationId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/donations/receipt/${donationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `80G-Receipt-${donationId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Receipt not available');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading receipt');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      success: 'default',
      pending: 'secondary',
      failed: 'destructive'
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredDonations = filter === 'all' 
    ? donations 
    : donations.filter(d => d.paymentStatus === filter);

  const totalDonated = donations
    .filter(d => d.paymentStatus === 'success')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-green-600" />
            Donation History
          </h1>
          <p className="text-muted-foreground mt-1">
            Track all your monetary donations
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{donations.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ₹{totalDonated.toLocaleString('en-IN')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tax Receipts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {donations.filter(d => d.hasTaxBenefit && d.paymentStatus === 'success').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Donations</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading donations...
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No donations found</p>
              <Button className="mt-4" onClick={() => window.location.href = '/dashboard/donor/donate-money'}>
                Make Your First Donation
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDonations.map((donation) => (
                <div
                  key={donation._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    {getStatusIcon(donation.paymentStatus)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{donation.ngoId?.name || 'NGO'}</h3>
                        {getStatusBadge(donation.paymentStatus)}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </span>
                        <span>ID: {donation.donationId}</span>
                        {donation.transactionId && (
                          <span>TXN: {donation.transactionId}</span>
                        )}
                      </div>
                      {donation.hasTaxBenefit && donation.paymentStatus === 'success' && (
                        <Badge variant="outline" className="mt-2 text-green-600">
                          <Receipt className="h-3 w-3 mr-1" />
                          80G Receipt Available
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ₹{donation.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {donation.paymentMethod.toUpperCase()}
                      </div>
                    </div>
                    {donation.hasTaxBenefit && donation.paymentStatus === 'success' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReceipt(donation.donationId)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Receipt
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationHistory;
