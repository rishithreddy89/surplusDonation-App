import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  Building,
  Tag,
  FileText,
  Megaphone,
  Truck,
  Package,
  Map,
  Headphones,
  BarChart,
  Gift,
  Share2,
  Ticket,
  Users,
  TrendingUp,
  ArrowLeft,
  CheckCircle,
  Mail,
  Phone,
  Briefcase,
} from 'lucide-react';
import { sponsorshipTiers, getFeaturedSponsors } from '@/data/sponsors';
import SponsorLogo from '@/components/ui/SponsorLogo';

const iconMap: any = {
  Award,
  Building,
  Tag,
  FileText,
  Megaphone,
  Truck,
  Package,
  Map,
  Headphones,
  BarChart,
  Gift,
  Share2,
  Ticket,
  Users,
  TrendingUp,
};

const SponsorInfo = () => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    sponsorshipType: '',
    message: '',
  });

  const featuredSponsors = getFeaturedSponsors();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with backend API
    console.log('Sponsor registration:', formData);
    setFormSubmitted(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (formSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-green-500/20 bg-green-50 dark:bg-green-950/20">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                <h2 className="text-2xl font-bold">Thank You for Your Interest!</h2>
                <p className="text-muted-foreground">
                  We've received your sponsorship inquiry. Our partnerships team will contact you within 24-48 hours.
                </p>
                <div className="flex gap-4 justify-center mt-6">
                  <Button onClick={() => navigate('/')}>Return Home</Button>
                  <Button variant="outline" onClick={() => setFormSubmitted(false)}>
                    Submit Another
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20 mb-6"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Be a Sponsor</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            Partner with us to make a lasting impact on food security and community welfare
          </p>
        </div>
      </div>

      {/* Current Sponsors */}
      {featuredSponsors.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Our Valued Partners</h2>
            <p className="text-muted-foreground">
              Join these amazing organizations making a difference
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {featuredSponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="p-6 bg-white dark:bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <SponsorLogo sponsor={sponsor} size="lg" showName />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sponsorship Tiers */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Sponsorship Opportunities</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the sponsorship type that aligns with your corporate social responsibility goals
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {sponsorshipTiers.map((tier) => (
            <Card
              key={tier.type}
              className={`hover:shadow-lg transition-all cursor-pointer ${
                selectedTier === tier.type ? 'border-primary shadow-lg' : ''
              }`}
              onClick={() => {
                setSelectedTier(tier.type);
                setFormData({ ...formData, sponsorshipType: tier.title });
              }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {tier.type === 'corporate' && <Building className="w-5 h-5" />}
                  {tier.type === 'delivery' && <Truck className="w-5 h-5" />}
                  {tier.type === 'coupon' && <Gift className="w-5 h-5" />}
                  {tier.title}
                </CardTitle>
                <CardDescription>{tier.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tier.benefits.map((benefit, idx) => {
                    const Icon = iconMap[benefit.icon];
                    return (
                      <div key={idx} className="flex items-start gap-2">
                        <Icon className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{benefit.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {benefit.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button className="w-full mt-6" variant={selectedTier === tier.type ? 'default' : 'outline'}>
                  {tier.ctaText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Registration Form */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Register as a Sponsor</CardTitle>
            <CardDescription>
              Fill out the form below and our team will get in touch with you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Company Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="companyName"
                      name="companyName"
                      placeholder="Your Company"
                      className="pl-10"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPerson">
                    Contact Person <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    placeholder="Full Name"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="contact@company.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      className="pl-10"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sponsorshipType">
                  Interested In <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sponsorshipType"
                  name="sponsorshipType"
                  placeholder="Select a sponsorship tier above"
                  value={formData.sponsorshipType}
                  onChange={handleInputChange}
                  required
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us more about your CSR goals and how you'd like to partner with us..."
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                />
              </div>

              {!selectedTier && (
                <Alert>
                  <AlertDescription>
                    Please select a sponsorship tier above to continue
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={!selectedTier}>
                Submit Sponsorship Inquiry
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Why Partner Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <h3 className="text-2xl font-bold mb-6 text-center">Why Partner With Us?</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h4 className="font-semibold mb-2">Meaningful Impact</h4>
                <p className="text-sm text-muted-foreground">
                  Directly contribute to reducing food waste and fighting hunger
                </p>
              </div>
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h4 className="font-semibold mb-2">Brand Visibility</h4>
                <p className="text-sm text-muted-foreground">
                  Reach thousands of socially-conscious donors and volunteers
                </p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h4 className="font-semibold mb-2">Measurable Results</h4>
                <p className="text-sm text-muted-foreground">
                  Receive detailed impact reports and analytics
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SponsorInfo;
