import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDeliverySponsors } from '@/data/sponsors';
import SponsorLogo from './SponsorLogo';
import { Truck } from 'lucide-react';

const DeliverySponsorSection = () => {
  const deliverySponsors = getDeliverySponsors();

  if (deliverySponsors.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Sponsored Deliveries
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          These deliveries are made possible by our generous logistics sponsors
        </p>
        <div className="flex flex-wrap gap-4">
          {deliverySponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
            >
              <SponsorLogo sponsor={sponsor} size="sm" showName />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DeliverySponsorSection;
