import json
from datetime import datetime

# Read the prices_agg.json which has the March 2026 data
with open('public/data/prices_agg.json', 'r') as f:
    agg_data = json.load(f)

# Calculate the correct average from raw CSV
import csv
prices_march = []
with open('price_table_dataset/pricecatcher_2026-03.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        prices_march.append(float(row['price']))

raw_csv_avg = sum(prices_march) / len(prices_march) if prices_march else 0

# Calculate website average (average of item averages)
website_avg = sum(item['avg'] for item in agg_data) / len(agg_data) if agg_data else 0

print("=" * 60)
print("MARKET AVERAGE COMPARISON")
print("=" * 60)
print(f"\nDataset: pricecatcher_2026-03.csv (March 2026 data)")
print(f"Total raw price points: {len(prices_march):,}")
print(f"Raw CSV Average (simple mean): RM{raw_csv_avg:.2f}")
print(f"\nWebsite Calculation:")
print(f"Items in prices_agg.json: {len(agg_data)}")
print(f"Website Average (avg of item averages): RM{website_avg:.2f}")
print(f"\nSheet Value (you mentioned): RM11.87")
print(f"Website Value (you mentioned): RM15.67")
print(f"\nActual Website Value: RM{website_avg:.2f}")
print(f"\nDifference explanations:")
print(f"- Raw CSV avg (RM{raw_csv_avg:.2f}) calculates average of ALL price points")
print(f"- Website avg (RM{website_avg:.2f}) calculates average of per-item averages")
print(f"  (This weights each item equally, not by frequency)")
