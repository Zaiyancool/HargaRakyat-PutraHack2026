
# Fix Forecast X-Axis to Show Real Dates from Dataset

## What I found
- The forecast UI is reading `public/data/price_forecast.json` and expects each history point as:
  - `{"date": "YYYY-MM-DD", "price": number}`
- The current file now uses that schema, so this is no longer the old `week/avg` mismatch.
- However, the forecast history still begins around `2025-09-29`, not `2025-03-01`, which means the dataset behind the forecast JSON was only partially regenerated.
- The screenshot showing repeated `Invalid Date` is consistent with stale/cached forecast data or with a bad regenerated subset being served previously.
- `.lovable/plan.md` is outdated: it still describes the old `week -> date` conversion fix, not the actual root issue now.

## Root cause
The problem is no longer just formatting. The real issue is that `price_forecast.json` needs to be fully rebuilt from the latest March 2025 → March 2026 CSVs so the forecast history uses actual dates from the fresh dataset, starting from March 2025.

## Implementation plan
1. Review and update `.lovable/plan.md`
   - Replace the old “week-to-date conversion” explanation
   - Document the real issue: forecast dataset is stale/incomplete and only starts from late Sep 2025
   - Define the new expected output: real date-based history derived from the latest CSV files, covering the full intended range

2. Rebuild `public/data/price_forecast.json` from the latest CSV files
   - Use all monthly CSVs from `price_table_dataset/pricecatcher_2025-03.csv` through `price_table_dataset/pricecatcher_2026-03.csv`
   - Aggregate by item using real observation dates
   - Produce history points with actual ISO dates from the dataset, not synthetic placeholders
   - Keep output shape compatible with the frontend:
     - `history: [{ date, price }]`
     - `forecast: [{ date, price }]`
     - `trend`, `slope`, `last_price`

3. Make the rebuilt forecast consistent with the 1-year dataset direction
   - Since the project has moved to a 1-year data story, the forecast history should no longer look like a 6-month-only artifact
   - Either:
     - generate weekly history from Mar 2025 onward, or
     - generate a clear rolling window from the latest year data
   - Best option: weekly aggregation across the full available date range, starting in March 2025

4. Verify frontend compatibility
   - Confirm every `history.date` and `forecast.date` is a valid `YYYY-MM-DD`
   - Confirm `PriceForecast.tsx` can render:
     - `formatDate(p.date)`
     - boundary line using the last historical date
     - continuous actual-to-forecast transition without invalid ticks

5. Optional cleanup for clarity
   - Update forecast copy that currently says “using 6 months of KPDN PriceCatcher data”
   - Change it to reflect the actual rebuilt 1-year dataset if that is now the product direction

## Files that should be updated
- `.lovable/plan.md`
- `public/data/price_forecast.json`
- Possibly `src/components/PriceForecast.tsx` text copy only, if you want the wording to match the new 1-year calculation basis

## Technical details
```text
Current state:
CSV source: Mar 2025 -> Mar 2026
Forecast JSON history: starts ~ Sep 29, 2025
UI expectation: valid ISO dates
User expectation: actual dataset dates, starting from March 2025

Needed state:
price_forecast.json rebuilt from latest CSVs
history dates = real dates from source data
x-axis labels = valid formatted dates
forecast detail chart starts from proper historical timeline
```

## Why this is the correct fix
- The frontend code is already built to consume real date strings.
- The visible issue is therefore a data regeneration problem, not primarily a chart component problem.
- Fixing the JSON at the source keeps the app consistent and avoids adding UI-side hacks for broken or incomplete forecast data.
