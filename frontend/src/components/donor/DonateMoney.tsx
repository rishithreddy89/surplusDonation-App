import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DollarSign, 
  Search, 
  MapPin, 
  Shield, 
  CreditCard,
  Smartphone,
  Building,
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react';

const DonateMoney = () => {
  const [ngos, setNgos] = useState<any[]>([]);
  const [selectedNgo, setSelectedNgo] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [donorPAN, setDonorPAN] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [hasTaxBenefit, setHasTaxBenefit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<'select-ngo' | 'enter-details' | 'payment'>('select-ngo');
  const [donationResult, setDonationResult] = useState<any>(null); // Store donation result

  const predefinedAmounts = ['100', '500', '1000', '2000', '5000'];

  useEffect(() => {
    fetchEligibleNGOs();
  }, []);

  const fetchEligibleNGOs = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/donations/ngos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      console.log('📊 NGO API Response:', data);
      if (data.success) {
        console.log('✅ Fetched NGOs:', data.data);
        setNgos(data.data);
      } else {
        console.error('❌ API Error:', data.message);
      }
    } catch (error) {
      console.error('Failed to fetch NGOs:', error);
    }
  };

  const handleDonate = async () => {
    if (!selectedNgo || !amount) {
      alert('Please select an NGO and enter amount');
      return;
    }

    setLoading(true);
    try {
      console.log('🔍 Selected NGO full object:', selectedNgo);
      
      // The NGO80G document has ngoId which is populated with User data
      // So selectedNgo.ngoId._id is the User's ObjectId we need to send
      const ngoUserId = selectedNgo.ngoId?._id || selectedNgo.ngoId;
      console.log('🔍 Extracted NGO User ID:', ngoUserId);
      
      const requestBody = {
        ngoId: ngoUserId,
        amount: parseFloat(amount),
        donorPAN: hasTaxBenefit && donorPAN ? donorPAN : '', // Send empty string if not tax benefit
        paymentMethod,
        hasTaxBenefit
      };
      
      console.log('📤 Sending request:', requestBody);
      
      const response = await fetch('http://localhost:3000/api/donations/donate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📡 Response data:', data);
      
      if (data.success) {
        setDonationResult(data.data);
        setStep('payment');
        // Don't show alert here, show in the payment step instead
      } else {
        alert(data.message || 'Failed to initiate donation');
      }
    } catch (error) {
      console.error('Donation error:', error);
      alert('Error initiating donation');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!donationResult) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/donations/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          donationId: donationResult.donationId,
          transactionId: `TXN-${Date.now()}` // Simulate transaction ID
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Payment confirmed! ' + (data.data.hasTaxBenefit ? '80G receipt has been generated.' : ''));
        window.location.href = '/dashboard/donor/donation-history';
      } else {
        alert(data.message || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      alert('Error confirming payment');
    } finally {
      setLoading(false);
    }
  };

  const filteredNgos = ngos.filter(ngo =>
    ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ngo.ngoId?.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-green-600" />
          Donate Money to NGOs
        </h1>
        <p className="text-muted-foreground mt-1">
          Support verified NGOs with secure monetary donations
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 ${step === 'select-ngo' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step === 'select-ngo' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            1
          </div>
          <span className="font-medium">Select NGO</span>
        </div>
        <div className="h-px w-12 bg-border" />
        <div className={`flex items-center gap-2 ${step === 'enter-details' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step === 'enter-details' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            2
          </div>
          <span className="font-medium">Enter Details</span>
        </div>
        <div className="h-px w-12 bg-border" />
        <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className={`rounded-full w-8 h-8 flex items-center justify-center ${step === 'payment' ? 'bg-primary text-white' : 'bg-gray-200'}`}>
            3
          </div>
          <span className="font-medium">Payment</span>
        </div>
      </div>

      {/* Step 1: Select NGO */}
      {step === 'select-ngo' && (
        <Card>
          <CardHeader>
            <CardTitle>Select an NGO to Support</CardTitle>
            <CardDescription>Choose from 80G verified organizations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search NGOs by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* NGO List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredNgos.length === 0 ? (
                <div className="col-span-2 text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No NGOs found matching your search' : 'No NGOs available for monetary donations'}
                  </p>
                  {!searchQuery && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Please contact admin to verify NGOs for 80G donations
                    </p>
                  )}
                </div>
              ) : (
                filteredNgos.map((ngo) => (
                  <div
                    key={ngo._id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedNgo?._id === ngo._id
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedNgo(ngo)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{ngo.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{ngo.ngoId?.location || ngo.address || 'India'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-green-600">
                            <Shield className="h-3 w-3 mr-1" />
                            80G Verified
                          </Badge>
                        </div>
                        {ngo.upiId && (
                          <p className="text-xs text-muted-foreground mt-2">
                            UPI: {ngo.upiId}
                          </p>
                        )}
                      </div>
                      {selectedNgo?._id === ngo._id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <Button
              className="w-full"
              onClick={() => setStep('enter-details')}
              disabled={!selectedNgo}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Enter Donation Details */}
      {step === 'enter-details' && (
        <Card>
          <CardHeader>
            <CardTitle>Donation Details</CardTitle>
            <CardDescription>
              Donating to: <strong>{selectedNgo?.name}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount Selection */}
            <div>
              <Label>Select Amount</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {predefinedAmounts.map((amt) => (
                  <Button
                    key={amt}
                    variant={amount === amt ? 'default' : 'outline'}
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount('');
                    }}
                  >
                    ₹{amt}
                  </Button>
                ))}
              </div>
              <div className="mt-3">
                <Label>Or Enter Custom Amount</Label>
                <Input
                  type="number"
                  placeholder="Enter amount (₹10 - ₹1,00,000)"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setAmount(e.target.value);
                  }}
                  min={10}
                  max={100000}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2">
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="upi" id="upi" />
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="upi" className="flex-1 cursor-pointer">UPI</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="card" id="card" />
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer">Credit/Debit Card</Label>
                </div>
                <div className="flex items-center space-x-2 border p-3 rounded-lg">
                  <RadioGroupItem value="netbanking" id="netbanking" />
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="netbanking" className="flex-1 cursor-pointer">Net Banking</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Tax Benefit */}
            <div className="border p-4 rounded-lg bg-blue-50">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="tax-benefit"
                  checked={hasTaxBenefit}
                  onCheckedChange={(checked) => setHasTaxBenefit(checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="tax-benefit" className="cursor-pointer font-medium">
                    I want to claim 80G tax benefits
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get a tax receipt for deduction under Section 80G
                  </p>
                </div>
              </div>

              {hasTaxBenefit && (
                <div className="mt-4">
                  <Label>PAN Number *</Label>
                  <Input
                    placeholder="ABCDE1234F"
                    value={donorPAN}
                    onChange={(e) => setDonorPAN(e.target.value.toUpperCase())}
                    maxLength={10}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required for generating 80G tax receipt
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('select-ngo')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleDonate}
                disabled={loading || !amount || (hasTaxBenefit && !donorPAN)}
                className="flex-1"
              >
                {loading ? 'Processing...' : `Donate ₹${amount || '0'}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Payment Confirmation */}
      {step === 'payment' && donationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Donation Initiated
            </CardTitle>
            <CardDescription>Complete your payment to confirm the donation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Donation Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Donation Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NGO:</span>
                  <span className="font-medium">{donationResult.ngoName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium text-green-600">₹{donationResult.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">{paymentMethod.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Donation ID:</span>
                  <span className="font-medium">{donationResult.donationId}</span>
                </div>
                {hasTaxBenefit && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tax Benefit:</span>
                    <Badge variant="outline" className="text-green-600">
                      <Shield className="h-3 w-3 mr-1" />
                      80G Eligible
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Tax Benefit Info */}
            {hasTaxBenefit && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900 mb-2">80G Tax Benefits</h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>✓ You will receive an 80G tax receipt after payment confirmation</li>
                      <li>✓ Typically 50% of donation amount is tax deductible</li>
                      <li>✓ Use the receipt while filing income tax returns</li>
                      <li>✓ Receipt will be available in your donation history</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Link */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Payment Instructions
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                In a real application, you would be redirected to the payment gateway. For demo purposes, click the button below to simulate payment completion.
              </p>
              {paymentMethod === 'upi' && (
                <div className="text-xs bg-white p-3 rounded border">
                  <p className="font-mono break-all">{donationResult.paymentLink}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button 
                onClick={handleConfirmPayment} 
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Processing...' : 'Confirm Payment (Demo)'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/dashboard/donor/donation-history'} 
                className="w-full"
              >
                View Donation History
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DonateMoney;
