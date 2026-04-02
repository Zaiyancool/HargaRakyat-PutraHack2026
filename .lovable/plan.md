

# Combine Price Map + Store Finder with Store Type Filter

## What Changes

Merge `PriceMap.tsx` and `StoreFinder.tsx` into a single unified page. The layout will show **List View first, then Map View below** — both sharing the same filters. Add a new **Store Category** filter based on `premise_type` from the CSV (e.g., Pasar Basah, Hypermarket, Kedai Runcit, etc.).

## Layout

```text
┌──────────────────────────────────────────────────┐
│  🗺️ Price Map & Store Finder                     │
│  Find cheapest stores and visualize prices        │
├──────────────────────────────────────────────────┤
│  [📍 Use My Location] [Search items...]           │
│  [Category ▾] [Store Type ▾] [State ▾]           │
│  [Select an item... ▾]                            │
├──────────────────────────────────────────────────┤
│  📋 STORE LIST (ranked cards, top 20)             │
│  ┌─────────────────────────────────────────────┐ │
│  │ #1  LOTUS'S CHERAS  RM 2.50  ~1.2km        │ │
│  │     Hypermarket · Cheras, W.P. Kuala Lumpur │ │
│  ├─────────────────────────────────────────────┤ │
│  │ #2  PASAR BESAR IPOH  RM 2.65              │ │
│  │     Pasar Basah · Kinta, Perak             │ │
│  └─────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│  🗺️ MAP VIEW (Leaflet with colored markers)      │
│  ┌─────────────────────────────────────────────┐ │
│  │         [OpenStreetMap]                     │ │
│  │    🟢  🟠  🔴                                │ │
│  └─────────────────────────────────────────────┘ │
│  ● Cheapest  ● Mid-range  ● Expensive           │
└──────────────────────────────────────────────────┘
```

## Store Type Categories

From `lookup_premise.csv` `premise_type` column:
- **HYPERMARKET** (Lotus's, Tesco, etc.)
- **PASAR RAYA / SUPERMARKET** (Giant, Jusco, etc.)
- **PASAR BASAH** (wet markets)
- **PASAR MINI** (mini markets)
- **KEDAI RUNCIT** (convenience stores)

These will populate a new `PREMISE_TYPES` constant in `pricecatcher.ts` and appear as a filter dropdown.

## Files to Change

| File | Action |
|------|--------|
| `src/components/PriceMap.tsx` | **Rewrite** — merge StoreFinder logic in. List view above map. Add store type filter. Add geolocation button. |
| `src/components/StoreFinder.tsx` | **Delete** — functionality absorbed into PriceMap |
| `src/lib/pricecatcher.ts` | **Add** `PREMISE_TYPES` array constant |
| `src/pages/Index.tsx` | **Update** — remove `stores` case, keep only `map` |
| `src/components/landing/TopNav.tsx` | **Update** — remove Store Finder nav link if present |

## Key Implementation Details

- Both list and map share the same `markers`/`storeResults` array, filtered by item + state + store type + search
- Store type filter: `<Select>` dropdown with "All Types" default, options from `PREMISE_TYPES`
- Filter logic: `if (selectedType !== "all" && premise.t !== selectedType) return null`
- Geolocation button from StoreFinder moves into the unified filter bar
- Distance sorting when location is set; price sorting otherwise
- List renders first (scrollable, max 20 stores), map renders below

