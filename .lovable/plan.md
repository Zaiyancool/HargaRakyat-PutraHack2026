

# HargaRakyat Full Bloomberg Terminal Redesign

## Overview
Transform the current scroll-based layout into a Bloomberg Terminal-inspired dashboard with sidebar navigation, sticky header, Bento Grid layout, and a live Price Pulse Ticker. Product images are KIV'd for now.

## Architecture Change

```text
CURRENT:                          NEW:
┌─────────────────┐              ┌────────────────────────────────┐
│ Top Nav Bar     │              │ Price Pulse Ticker (scrolling) │
│ Hero Section    │              ├──────┬─────────────────────────┤
│ Explorer        │              │      │ Header (breadcrumb,     │
│ Forecast        │              │ Side │  search, logo)          │
│ Optimizer       │              │ bar  ├─────────────────────────┤
│ Map             │              │      │ Bento Grid Content      │
│ Timeline        │              │ 240px│ (changes per section)   │
│ Stores          │              │      │                         │
│ Footer          │              │      │                         │
└─────────────────┘              └──────┴─────────────────────────┘
```

## Files & Changes

### 1. New Components

| File | Purpose |
|------|---------|
| `src/components/AppSidebar.tsx` | Sidebar nav with icons, active state (emerald left border), collapsible on mobile. Sections: Dashboard, Explorer, Forecast, Basket, Map, Timeline, Stores |
| `src/components/DashboardHeader.tsx` | Sticky header with logo, search bar, section breadcrumb |
| `src/components/PriceTicker.tsx` | Horizontal scrolling ticker showing top 10 items with price + trend arrows. CSS marquee animation. Data from pricesAgg + pricesAggJan to calculate MoM change |
| `src/components/DashboardHome.tsx` | Bento Grid home view — combines KPI cards (avg basket cost, items tracked, stability score) + mini forecast chart + mini price map + top movers table in a responsive grid |

### 2. Layout Refactor

**`src/pages/Index.tsx`** — Complete rewrite:
- Wrap in `SidebarProvider` with shadcn Sidebar
- Use React state to track active section (no more anchor scrolling — render one section at a time)
- Sidebar controls which section component renders in main area
- Price Ticker fixed at top above everything
- Mobile: sidebar becomes offcanvas drawer via `SidebarTrigger`

### 3. Updated Existing Components
Each section component loses its `<section className="container py-12">` wrapper and header (those move to the layout). They become pure content:

| File | Changes |
|------|---------|
| `src/components/HeroSection.tsx` | Remove — replaced by DashboardHome |
| `src/components/PriceExplorer.tsx` | Remove section wrapper, keep table + filters |
| `src/components/PriceForecast.tsx` | Remove section wrapper |
| `src/components/PriceChart.tsx` | Remove section wrapper |
| `src/components/PriceMap.tsx` | Remove section wrapper |
| `src/components/StoreFinder.tsx` | Remove section wrapper |
| `src/components/GroceryOptimizer.tsx` | Remove section wrapper |
| `src/components/Footer.tsx` | Move into sidebar bottom or small footer bar |

### 4. Styling Updates

**`src/index.css`** — Add:
- Ticker marquee keyframes (`scroll-left`)
- Sidebar active state styles (emerald left border + bg highlight)
- Bento grid utility classes

**`tailwind.config.ts`** — Add:
- `scroll-left` keyframe for ticker animation

### 5. Price Pulse Ticker Detail
- Full-width bar at absolute top, dark bg (#0B1120), 36px height
- Red pulsing dot + "LIVE PRICES" label
- Horizontal scroll showing: `AYAM STANDARD RM9.46 ↑2.3% ▸ BERAS RM2.80 ↓0.5% ▸ ...`
- Prices in JetBrains Mono, green for up, amber for down
- Calculates % change by comparing `pricesAgg` (Feb) vs `pricesAggJan` (Jan)
- CSS animation: `scroll-left 30s linear infinite`

### 6. Dashboard Home (Bento Grid)
Responsive grid layout:
```text
Desktop (3 cols):
┌──────────┬──────────┬──────────┐
│ KPI: Avg │ KPI: Top │ KPI:     │
│ Basket   │ Mover    │ Items    │
├──────────┴──────────┼──────────┤
│ Mini Forecast Chart │ Top 5    │
│ (most volatile item)│ Movers   │
├─────────────────────┴──────────┤
│ Price Explorer (compact, 10    │
│ rows, top items)               │
└────────────────────────────────┘
```

### 7. Sidebar Navigation
Using shadcn `Sidebar` component with `collapsible="icon"`:
- Items with Lucide icons: LayoutDashboard, BarChart3, Brain, ShoppingCart, Map, Activity, Store
- Active item: emerald left border + subtle bg highlight
- Bottom: AI Chat button + data.gov.my attribution
- Mobile: offcanvas with hamburger trigger in header

## Implementation Order
1. Create `PriceTicker.tsx` + `AppSidebar.tsx` + `DashboardHeader.tsx`
2. Create `DashboardHome.tsx` (Bento Grid)
3. Refactor `Index.tsx` to use sidebar layout
4. Strip section wrappers from existing components
5. Update `index.css` + `tailwind.config.ts`
6. Move `AIChatAdvisor` floating button to work within new layout

## Files Summary (10 files)

| File | Action |
|------|---------|
| `src/components/PriceTicker.tsx` | Create |
| `src/components/AppSidebar.tsx` | Create |
| `src/components/DashboardHeader.tsx` | Create |
| `src/components/DashboardHome.tsx` | Create |
| `src/pages/Index.tsx` | Rewrite |
| `src/components/PriceExplorer.tsx` | Update (remove wrapper) |
| `src/components/PriceForecast.tsx` | Update (remove wrapper) |
| `src/components/PriceChart.tsx` | Update (remove wrapper) |
| `src/components/PriceMap.tsx` | Update (remove wrapper) |
| `src/components/StoreFinder.tsx` | Update (remove wrapper) |
| `src/components/GroceryOptimizer.tsx` | Update (remove wrapper) |
| `src/components/HeroSection.tsx` | Delete (replaced by DashboardHome) |
| `src/index.css` | Update |
| `tailwind.config.ts` | Update |

