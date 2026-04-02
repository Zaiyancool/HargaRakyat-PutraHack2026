

# Fix: Prices History JSON Format Mismatch

## Problem
The regenerated `prices_history.json` stores data as **arrays** of objects per item, but the frontend (`ItemPriceModal.tsx`, `usePriceHistory`) expects a **dict keyed by month string** per item.

Current: `{"1": [{"month": "2025-03", "avg": 9.13, ...}, ...] }`
Expected: `{"1": {"2025-03": {"avg": 9.13, "min": 4.99, "max": 13.29, "n": 21098}, ...} }`

## Fix Options (one needed)

### Option A: Fix the JSON file (recommended)
Run a quick script to transform the array format back to dict-keyed format:
```python
# For each item, convert [{month, avg, min, max, n}, ...] → {month: {avg, min, max, n}}
```
This is a one-time data fix — no frontend code changes needed.

### Option B: Fix the frontend to accept arrays
Change `ItemPriceModal.tsx` to iterate arrays instead of dict lookup. This would require also updating the `PriceHistory` type.

## Plan
1. Run a Python script to reformat `public/data/prices_history.json` from array-of-objects to month-keyed dicts (removing the `month` field from each entry since it becomes the key)
2. No frontend code changes needed — the existing type `Record<string, Record<string, StateStats>>` already matches the expected format

## Files Changed
| File | Change |
|------|--------|
| `public/data/prices_history.json` | Reformat from arrays to month-keyed dicts |

