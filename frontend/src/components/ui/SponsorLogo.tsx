import { Sponsor } from '@/types/sponsor';

interface SponsorLogoProps {
  sponsor: Sponsor;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
}

const SponsorLogo = ({ sponsor, size = 'md', showName = false }: SponsorLogoProps) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
  };

  return (
    <div className="flex items-center gap-2">
      <img
        src={sponsor.logo}
        alt={`${sponsor.name} logo`}
        className={`${sizeClasses[size]} object-contain`}
      />
      {showName && (
        <span className="text-sm font-medium text-muted-foreground">
          {sponsor.name}
        </span>
      )}
    </div>
  );
};

export default SponsorLogo;
