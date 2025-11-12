import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getActiveAdvertisements, trackAdvertisementClick } from '@/lib/api';

interface Advertisement {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  targetRoles: string[];
  isActive: boolean;
  createdAt: string;
}

interface AdvertisementBannerProps {
  userRole: 'donor' | 'ngo' | 'logistics';
}

export const AdvertisementBanner = ({ userRole }: AdvertisementBannerProps) => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchAdvertisements();
  }, [userRole]);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 8000); // Rotate every 8 seconds
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const fetchAdvertisements = async () => {
    try {
      const response = await getActiveAdvertisements();
      if (response.success) {
        setAds(response.data);
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error);
    }
  };

  const handleAdClick = async (adId: string) => {
    try {
      await trackAdvertisementClick(adId);
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  if (!isVisible || ads.length === 0) return null;

  const currentAd = ads[currentAdIndex];

  return (
    <div className="mb-6 relative">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-4 relative overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 z-10"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>

        {currentAd.imageUrl ? (
          <div className="flex gap-4 items-center">
            <img
              src={currentAd.imageUrl}
              alt={currentAd.title}
              className="w-32 h-32 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{currentAd.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{currentAd.description}</p>
              {currentAd.link && (
                <a
                  href={currentAd.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                  onClick={() => handleAdClick(currentAd._id)}
                >
                  Learn More →
                </a>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-1">{currentAd.title}</h3>
            <p className="text-sm text-muted-foreground mb-2">{currentAd.description}</p>
            {currentAd.link && (
              <a
                href={currentAd.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
                onClick={() => handleAdClick(currentAd._id)}
              >
                Learn More →
              </a>
            )}
          </div>
        )}

        {ads.length > 1 && (
          <div className="flex gap-1 justify-center mt-3">
            {ads.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentAdIndex ? 'w-6 bg-primary' : 'w-1.5 bg-primary/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
