import { Sponsor } from '@/types/sponsor';
import { Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SponsoredDeliveryBadgeProps {
  sponsor: Sponsor;
}

const SponsoredDeliveryBadge = ({ sponsor }: SponsoredDeliveryBadgeProps) => {
  return (
    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
      <Truck className="w-3 h-3 mr-1" />
      Sponsored Delivery by {sponsor.name}
    </Badge>
  );
};

export default SponsoredDeliveryBadge;
