

# Recalculate All JSON Data Files from Latest CSVs

## Overview
Write a Python script to process all 13 monthly CSV files (March 2025 – March 2026) plus the two lookup CSVs, and regenerate all 11 JSON data files in `public/data/`. The script runs once via `code--exec`, outputting directly to `public/data/`.

## JSON Files to Regenerate

| File | Source | Logic |
|------|--------|-------|
| `items.json` | `lookup_item.csv` | Map columns: `item_code→c`, `item→n`, `unit→u`, `item_group→g`, `item_category→k` |
| `premises.json` | `lookup_premise.csv` | Map: `premise_code→c`, `premise→n`, `address→a`, `premise_type→t` (title-cased), `state→s` (title-cased), `district→d` (title-cased), `lat/lng` from district centroid lookup |
| `prices_agg.json` | Latest month CSV (`2026-03`) | Group by item_code → compute avg, min, max, count |
| `prices_agg_jan.json` | Earliest month CSV (`2025-03`) | Same as above but for baseline month |
| `prices_by_state.json` | Latest month CSV + premises | Group by item_code × state → avg, min, max, count |
| `prices_history.json` | All 13 CSVs | Group by item_code × month → avg, min, max, count |
| `prices_yearly.json` | All 13 CSVs | Flat array: `{c, month, avg_price, n}` per item × month |
| `yearly_overview.json` | All 13 CSVs | Per month: overall avg, min, max, total records |
| `cheapest_stores.json` | Latest month CSV | Per item: top 20 cheapest premises by avg price, with `{p, avg, n}` |
| `price_forecast.json` | All 13 CSVs | Weekly avg per item (last 6 months), linear regression → 14-day forecast with trend/slope/last_price |
| `news_context.json` | **Keep as-is** (curated manually, not derived from CSVs) |

## Implementation

Single Python script (`/tmp/regen_json.py`) that:

1. Reads `lookup_item.csv` and `lookup_premise.csv` with pandas
2. Reads all 13 `pricecatcher_YYYY-MM.csv` files, concatenates into one DataFrame
3. Computes each aggregation and writes JSON to `public/data/`
4. For `premises.json`: uses a district→lat/lng centroid mapping (extracted from the existing premises.json to preserve coordinates)
5. For `price_forecast.json`: computes weekly averages for last ~6 months of data, runs linear regression per item, generates 14-day forecast

## Key Details

- **Premise coordinates**: The CSV doesn't have lat/lng. Extract existing coords from current `premises.json` by premise_code, then merge. New premises without coords get district-level defaults.
- **Premise type formatting**: CSV has `PASAR BASAH` uppercase → title-case to `Pasar Basah` to match current format.
- **State formatting**: CSV has `PERAK` uppercase → title-case to `Perak`, with special handling for `W.P. KUALA LUMPUR` → `W.P. Kuala Lumpur`.
- **news_context.json**: Not regenerated — it's manually curated editorial content.

## Files Changed
- `public/data/*.json` — all 10 files regenerated (news_context.json untouched)
- No source code changes needed — the frontend already reads these JSON files

