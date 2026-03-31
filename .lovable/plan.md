

# Review of Critique + New Features Plan

## Critique Verification

| Critique | Verdict | Reality |
|----------|---------|---------|
| "All data is mock" | **FALSE** | Data comes from real PriceCatcher CSVs (data.gov.my) — `items.json`, `prices_agg.json`, `premises.json`, `price_forecast.json` all contain real government price data from Oct 2025 – Mar 2026 |
| "AI advisor is fake" | **FALSE** | Edge function (`supabase/functions/chat/index.ts`) calls Lovable AI gateway (Gemini 3 Flash) with real streaming responses. It passes forecast context data. This is a real AI, not keyword matching |
| "No demo narrative" | **PARTIALLY TRUE** | Dashboard opens to generic KPIs. No guided "Ahmad's weekly grocery story" flow. Worth adding a narrative element |
| "Pulse ticker is cosmetic" | **PARTIALLY TRUE** | Ticker computes real MoM % changes from `pricesAgg` vs `pricesAggJan`. But it always shows the same 15 items. Could be more dynamic |

**Bottom line**: 2 of 4 critiques are factually wrong. The data is real and the AI is real. But the two feature suggestions are excellent for judging impact.

---

## New Features to Implement

### Feature 1: B40 Household Basket Tracker (+8 marks est.)

Add a "My Basket" section to DashboardHome that lets users pick 5-10 essential items with quantities, then shows:
- **Today's basket cost** (from `pricesAgg` current avg prices)
- **Last month's cost** (from `pricesAggJan` Jan prices)
- **14-day forecast cost** (from `price_forecast.json` end prices)
- **% change** with clear "Your weekly groceries will cost RM X vs RM Y last month (+Z%)" messaging
- Persist basket in `localStorage` so it survives page refreshes

**Files:**
| File | Action |
|------|--------|
| `src/components/BasketTracker.tsx` | Create — main basket component with item picker, cost comparison, forecast |
| `src/components/DashboardHome.tsx` | Update — add BasketTracker below KPI row |

### Feature 2: Best Time to Buy Indicator (+6 marks est.)

Add a 7-day calendar strip below the forecast chart showing price-colored days:
- **Green** = forecast price below current (cheap day)
- **Amber** = forecast price near current (average)
- **Red** = forecast price above current (expensive day)
- One-liner recommendation: "Best day to buy chicken this week: Wednesday (forecast RM 8.90)"

**Files:**
| File | Action |
|------|--------|
| `src/components/BestTimeToBuy.tsx` | Create — 7-day colored calendar strip with recommendation text |
| `src/components/PriceForecast.tsx` | Update — add BestTimeToBuy below the forecast chart |

---

## Technical Details

### BasketTracker
- Uses `useItemLookup`, `usePricesAgg`, `usePricesAggJan`, `usePriceForecast` hooks
- Item search with autocomplete (reuse pattern from GroceryOptimizer)
- Cost calculation: `sum(item.avg * qty)` for current, `sum(janAvg * qty)` for last month, `sum(forecastEnd * qty)` for forecast
- `localStorage` key: `hargarakyat-basket`
- Glassmorphism card with 3 cost columns side-by-side

### BestTimeToBuy
- Takes the selected item's forecast array (7 days)
- Compares each day's price to `last_price`
- Thresholds: <-1% = green, -1% to +1% = amber, >+1% = red
- Finds cheapest day and generates recommendation sentence
- Styled as a horizontal strip of 7 day cards

### File Summary (4 files)

| File | Action |
|------|--------|
| `src/components/BasketTracker.tsx` | Create |
| `src/components/BestTimeToBuy.tsx` | Create |
| `src/components/DashboardHome.tsx` | Update — add BasketTracker |
| `src/components/PriceForecast.tsx` | Update — add BestTimeToBuy |

