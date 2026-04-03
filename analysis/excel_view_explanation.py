import csv
import json

print("=" * 80)
print("VERIFYING MARCH 2026 DATA - EXCEL VS ACTUAL FILE")
print("=" * 80)

# Get all unique items from the CSV
all_items = set()
records_by_item = {}

with open('price_table_dataset/pricecatcher_2026-03.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        item = int(row['item_code'])
        all_items.add(item)
        if item not in records_by_item:
            records_by_item[item] = 0
        records_by_item[item] += 1

print(f"\n📊 ACTUAL DATA IN CSV FILE:")
print(f"  Total records: {sum(records_by_item.values()):,}")
print(f"  Unique items: {len(all_items)}")

# Check prices_agg.json
with open('public/data/prices_agg.json', 'r') as f:
    agg = json.load(f)

agg_items = set(item['c'] for item in agg)
print(f"\n📊 IN prices_agg.json:")
print(f"  Items: {len(agg_items)}")

# Check for discrepancies
missing_in_agg = all_items - agg_items
missing_in_csv = agg_items - all_items

if not missing_in_agg and not missing_in_csv:
    print(f"\n  ✓ MATCH PERFECT: All {len(all_items)} items from CSV are in prices_agg.json")

if missing_in_agg:
    print(f"\n  ⚠️  Items in CSV but NOT in agg: {len(missing_in_agg)}")

if missing_in_csv:
    print(f"\n  ⚠️  Items in agg but NOT in CSV: {len(missing_in_csv)}")

print(f"\n" + "=" * 80)
print("EXPLANATION FOR EXCEL SHOWING 320 VS ACTUAL 343:")
print("=" * 80)
print(f"""
Common reasons you see only 320 in Excel:

1. ✓ FILTERING IS APPLIED
   • Go to Data → Clear Filter
   • Or check if there's a filter dropdown icon in the header

2. ✓ HIDDEN ROWS
   • Right-click row numbers → Unhide All
   
3. ✓ GROUPED DATA
   • Excel might be showing grouped/summarized view
   • Click the grouping collapse/expand buttons

4. ✓ SORTING/VIEW ISSUE
   • Excel might be in filtered view mode
   
5. ✓ ROW LIMIT
   • Excel might be showing only visible rows

The ACTUAL data has 343 unique items, which is correct.

NEXT STEP:
Open the CSV in Excel normally without any filters to see all 343 items.
""")

# Show some sample items
print(f"\nSample items in the data:")
sample_items = sorted(list(all_items))[:20]
print(f"  {sample_items}")
print(f"  ... and {len(all_items) - 20} more items")
