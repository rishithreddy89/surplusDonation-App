/* Google Maps API utilities - using script loaded in index.html */

declare global {
  interface Window {
    google: any;
  }
}

let isLoaded = false;
let checkInterval: any = null;

export const loadGoogleMapsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      isLoaded = true;
      resolve();
      return;
    }

    // Check if Google Maps is already loaded
    // API key is embedded in index.html script tag

    // Poll for google maps to be available (script loaded via index.html)
    let attempts = 0;
    const maxAttempts = 50;
    
    checkInterval = setInterval(() => {
      attempts++;
      if (window.google && window.google.maps) {
        clearInterval(checkInterval);
        isLoaded = true;
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        reject(new Error('Google Maps failed to load'));
      }
    }, 100);
  });
};

export const isGoogleMapsLoaded = (): boolean => {
  return isLoaded && !!(window.google && window.google.maps);
};

export const createMap = (element: HTMLElement, options: any): any => {
  if (!isGoogleMapsLoaded()) {
    throw new Error('Google Maps not loaded');
  }
  return new window.google.maps.Map(element, options);
};

export const createMarker = (options: any): any => {
  if (!isGoogleMapsLoaded()) {
    throw new Error('Google Maps not loaded');
  }
  return new window.google.maps.Marker(options);
};

export const geocodeAddress = async (address: string): Promise<any> => {
  if (!isGoogleMapsLoaded()) {
    throw new Error('Google Maps not loaded');
  }

  const geocoder = new window.google.maps.Geocoder();
  
  try {
    const result = await geocoder.geocode({ address });
    if (result.results && result.results.length > 0) {
      return result.results[0].geometry.location;
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

export const calculateDistance = (
  origin: any,
  destination: any
): number => {
  if (!isGoogleMapsLoaded()) {
    throw new Error('Google Maps not loaded');
  }
  const originLatLng = origin.lat ? new window.google.maps.LatLng(origin.lat, origin.lng) : origin;
  const destLatLng = destination.lat ? new window.google.maps.LatLng(destination.lat, destination.lng) : destination;
  return window.google.maps.geometry.spherical.computeDistanceBetween(originLatLng, destLatLng) / 1000;
};

export const getDirections = async (
  origin: string | any,
  destination: string | any,
  travelMode: string = 'DRIVING'
): Promise<any> => {
  if (!isGoogleMapsLoaded()) {
    throw new Error('Google Maps not loaded');
  }

  const directionsService = new window.google.maps.DirectionsService();

  try {
    const result = await directionsService.route({
      origin,
      destination,
      travelMode,
    });
    return result;
  } catch (error) {
    console.error('Directions error:', error);
    return null;
  }
};

export const searchNearbyPlaces = async (
  location: any,
  radius: number,
  keyword: string
): Promise<any[]> => {
  if (!isGoogleMapsLoaded()) {
    throw new Error('Google Maps not loaded');
  }

  return new Promise((resolve, reject) => {
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    
    service.nearbySearch(
      {
        location,
        radius,
        keyword,
      },
      (results: any, status: any) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          reject(new Error(`Places search failed: ${status}`));
        }
      }
    );
  });
};
