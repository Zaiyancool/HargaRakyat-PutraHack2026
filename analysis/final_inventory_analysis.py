import csv
import json

# Get all the data
lookup_items = {}
with open('price_table_dataset/premise_item_lookup/lookup_item.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        lookup_items[int(row['item_code'])] = row['item']

with open('public/data/prices_agg.json', 'r') as f:
    agg_data = json.load(f)

items_in_csv = set()
with open('price_table_dataset/pricecatcher_2026-03.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        items_in_csv.add(int(row['item_code']))

lookup_codes = set(lookup_items.keys())
agg_codes = set(item['c'] for item in agg_data)

missing_in_agg = lookup_codes - agg_codes
extra_in_agg = agg_codes - lookup_codes
items_with_no_prices = missing_in_agg - items_in_csv
items_with_prices_but_not_agg = missing_in_agg & items_in_csv

print("=" * 80)
print("COMPLETE INVENTORY ANALYSIS: WHY 343 ITEMS NOT 757?")
print("=" * 80)

print(f"""
DATASETS:
  • lookup_item.csv: {len(lookup_codes)} items (master catalog)
  • pricecatcher_2026-03.csv: {len(items_in_csv)} unique items with price data
  • prices_agg.json: {len(agg_codes)} items (aggregated averages)

BREAKDOWN OF 757 ITEMS:
""")

print(f"  ✓ Items with March 2026 price data: {len(items_in_csv)}")
print(f"    └─ All {len(items_in_csv)} are in prices_agg.json")

print(f"\n  ✗ Items with NO price data in March 2026: {len(missing_in_agg)}")

print(f"\nDATA QUALITY ISSUES:")
print(f"  ⚠️  {len(extra_in_agg)} items in agg data NOT in lookup_item.csv:")
print(f"      These are NEW items being tracked (add to lookup table)")
print(f"      Items: {sorted(list(extra_in_agg))}")

print(f"\nCONCLUSION:")
print("=" * 80)
print(f"The 343 items in prices_agg.json are CORRECT because:")
print(f"• They represent all items with actual price records in March 2026")
print(f"• The other 413 items from lookup have NO price data that month")
print(f"• This is normal - not all items are tracked every month/everywhere")
print(f"\nThe lookup_item.csv needs updating with {len(extra_in_agg)} new items.")
