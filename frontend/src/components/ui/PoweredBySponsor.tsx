import { Sponsor } from '@/types/sponsor';
import { Award } from 'lucide-react';

interface PoweredBySponsorProps {
  sponsor: Sponsor;
  variant?: 'inline' | 'badge';
}

const PoweredBySponsor = ({ sponsor, variant = 'inline' }: PoweredBySponsorProps) => {
  if (variant === 'badge') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
        <Award className="w-3 h-3" />
        <span>Powered by {sponsor.name}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <Award className="w-3 h-3" />
      <span>Powered by</span>
      <img
        src={sponsor.logo}
        alt={sponsor.name}
        className="h-4 object-contain"
      />
    </div>
  );
};

export default PoweredBySponsor;
