# NGO Finder Feature Documentation

## Overview
The Nearby NGO Finder is a comprehensive feature that allows users to discover NGOs in their area using Google Maps integration.

## Features Implemented

### 1. **Map Integration**
- Interactive Google Maps display
- Real-time user location detection
- Automatic map centering based on user location

### 2. **NGO Search**
- Uses Google Places API to find nearby NGOs
- Searches for: NGOs, charities, nonprofits, foundations
- Configurable search radius (1-50 km)
- Results sorted by distance

### 3. **Visual Markers**
- **Blue marker**: User's current location (pulsing)
- **Red markers**: Nearby NGOs
- **Green marker**: Selected NGO (bounces on selection)
- Smooth marker drop animation

### 4. **NGO Information Display**
- NGO Name
- Complete address
- Distance from user (in km)
- Phone number (if available)
- Rating (if available)
- Real-time info window on marker click

### 5. **NGO Selection**
- Click on map marker to select NGO
- Click on list item to select NGO
- Selected NGO highlighted in UI
- Automatic map pan and zoom to selected location

### 6. **Route Display**
- **"Show Route" button**: Calculate and display route from user to NGO
- Uses Google Directions API
- Shows:
  - Blue route line on map
  - Total distance
  - Estimated travel time
  - Turn-by-turn directions (in Directions result)
- **"Clear Route" button**: Remove route from map

### 7. **Responsive List View**
- Scrollable list of all nearby NGOs
- Sorted by proximity
- Shows key details:
  - NGO name
  - Address
  - Phone (if available)
  - Star rating (if available)
  - Distance badge
- Click to select and view on map

## User Flow

### Step 1: Access the Feature
- **Donors**: Navigate to "Find NGOs" in sidebar
- **NGOs**: Navigate to "Find Partners" in sidebar

### Step 2: Location Detection
- On page load, browser requests location permission
- User grants permission
- Map centers on user's location
- Blue marker appears at user location
- Automatic search for nearby NGOs begins

### Step 3: Browse Results
- View NGOs on map (red markers)
- View NGOs in scrollable list below map
- See total count badge (top-right of map)

### Step 4: Select an NGO
**Option A - Click Map Marker:**
- Marker turns green and bounces
- Info window popup shows details
- Map zooms to NGO location

**Option B - Click List Item:**
- List item gets highlighted border
- Map pans to NGO location
- Marker activates

### Step 5: Get Directions
- Click **"Show Route"** button
- Blue route line appears on map
- Toast shows distance and time
- Route follows roads (driving directions)

### Step 6: Refine Search
- Adjust search radius slider
- Click **"Search"** button to refresh results
- Click **navigation icon** to re-center on user

## API Requirements

### Google Maps APIs Enabled
1. **Maps JavaScript API**
2. **Places API** (for nearby search)
3. **Directions API** (for routing)
4. **Geocoding API** (for address resolution)

### Configuration
- API key set in `.env` file: `VITE_GOOGLE_MAPS_API_KEY`
- Script loads with libraries: `places,geometry`

## Technical Details

### Key Functions
- `getUserLocation()`: Gets user's GPS coordinates
- `searchNearbyNGOs()`: Queries Google Places for NGOs
- `handleNGOSelect()`: Manages NGO selection and UI updates
- `showRouteToNGO()`: Calculates and displays directions
- `clearRoute()`: Removes route from map
- `calculateDistance()`: Haversine formula for distance calculation

### State Management
- User location stored in state
- Selected NGO tracked
- Route visibility toggle
- Markers array for cleanup

### Performance
- Markers reused/cleared on new search
- Single info window instance
- Debounced search on radius change

## UI Components Used
- Card, CardHeader, CardContent (shadcn/ui)
- Button, Input, Badge, Alert
- Lucide icons: MapPin, Navigation, Search, Route, Phone

## Error Handling
- Location permission denied → Clear error message
- No NGOs found → Helpful toast notification
- API errors → Graceful fallback with user feedback
- Network issues → Error alerts with retry option

## Accessibility
- Keyboard navigation support
- Screen reader compatible labels
- High contrast marker colors
- Clear visual indicators for states

## Mobile Responsiveness
- Touch-friendly markers and controls
- Scrollable list view
- Responsive map height
- Bottom sheet style for mobile (future enhancement)

## Future Enhancements (Optional)
- Filter by NGO type/category
- Show NGO photos
- Display working hours
- Add to favorites
- Share NGO details
- Multi-stop routing
- Cluster markers for dense areas
- Bottom sheet UI for mobile
- Transit/walking directions options

## Testing Checklist
- ✅ Location permission prompt works
- ✅ Map loads and displays correctly
- ✅ User marker appears at correct location
- ✅ NGO search returns results
- ✅ Markers appear on map
- ✅ List displays all NGOs
- ✅ Clicking marker shows info window
- ✅ Clicking list item selects NGO
- ✅ Route calculation works
- ✅ Route displays on map
- ✅ Clear route removes line
- ✅ Search radius adjustment works
- ✅ Error messages display correctly

## Usage Example

```tsx
import NearbyNGOFinder from "@/components/donor/NearbyNGOFinder";

// In your dashboard route
<Route path="find-ngos" element={<NearbyNGOFinder />} />
```

## Support
For issues or questions, refer to:
- Google Maps API documentation
- Google Places API documentation
- Google Directions API documentation
