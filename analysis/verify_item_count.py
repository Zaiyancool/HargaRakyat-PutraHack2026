import csv
import json

# Read lookup_item.csv to count items
lookup_items = set()
with open('price_table_dataset/premise_item_lookup/lookup_item.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        lookup_items.add(int(row['item_code']))

# Read prices_agg.json to see which items have aggregated data
with open('public/data/prices_agg.json', 'r') as f:
    agg_data = json.load(f)

agg_item_codes = set(item['c'] for item in agg_data)

# Find the differences
missing_in_agg = lookup_items - agg_item_codes
extra_in_agg = agg_item_codes - lookup_items

print("=" * 70)
print("ITEM CODE INVENTORY CHECK")
print("=" * 70)
print(f"\nTOTAL ITEMS IN lookup_item.csv: {len(lookup_items)}")
print(f"TOTAL ITEMS IN prices_agg.json: {len(agg_item_codes)}")
print(f"\nDISCREPANCY: {len(lookup_items) - len(agg_item_codes)} items missing")
print(f"\n📊 BREAKDOWN:")
print(f"  Items in lookup but NOT in aggregated data: {len(missing_in_agg)}")
print(f"  Items in aggregated but NOT in lookup: {len(extra_in_agg)}")

if missing_in_agg:
    print(f"\n⚠️  MISSING ITEM CODES (first 30):")
    missing_sorted = sorted(list(missing_in_agg))[:30]
    print(f"  {missing_sorted}")
    if len(missing_in_agg) > 30:
        print(f"  ... and {len(missing_in_agg) - 30} more")

if extra_in_agg:
    print(f"\n⚠️  EXTRA ITEMS IN AGGREGATED DATA:")
    extra_sorted = sorted(list(extra_in_agg))
    print(f"  {extra_sorted}")

print(f"\n" + "=" * 70)
print("POSSIBLE CAUSES:")
print("=" * 70)
print("1. Items with NO price data recorded in March 2026")
print("2. Items removed from tracking after being in lookup table")
print("3. Items added to lookup but not yet in price_agg.json")
