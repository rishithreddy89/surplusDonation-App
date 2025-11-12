# Google Maps Integration Setup Guide

## 1. Get Your API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
   - Geometry API

4. Create an API key:
   - Go to **Credentials** → **Create Credentials** → **API Key**
   - Copy your API key

## 2. Restrict Your API Key (Important for Security)

### Application Restrictions:
- Choose **HTTP referrers (web sites)**
- Add your domains:
  - `http://localhost:*/*` (for development)
  - `https://yourdomain.com/*` (for production)

### API Restrictions:
- Select **Restrict key**
- Enable only the APIs you need:
  - Maps JavaScript API
  - Places API
  - Directions API
  - Geocoding API
  - Geometry API

## 3. Configure Your Environment

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   VITE_GOOGLE_MAPS_MAP_ID=DEMO_MAP_ID
   ```

3. **Never commit `.env` to version control!** It's already in `.gitignore`.

## 4. Get a Map ID (Optional but Recommended)

1. In Google Cloud Console, go to **Map Management** → **Map IDs**
2. Click **Create Map ID**
3. Choose **JavaScript** as the platform
4. Configure map settings (optional styling)
5. Copy the Map ID and add it to your `.env` file

## 5. Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The maps will load automatically on:
   - **TrackDonation** page (donor dashboard)
   - **RequestTracking** page (NGO dashboard)
   - **RouteMap** page (logistics dashboard)

## 6. Features Implemented

### TrackDonation (Donor)
- Shows pickup location marker
- Shows delivery location marker (if available)
- Draws route between pickup and delivery
- Updates based on donation status

### RequestTracking (NGO)
- Click "View on Map" to see pickup location
- Modal with interactive map
- Shows detailed address information

### RouteMap (Logistics)
- Full route optimization
- Multiple waypoints (pickups and deliveries)
- Directions rendered on map
- "Open in Google Maps" button for navigation

## 7. API Usage & Costs

- Google Maps offers **$200 free credit per month**
- After that, pricing applies per API call
- Monitor your usage in Google Cloud Console
- Set up billing alerts to avoid unexpected charges

### Cost-Saving Tips:
- Cache geocoding results when possible
- Use Map IDs to get better pricing
- Restrict API key to prevent unauthorized use
- Implement rate limiting on your backend

## 8. Troubleshooting

### "Google Maps not loaded" Error:
- Check that your API key is correctly set in `.env`
- Verify the API key in Google Cloud Console
- Ensure all required APIs are enabled
- Check browser console for specific errors

### Map Not Showing:
- Check that the container has a defined height
- Verify network requests in browser DevTools
- Check for JavaScript errors in console
- Ensure API key restrictions allow your domain

### Geocoding Failures:
- Verify addresses are valid and specific enough
- Check Geocoding API is enabled
- Look for error messages in console
- Try with a more specific address format

## 9. Environment Variables

Required in `.env`:
```
VITE_GOOGLE_MAPS_API_KEY=your_key
VITE_GOOGLE_MAPS_MAP_ID=your_map_id (optional)
VITE_API_URL=http://localhost:5000/api
```

## 10. Production Deployment

1. Add production domain to API key restrictions
2. Use environment variables in your hosting platform
3. Never expose API keys in client-side code
4. Consider using a backend proxy for additional security
5. Monitor API usage and costs

## Support

For issues or questions:
- Check Google Maps Platform documentation
- Review browser console for errors
- Verify API quotas in Google Cloud Console
