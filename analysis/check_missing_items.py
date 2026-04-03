import csv
import json

# Read the items that are missing from aggregated data
lookup_items = set()
with open('price_table_dataset/premise_item_lookup/lookup_item.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        lookup_items.add(int(row['item_code']))

with open('public/data/prices_agg.json', 'r') as f:
    agg_data = json.load(f)

agg_items = set(item['c'] for item in agg_data)
missing_in_agg = lookup_items - agg_items

# Check if these missing items have any records in the CSV
print(f"Checking if {len(missing_in_agg)} missing items have price records...")
print("This may take a moment...\n")

items_with_prices = set()
with open('price_table_dataset/pricecatcher_2026-03.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        items_with_prices.add(int(row['item_code']))

missing_from_csv = missing_in_agg - items_with_prices
items_in_csv_but_not_agg = missing_in_agg & items_with_prices

print("=" * 70)
print("ITEM CODE ANALYSIS - MISSING FROM AGGREGATED DATA")
print("=" * 70)
print(f"\nItems in lookup but NOT in prices_agg.json: {len(missing_in_agg)}")
print(f"  ├─ Items with price records in CSV: {len(items_in_csv_but_not_agg)}")
print(f"  └─ Items with NO price records in CSV: {len(missing_from_csv)}")

if items_in_csv_but_not_agg:
    print(f"\n⚠️  ITEMS WITH PRICE DATA BUT NOT IN AGGREGATED FILE (first 20):")
    sample = sorted(list(items_in_csv_but_not_agg))[:20]
    print(f"  {sample}")

if missing_from_csv:
    print(f"\n✓ ITEMS WITH NO PRICE DATA IN CSV (first 20):")
    sample = sorted(list(missing_from_csv))[:20]
    print(f"  {sample}")
    
print(f"\n" + "=" * 70)
print("SUMMARY:")
print("=" * 70)
print(f"Lookup items: {len(lookup_items)}")
print(f"Items with March price data: {len(items_with_prices)}")
print(f"Items in aggregated (prices_agg.json): {len(agg_items)}")
print(f"\nIssue: {len(items_in_csv_but_not_agg)} items have price data in CSV")
print(f"       but are missing from prices_agg.json!")
print(f"\nThis explains the discrepancy - the aggregated data is incomplete.")
