

# HargaRakyat Design System Overhaul + Data Enhancement

## Overview
Transform HargaRakyat from a "typical vibe code webapp" into a premium Financial Intelligence aesthetic (Bloomberg Terminal-like but accessible). Update data sources with complete premise/item CSVs. Make Store Finder location-based using user geolocation + Haversine distance.

## 1. Data Enhancement (Pre-processing Script)

Run a Python script to:
- Download `lookup_premise.csv` (~4,385 premises) and `lookup_item.csv` (~757 items) from data.gov.my
- Generate updated `public/data/premises.json` and `public/data/items.json` with complete data
- Since premises lack lat/lng coordinates, use a **district-to-coordinates mapping table** (manually curated for ~100+ Malaysian districts) so each premise gets approximate coordinates based on its district, not just state centroid
- Update `cheapest_stores.json` to include all premises

## 2. Design System Overhaul

### Color Palette (NO gradients)
- **Primary**: Emerald Green `#059669` (trust, agriculture)
- **Accent**: Amber Gold `#F59E0B` (alerts, AI insights)
- **Background**: Deep Slate `#0F172A` with subtle radial gradient (center `#1E293B`, edges `#0F172A`)
- **Card**: Glassmorphism 2.0 — `rgba(30, 41, 59, 0.6)`, `backdrop-blur(16px)`, `1px border #334155`
- **Chart Up**: Emerald, **Chart Down**: Red, **Chart Neutral**: Amber

### Typography
- **UI elements**: Inter (already in use)
- **Price numbers & data points**: JetBrains Mono (add Google Font import)
- **Headings**: Space Grotesk (already in use)

### Files to update:
- **`src/index.css`**: Update CSS variables for new palette, add radial gradient background, add JetBrains Mono import, remove `text-gradient` utility (no gradients)
- **`tailwind.config.ts`**: Add `font-mono: ['JetBrains Mono', 'monospace']` to fontFamily

### Icons
- Replace all plain emoji usage with Lucide icons (already using lucide-react)
- Add pulsing dot animation for "Live" status indicators
- Ensure NO plain text emojis anywhere in the codebase (remove the checkmark emoji in GroceryOptimizer "Location Set ✓")

## 3. Store Finder: Location-Based Nearest Store

### Update `src/lib/geo.ts`:
- Add a `DISTRICT_COORDS` mapping (~100 districts with approximate lat/lng)
- Update premise data to include district-level coordinates

### Update `src/components/StoreFinder.tsx`:
- Add "Use My Location" button with `navigator.geolocation`
- Calculate real distance from user to each store using Haversine formula on district coords
- Sort results by distance (nearest first) when location is available
- Show distance badge on each store card ("~5.2 km away")

### Update `src/components/GroceryOptimizer.tsx`:
- Already has location support — update to use district-level coords instead of state centroids
- Remove the "✓" emoji, use a Lucide Check icon instead

## 4. Component Visual Updates

### All components get the new design treatment:
- **Cards**: Update `glass-card` class to use new glassmorphism spec (`rgba(30,41,59,0.6)`, `backdrop-blur-[16px]`, `border-[#334155]`)
- **Price numbers**: Add `font-mono` class (JetBrains Mono) to ALL price displays across PriceExplorer, PriceForecast, PriceChart, StoreFinder, GroceryOptimizer
- **Section headers**: More authoritative styling — larger, bolder, with subtle animated Lucide icons
- **Nav**: Update brand text to solid emerald (no gradient)
- **Background**: Add radial gradient to body/root

### Specific component files to update:
- `src/components/HeroSection.tsx` — remove `text-gradient`, use solid emerald, add pulsing "Live Data" indicator
- `src/components/PriceForecast.tsx` — font-mono on prices, new card styles
- `src/components/PriceChart.tsx` — font-mono on prices, new card styles
- `src/components/PriceExplorer.tsx` — font-mono on table prices
- `src/components/StoreFinder.tsx` — add geolocation, distance sorting, font-mono
- `src/components/GroceryOptimizer.tsx` — remove emoji, font-mono prices
- `src/components/PriceMap.tsx` — new card style, font-mono
- `src/components/Footer.tsx` — updated branding
- `src/pages/Index.tsx` — nav updated branding, radial bg

## 5. Files Summary

| File | Action |
|------|--------|
| `src/index.css` | Update palette, add JetBrains Mono, radial bg, remove gradient util |
| `tailwind.config.ts` | Add font-mono JetBrains Mono |
| `src/lib/geo.ts` | Add district-level coordinates map |
| `src/components/HeroSection.tsx` | New visual identity, no gradients, live indicator |
| `src/components/StoreFinder.tsx` | Add geolocation + distance sorting |
| `src/components/GroceryOptimizer.tsx` | Remove emoji, use district coords |
| `src/components/PriceForecast.tsx` | font-mono prices, new cards |
| `src/components/PriceChart.tsx` | font-mono prices, new cards |
| `src/components/PriceExplorer.tsx` | font-mono prices |
| `src/components/PriceMap.tsx` | New card style |
| `src/components/Footer.tsx` | Updated branding |
| `src/pages/Index.tsx` | Updated nav, radial bg |

