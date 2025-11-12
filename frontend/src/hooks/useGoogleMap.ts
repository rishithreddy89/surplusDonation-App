import { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsScript, createMap } from '@/lib/googleMaps';

export const useGoogleMap = (options: any = {}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const initMap = async () => {
      try {
        setLoading(true);
        await loadGoogleMapsScript();

        if (!isMounted || !mapRef.current) return;

        // Small delay to ensure DOM is ready
        timeoutId = setTimeout(() => {
          if (!mapRef.current || !isMounted) return;

          const map = createMap(mapRef.current, {
            center: { lat: 19.0760, lng: 72.8777 },
            zoom: 12,
            ...options,
          });

          mapInstanceRef.current = map;
          setLoading(false);
        }, 100);
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load map');
          setLoading(false);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);

      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current = null;
        } catch (e) {
          console.error('Error cleaning map:', e);
        }
      }
    };
  }, []);

  return { mapRef, map: mapInstanceRef.current, loading, error };
};
