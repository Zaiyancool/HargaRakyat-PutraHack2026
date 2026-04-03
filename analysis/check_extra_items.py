import csv
import json

# Read lookup_item.csv
lookup_items = {}
with open('price_table_dataset/premise_item_lookup/lookup_item.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        lookup_items[int(row['item_code'])] = row['item']

# Read prices_agg.json
with open('public/data/prices_agg.json', 'r') as f:
    agg_data = json.load(f)

agg_item_codes = set(item['c'] for item in agg_data)
lookup_codes = set(lookup_items.keys())
extra_in_agg = agg_item_codes - lookup_codes

print("=" * 70)
print("INVESTIGATION: 52 ITEMS IN AGGREGATED DATA NOT IN LOOKUP")
print("=" * 70)
print(f"\nThese item codes are in prices_agg.json but NOT in lookup_item.csv:")
print(sorted(list(extra_in_agg)))

print(f"\n" + "=" * 70)
print("POSSIBLE EXPLANATIONS:")
print("=" * 70)
print("1. These are NEW items added AFTER the lookup table was created")
print("2. These items were added to prices_agg.json but lookup wasn't updated")
print("3. Data quality issue - orphaned items without lookup definitions")

# Try to find these items in the CSV to see if they have price data
print(f"\nChecking if these items have price records in pricecatcher_2026-03.csv...")
items_in_csv = set()
with open('price_table_dataset/pricecatcher_2026-03.csv', 'r') as f:
    reader = csv.DictReader(f)
    for i, row in enumerate(reader):
        if i % 300000 == 0 and i > 0:
            print(f"  Scanned {i:,} rows...")
        items_in_csv.add(int(row['item_code']))

extra_with_data = extra_in_agg & items_in_csv
extra_without_data = extra_in_agg - items_in_csv

print(f"\nOf the 52 extra items:")
print(f"  Items with price records: {len(extra_with_data)}")
print(f"  Items without price records: {len(extra_without_data)}")

if extra_without_data:
    print(f"\n⚠️  Items in agg but no prices (shouldn't exist!):")
    print(f"  {sorted(list(extra_without_data))}")
