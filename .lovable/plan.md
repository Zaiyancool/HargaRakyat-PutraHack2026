

# Fix: Forecast Chart "Invalid Date" on X-Axis

## Problem
The regenerated `price_forecast.json` stores history points as `{"week": 1, "avg": 8.9}` (week numbers + `avg`), but the frontend expects `{"date": "2025-10-06", "price": 8.9}` (ISO date strings + `price`). The `formatDate()` function tries to parse a week number as a date, producing "Invalid Date".

## Fix
Re-run a Python script to convert the history entries from week-number format back to proper date-based format:

1. For each item's history array, convert `week` numbers to actual ISO dates (week 1 = start of the year's first week relative to the data range Mar 2025 – Mar 2026)
2. Rename `avg` → `price` and `week` → compute actual `date`
3. Keep forecast entries unchanged (they already have proper `date` + `price`)

### Week-to-date mapping logic
The CSV data spans Mar 2025 – Mar 2026. Week numbers in the JSON appear to be ISO week numbers (week 1, 40-66). The script will:
- Use Python's `datetime` to compute Monday of each ISO week for 2025/2026
- Week 1 = 2024-12-30 (ISO week 1 of 2025), week 40 = 2025-09-29, etc.
- Weeks > 52 wrap into 2026

### Output format per history entry
```json
{"date": "2025-09-29", "price": 8.64}
```

## Files Changed
| File | Change |
|------|--------|
| `public/data/price_forecast.json` | Convert history `{week, avg}` → `{date, price}` |

