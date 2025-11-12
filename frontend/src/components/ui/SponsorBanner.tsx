import { getCorporateSponsors } from '@/data/sponsors';
import SponsorLogo from './SponsorLogo';

const SponsorBanner = () => {
  const sponsors = getCorporateSponsors();

  if (sponsors.length === 0) return null;

  return (
    <div className="bg-muted/50 py-8 border-y">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground mb-4">
          Proud to be supported by
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {sponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="transition-opacity hover:opacity-80"
            >
              <SponsorLogo sponsor={sponsor} size="md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SponsorBanner;
