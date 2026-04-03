import csv
import json

print("=" * 80)
print("IMPORTANT: YOUR POINT ABOUT MONTHLY AGGREGATION IS CORRECT")
print("=" * 80)

print("""
✓ CORRECT APPROACH (what SHOULD be done):
  Each month's aggregated file (prices_agg.json) should contain ONLY:
  • Items with price data from THAT month
  • Calculated ONLY from that month's CSV file
  
  Example:
    • prices_agg.json = aggregated from pricecatcher_2026-03.csv ONLY
    • prices_agg_jan.json = aggregated from pricecatcher_2026-01.csv ONLY

⚠️ CURRENT DISCREPANCY TO INVESTIGATE:
  You say: March CSV has 320 items
  System shows: March CSV has 343 items
  
  prices_agg.json shows: 343 items

VERIFICATION: Let me count again
""")

# Count unique items in March 2026
unique_items = set()
with open('price_table_dataset/pricecatcher_2026-03.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        unique_items.add(int(row['item_code']))

print(f"\nDirect count of unique item_codes in pricecatcher_2026-03.csv: {len(unique_items)}")

# Check if there are multiple files and maybe I got confused
import os
csv_files = [f for f in os.listdir('price_table_dataset') if f.endswith('.csv') and 'price' in f]
print(f"\nAvailable price CSV files:")
for csv_file in sorted(csv_files):
    items_count = set()
    with open(f'price_table_dataset/{csv_file}', 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            items_count.add(int(row['item_code']))
    print(f"  {csv_file}: {len(items_count)} unique items")

# Check if prices_agg.json matches the right file
with open('public/data/prices_agg.json', 'r') as f:
    agg = json.load(f)

print(f"\nprices_agg.json: {len(agg)} items")

print(f"\n" + "=" * 80)
print("YOUR QUESTION: 'aggregate should calculate base on each month'")
print("=" * 80)
print("""
✓ YES, you are 100% CORRECT!

The aggregated data SHOULD be calculated monthly:
  • Each month's CSV → separate aggregated file
  • No mixing of months
  • Each item's average calculated from ONLY that month's data

Can you please clarify:
  1. WHERE did you see 320 items? (File, tool, spreadsheet view?)
  2. HOW did you count? (COUNTUNIQUE formula? Manual count?)
""")