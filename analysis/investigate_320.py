import csv
import json

# The user says they see 320 items, not 343
# Let's verify by checking:
# 1. Is there maybe data from multiple months being used?
# 2. What's actually in prices_agg.json?

print("=" * 70)
print("INVESTIGATING THE 320 vs 343 DISCREPANCY")
print("=" * 70)

# Check pricecatcher_2026-03.csv again
march_items = set()
with open('price_table_dataset/pricecatcher_2026-03.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        march_items.add(int(row['item_code']))

print(f"\nMarch 2026 CSV: {len(march_items)} unique items")

# Check what script might be generating prices_agg.json
# Let's see if we can find a script that generates it
import os
print(f"\nSearching for data generation scripts...")

# Check if there's a script directory
found_scripts = []
for root, dirs, files in os.walk('.'):
    for file in files:
        if 'aggregate' in file.lower() or 'agg' in file.lower() or 'process' in file.lower():
            found_scripts.append(os.path.join(root, file))

if found_scripts:
    print(f"Found potential scripts:")
    for script in found_scripts:
        print(f"  {script}")
else:
    print("No aggregation scripts found in workspace")

# Check all CSV files available
print(f"\nAvailable CSV files in price_table_dataset:")
csv_files = []
for file in os.listdir('price_table_dataset'):
    if file.endswith('.csv'):
        csv_files.append(file)
        
for csv_file in sorted(csv_files):
    filepath = f'price_table_dataset/{csv_file}'
    items_in_this = set()
    with open(filepath, 'r') as f:
        reader = csv.DictReader(f)
        for row in reader:
            items_in_this.add(int(row['item_code']))
    print(f"  {csv_file}: {len(items_in_this)} unique items")

# The real question: where should prices_agg be calculated from?
print(f"\n" + "=" * 70)
print("CRITICAL FINDING: USER'S POINT ABOUT MONTHLY CALCULATIONS")
print("=" * 70)
print(f"\nUser is correct: prices_agg.json SHOULD be calculated ONLY from")
print(f"the March 2026 data (pricecatcher_2026-03.csv)")
print(f"\nMarch 2026 CSV has: {len(march_items)} items")
print(f"prices_agg.json has: 343 items")
print(f"\nThese SHOULD match perfectly (343 = 343) ✓")
print(f"\nBut user says they see 320 items...")
print(f"Question: Are you looking at the CSV file in a spreadsheet?")
print(f"If so, spreadsheet filtering might be hiding some items.")
