

# HargaRakyat Landing Page Redesign — Kraken-Inspired

## Overview
Replace the current sidebar dashboard layout with a Kraken-style landing page as the home route (`/`). The dashboard features move to a separate `/dashboard` route. The landing page follows Kraken's exact layout patterns: top nav bar, hero with email signup + phone mockup, stats bar, item grid with category tabs, "Why HargaRakyat" feature cards, and CTA footer. Blue replaces purple throughout.

## Architecture

```text
CURRENT:                              NEW:
┌──────────────────────┐              ┌─────────────────────────────┐
│ Ticker               │              │ /  = Landing Page           │
│ Sidebar + Dashboard  │              │   TopNav (logo, links,      │
│ (all features in one │              │     Sign In, Log In)        │
│  sidebar-driven SPA) │              │   Hero (headline + phone    │
│                      │              │     mockup + email input)   │
│                      │              │   Stats bar (items, avg     │
│                      │              │     price, records)         │
│                      │              │   Item Grid + category tabs │
│                      │              │   "Why HargaRakyat" cards   │
│                      │              │   CTA + Footer              │
│                      │              ├─────────────────────────────┤
│                      │              │ /dashboard = Current layout │
│                      │              │   (Sidebar + Ticker + all   │
│                      │              │    features as-is)          │
└──────────────────────┘              └─────────────────────────────┘
```

## Design System Changes

### Typography (Kraken-inspired)
- **Headings**: `Inter` at 900 weight (Black) — Kraken uses very heavy, bold Inter-style headings
- **Body**: `Inter` at 400/500
- **Data/prices**: `JetBrains Mono` (keep existing)
- Font sizes: Hero H1 at `text-5xl md:text-7xl`, section headings at `text-3xl md:text-4xl font-black`

### Color (Blue instead of Purple)
- Primary: `#1558E0` (rich blue — already set)
- CTA buttons: solid blue `bg-primary text-white rounded-lg px-6 py-3`
- Background: `#F8FAFC` (very light gray, like Kraken's off-white)
- Cards: pure white with subtle border, rounded-2xl
- Nav: white with bottom border

### Layout Principles (matching Kraken)
- Max-width container: `max-w-7xl mx-auto px-6`
- Very generous spacing: `py-20 md:py-28` between sections
- Clean grid: 7-column item grid with category tabs above
- Feature cards: 3-column grid with rounded-2xl cards

## New Files

### 1. `src/pages/Landing.tsx`
Main landing page component that composes all sections. Scrollable full-page layout.

### 2. `src/components/landing/TopNav.tsx`
- Fixed top nav bar, white background, subtle bottom border
- Left: "HargaRakyat" logo text (bold)
- Center: nav links — Dashboard, Map, Forecast, Explorer
- Right: Search icon, Sign In, Log In buttons
- Sign In = outline button, Log In = solid blue button
- Mobile: hamburger menu with sheet/drawer

### 3. `src/components/landing/HeroSection.tsx`
- Left side: Bold headline "Plan your grocery shopping", subtitle "First forecasting daily grocery price in Malaysia", email input + "Sign Up" CTA button
- Right side: Phone mockup frame (CSS-only, showing a mini preview of the dashboard or a static chart illustration)
- Below hero: stats bar (3 stats in a rounded pill container)
  - Items tracked (from real data count)
  - Avg item price (calculated from pricesAgg)
  - Total records (summed from pricesAgg)

### 4. `src/components/landing/ItemGrid.tsx`
- Heading: "Which item do you want to purchase today?"
- Category tabs: Popular Food, Vegetable, Fruit, Seafood (filter by item `k` field)
- 3-row, 7-column grid of item cards (like Kraken's crypto grid)
- Each card: item name, current price, MoM % change (green/red)
- Horizontal auto-scrolling rows with fade edges
- "Sign up" CTA button below

### 5. `src/components/landing/WhySection.tsx`
- Heading: "Why HargaRakyat?"
- 3 feature cards in a grid (like Kraken's Simplicity/Education/Service)
  - **Real-Time Prices** — Track prices across 10,000+ premises updated monthly from KPDN
  - **AI Forecast** — ML-powered 14-day price predictions to plan your shopping
  - **Smart Savings** — Find the cheapest stores near you and optimize your basket
- Each card: title, description, outline CTA button
- "Get started with HargaRakyat" CTA below

### 6. `src/components/landing/LandingFooter.tsx`
- Minimal footer with data.gov.my attribution, PutraHack 2026 mention
- Links to Dashboard sections

## Modified Files

### `src/App.tsx`
- Add route: `/` → `Landing` page
- Move current Index to `/dashboard` route
- Add `/signin` and `/login` placeholder routes (just UI for now, Supabase later)

### `src/pages/Index.tsx`
- Rename/keep as the dashboard page, now at `/dashboard` route
- No structural changes to the dashboard itself

### `src/index.css`
- Update `--font-heading` to use Inter with weight 900
- Add landing-specific utilities (phone mockup frame, grid fade edges)
- Keep all existing dashboard styles intact

### `tailwind.config.ts`
- Update `fontFamily.heading` to `['Inter', 'sans-serif']` for Kraken-style heavy headings
- Keep body as Inter, mono as JetBrains Mono

## Implementation Order
1. Create landing components (TopNav, HeroSection, ItemGrid, WhySection, LandingFooter)
2. Create Landing.tsx page composing them
3. Update App.tsx routing (/ = Landing, /dashboard = current Index)
4. Update index.css and tailwind.config.ts for typography
5. All Sign In / Log In buttons are placeholder links for now — Supabase auth setup later

## Files Summary (9 files)

| File | Action |
|------|--------|
| `src/pages/Landing.tsx` | Create |
| `src/components/landing/TopNav.tsx` | Create |
| `src/components/landing/HeroSection.tsx` | Create |
| `src/components/landing/ItemGrid.tsx` | Create |
| `src/components/landing/WhySection.tsx` | Create |
| `src/components/landing/LandingFooter.tsx` | Create |
| `src/App.tsx` | Update — add Landing route at `/`, move dashboard to `/dashboard` |
| `src/index.css` | Update — add landing utilities |
| `tailwind.config.ts` | Update — Inter for headings |

