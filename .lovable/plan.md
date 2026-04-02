

# Comprehensive Test Report & Fix Plan

## Test Summary

Tested all 7 sections: Dashboard, Map, Forecast, Explorer, News, Optimizer, and Item Modal. Found **3 bugs** and **2 minor issues**.

---

## BUG 1: Forecast Chart Y-Axis Labels Truncated (HIGH)

**Where**: Forecast → View detail for any high-price item (e.g., Sotong Kering ~RM99)
**What**: All Y-axis tick labels display "RM99" because `width={50}` is too narrow. For prices like RM99.63, `toFixed(0)` produces "RM100" which gets clipped to "RM99" by the 50px column width.
**Fix**: In `src/components/PriceForecast.tsx` line 447, increase `width={50}` to `width={65}` so labels like "RM100" render fully.

## BUG 2: Explorer Shows "Feb 2026" Instead of "Mar 2026" (MEDIUM)

**Where**: Explorer page, data period label
**What**: Hardcoded string `Feb 2026` on line 89 of `src/components/PriceExplorer.tsx`. The data was regenerated for March 2026 but the label was never updated.
**Fix**: Change `Feb 2026` to `Mar 2026` on line 89.

## BUG 3: RSS Feed 422 Errors (LOW)

**Where**: News page network requests
**What**: The RSS-to-JSON API calls use a `count` parameter that requires a paid API key, returning 422. The app falls back to static `news_context.json` so it still works, but the errors appear in network logs.
**Fix**: Remove the `&count=5` query parameter from RSS URLs in `src/lib/pricecatcher.ts`, or handle at the fetch level.

---

## PASSED TESTS (No Issues)

| Section | Status | Notes |
|---------|--------|-------|
| Dashboard KPI cards | PASS | Market avg RM15.67, trending/cheapest cards render correctly |
| Price Ticker | PASS | Live scrolling ticker with % changes |
| 1-Year Price Overview | PASS | Chart shows Mar '25 – Mar '26, KPIs correct (Overall RM12.35, YoY -12.1%) |
| Item table + pagination | PASS | 291 items, pagination works |
| Item Price Modal | PASS | History chart renders full 13-month range, table with MoM changes |
| Price Map & Store Finder | PASS | Store list (20 stores), Leaflet map with colored markers |
| Map filters (category, type, state) | PASS | Dropdowns populate correctly |
| Forecast list | PASS | 291 items, top 5 predictions shown |
| Forecast detail view | PARTIAL | Chart renders but Y-axis labels truncated (Bug 1) |
| Grocery Optimizer | PASS | Search, basket, state filter all load |
| News page | PASS | 7 signals, sentiment bar, article cards with category badges |
| AI Chat button | PASS | Floating button renders |
| Navigation | PASS | All nav links route correctly |

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/PriceForecast.tsx` (line 447) | `width={50}` → `width={65}` |
| `src/components/PriceExplorer.tsx` (line 89) | `Feb 2026` → `Mar 2026` |
| `src/lib/pricecatcher.ts` | Remove `&count=5` from RSS URLs |

