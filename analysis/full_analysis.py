import json

# Read both aggregated datasets
with open('public/data/prices_agg.json', 'r') as f:
    march_agg = json.load(f)

with open('public/data/prices_agg_jan.json', 'r') as f:
    jan_agg = json.load(f)

# Calculate averages
march_avg = sum(item['avg'] for item in march_agg) / len(march_agg)
jan_avg = sum(item['avg'] for item in jan_agg) / len(jan_agg)

# Calculate percentage change
pct_change = ((march_avg - jan_avg) / jan_avg) * 100

print("=" * 70)
print("COMPLETE MARKET AVERAGE ANALYSIS")
print("=" * 70)
print(f"\nMARCH 2026 DATA:")
print(f"  Source: prices_agg.json")
print(f"  Items tracked: {len(march_agg)}")
print(f"  Average (of item averages): RM{march_avg:.2f}")
print(f"\nJANUARY 2026 DATA:")
print(f"  Source: prices_agg_jan.json")
print(f"  Items tracked: {len(jan_agg)}")
print(f"  Average (of item averages): RM{jan_avg:.2f}")
print(f"\nPRICE COMPARISON:")
print(f"  Change: RM{march_avg - jan_avg:.2f}")
print(f"  Percentage change: {pct_change:+.2f}%")
print(f"\n" + "=" * 70)
print("DATA QUALITY ISSUES DETECTED:")
print("=" * 70)
print(f"\n⚠️  DISCREPANCY FOUND:")
print(f"  Website display you mentioned: RM15.67")
print(f"  Calculated from prices_agg.json: RM{march_avg:.2f}")
print(f"  Calculated from raw CSV data: RM11.74")
print(f"\n📊 CALCULATION METHODS:")
print(f"  1. Raw CSV Average (RM11.74)")
print(f"     = Sum of all 1,509,649 individual prices / count")
print(f"     = Simple average of every recorded price point")
print(f"\n  2. Aggregated Item Average (RM{march_avg:.2f})")
print(f"     = Sum of {len(march_agg)} per-item averages / count") 
print(f"     = Each item weighted equally regardless of frequency")
print(f"\n💡 RECOMMENDATION:")
print(f"  The raw CSV method (RM11.74) is more accurate for market average")
print(f"  because it represents actual consumer grocery spending patterns.")
print(f"  The aggregated method (RM{march_avg:.2f}) over-weights expensive items")
print(f"  like premium grocery brands that appear less frequently.")
