import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getTaxReceipts, requestTaxReceipt, downloadTaxReceipt } from '@/lib/api';

interface TaxBenefitsProps {
  deliveredDonations: any[];
}

export const TaxBenefits = ({ deliveredDonations }: TaxBenefitsProps) => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [showPANForm, setShowPANForm] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<any>(null);
  const [panNumber, setPanNumber] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const response = await getTaxReceipts();
      if (response.success) setReceipts(response.data);
    } catch (error) {
      console.error('Failed to fetch receipts:', error);
    }
  };

  const handleRequestReceipt = async () => {
    if (!selectedDonation || !panNumber) return;

    setLoading(true);
    try {
      const response = await requestTaxReceipt(selectedDonation._id, {
        donorPAN: panNumber.toUpperCase(),
        donorAddress: address
      });

      if (response.success) {
        alert('Tax receipt generated successfully!');
        fetchReceipts();
        setShowPANForm(false);
        setPanNumber('');
        setAddress('');
        setSelectedDonation(null);
      } else {
        alert(response.message || 'Failed to generate receipt');
      }
    } catch (error) {
      alert('Error generating receipt');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (receipt: any) => {
    try {
      // Direct download using static file server
      // receipt.pdfUrl already contains 'receipts/receipt-...'
      const pdfUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}/uploads/${receipt.pdfUrl}`;
      
      console.log('📥 Downloading PDF from:', pdfUrl);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `80G-Receipt-${receipt.receiptNumber}.pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading receipt');
    }
  };

  const eligibleDonations = deliveredDonations.filter(
    d => !receipts.find(r => r.surplusId?._id === d._id || r.surplusId === d._id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              Tax Benefits (Section 80G)
            </CardTitle>
            <CardDescription>
              Generate receipts for tax deductions on eligible donations
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-green-600">
            {receipts.length} Receipts Generated
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">How to claim tax benefits:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Donations to verified 80G NGOs are eligible for tax deduction</li>
                <li>Request a receipt after your donation is delivered</li>
                <li>Use the receipt while filing your income tax returns</li>
                <li>Deduction is typically 50% of donation value under Section 80G</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Eligible Donations */}
        {eligibleDonations.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Request Tax Receipt</h3>
            <div className="space-y-2">
              {eligibleDonations.map((donation) => (
                <div
                  key={donation._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{donation.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {donation.quantity} {donation.unit} • Delivered
                    </p>
                  </div>
                  <Dialog open={showPANForm && selectedDonation?._id === donation._id} onOpenChange={(open) => {
                    if (!open) {
                      setShowPANForm(false);
                      setSelectedDonation(null);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedDonation(donation);
                          setShowPANForm(true);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Request Receipt
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Generate 80G Tax Receipt</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>PAN Number *</Label>
                          <Input
                            placeholder="ABCDE1234F"
                            value={panNumber}
                            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                            maxLength={10}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Enter your 10-character PAN number
                          </p>
                        </div>
                        <div>
                          <Label>Address (Optional)</Label>
                          <Input
                            placeholder="Your address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleRequestReceipt}
                            disabled={loading || !panNumber}
                            className="flex-1"
                          >
                            {loading ? 'Generating...' : 'Generate Receipt'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowPANForm(false);
                              setSelectedDonation(null);
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
          </div>
        )}

        {/* Generated Receipts */}
        {receipts.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Your Tax Receipts</h3>
            <div className="space-y-2">
              {receipts.map((receipt) => (
                <div
                  key={receipt._id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-green-50"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium">{receipt.donationDescription}</p>
                      <p className="text-sm text-muted-foreground">
                        Receipt #{receipt.receiptNumber} • ₹{receipt.donationValue}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {receipt.ngoName} • FY {receipt.financialYear}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(receipt)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {eligibleDonations.length === 0 && receipts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No delivered donations available for tax receipts yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
