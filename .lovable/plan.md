

# Add Navigation Links to Price Map Popups

## Overview
Add Google Maps and Apple Maps navigation buttons to each marker popup on the Price Map, so users can get directions to any store.

## Changes

### `src/components/PriceMap.tsx`
- Import `Navigation` and `MapPin` icons from lucide-react
- Update the `<Popup>` content (lines 161-168) to add two link buttons below the store info:
  - **Google Maps**: `https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`
  - **Apple Maps**: `https://maps.apple.com/?daddr={lat},{lng}`
- Both open in `_blank` with `noopener noreferrer`
- Style as small pill buttons with icons, matching the glassmorphism aesthetic

### No other files affected
Single-file change to the popup template inside the markers loop.

