import { useEffect, useRef, useState } from 'react';

interface SponsorLogo {
  name: string;
  logo: string;
  alt: string;
}

const sponsorLogos: SponsorLogo[] = [
 
  {
    name: 'Infosys Foundation',
    logo: 'https://www.infosys.org/content/dam/infosys-web/en/infosys-foundation/Images/infosys-foundation-logo-blue.svg',
    alt: 'Infosys Foundation – CSR Partner',
  },
  {
    name: 'Reliance Industries',
    logo: 'https://rilstaticasset.akamaized.net/sites/default/files/2022-11/reliance-industries-ltd.png',
    alt: 'Reliance Industries – CSR Partner',
  },
  {
    name: 'Wipro Foundation',
    logo: 'https://www.wiprofoundation.org/wp-content/uploads/2021/11/wipro-main-logo2.png',
    alt: 'Wipro Foundation – CSR Partner',
  },
  
  {
    name: 'Mahindra Group',
    logo: 'https://1000logos.net/wp-content/uploads/2020/04/Mahindra-Logo.png',
    alt: 'Mahindra Group – CSR Partner',
  },
  {
    name: 'Swiggy',
    logo: 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/portal/static-assets/images/swiggy_logo_white.png',
    alt: 'Swiggy – Food & Logistics Partner',
  },
  {
    name: 'Zomato',
    logo: 'https://imgs.search.brave.com/mxtL4JPsZauDx_k8gi-x858fM_SbaRZ7FSg4qiwa-kY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy90/aHVtYi83Lzc1L1pv/bWF0b19sb2dvLnBu/Zy8yNTBweC1ab21h/dG9fbG9nby5wbmc',
    alt: 'Zomato – Food Donation Partner',
  },
  {
    name: 'Rapido',
    logo: 'https://imgs.search.brave.com/qxHuhoOgzLL9s9N7qBivMd80icHnAdBQKcQo5P9nATE/rs:fit:32:32:1:0/g:ce/aHR0cDovL2Zhdmlj/b25zLnNlYXJjaC5i/cmF2ZS5jb20vaWNv/bnMvZjNhNzUzZDk3/ZjMwNGNiZjJlZTZh/MDgxNzA2ZmZkYTlh/MjlhNDkyYTliMDRk/NDBiYjQ3NzE5MDM5/OWJmZjg4NS93d3cu/cmFwaWRvLmJpa2Uv',
    alt: 'Rapido – Mobility & Delivery Partner',
  },
];


const SponsorCarousel = () => {
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...sponsorLogos, ...sponsorLogos, ...sponsorLogos];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationFrameId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // Pixels per frame

    const scroll = () => {
      if (!isPaused && scrollContainer) {
        scrollPosition += scrollSpeed;
        
        // Reset scroll position for seamless loop
        const maxScroll = scrollContainer.scrollWidth / 3;
        if (scrollPosition >= maxScroll) {
          scrollPosition = 0;
        }
        
        scrollContainer.scrollLeft = scrollPosition;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPaused]);

  return (
    <div className="w-full bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Our Corporate Sponsors & CSR Partners
        </h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Partnering with industry leaders to create meaningful social impact
        </p>
        
        <div
          ref={scrollRef}
          className="overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          style={{ cursor: isPaused ? 'grab' : 'default' }}
        >
          <div className="flex gap-12 items-center" style={{ width: 'max-content' }}>
            {duplicatedLogos.map((sponsor, index) => (
              <div
                key={`${sponsor.name}-${index}`}
                className="flex-shrink-0 transition-all duration-300 hover:scale-110"
                style={{ width: '180px', height: '80px' }}
              >
                <div className="w-full h-full flex items-center justify-center p-4 bg-white dark:bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <img
                    src={sponsor.logo}
                    alt={sponsor.alt}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback for broken images
                      const target = e.target as HTMLImageElement;
                      target.src = `https://via.placeholder.com/180x80/4F46E5/FFFFFF?text=${sponsor.name}`;
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <p className="text-center text-sm text-muted-foreground mt-6">
          <span className="inline-block animate-pulse">●</span> Hover to pause
        </p>
      </div>
    </div>
  );
};

export default SponsorCarousel;
