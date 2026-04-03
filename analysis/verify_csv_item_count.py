import csv

# Count unique items in the March 2026 CSV
unique_items = set()
total_records = 0

with open('price_table_dataset/pricecatcher_2026-03.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        unique_items.add(int(row['item_code']))
        total_records += 1

print("=" * 70)
print("MARCH 2026 CSV FILE ANALYSIS")
print("=" * 70)
print(f"\nTotal price records: {total_records:,}")
print(f"Unique items: {len(unique_items)}")
print(f"\nUnique item codes: {sorted(list(unique_items))}")

# Now check what's in prices_agg.json
import json
with open('public/data/prices_agg.json', 'r') as f:
    agg_data = json.load(f)

agg_items = set(item['c'] for item in agg_data)
print(f"\n" + "=" * 70)
print("COMPARISON WITH prices_agg.json")
print("=" * 70)
print(f"\nItems in CSV: {len(unique_items)}")
print(f"Items in prices_agg.json: {len(agg_items)}")

# Check differences
items_in_agg_not_csv = agg_items - unique_items
items_in_csv_not_agg = unique_items - agg_items

if items_in_agg_not_csv:
    print(f"\n⚠️  Items in agg but NOT in CSV: {len(items_in_agg_not_csv)}")
    print(f"  {sorted(list(items_in_agg_not_csv))}")

if items_in_csv_not_agg:
    print(f"\n⚠️  Items in CSV but NOT in agg: {len(items_in_csv_not_agg)}")
    print(f"  {sorted(list(items_in_csv_not_agg))}")
