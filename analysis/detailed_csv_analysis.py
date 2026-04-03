import csv
from collections import Counter

# Analyze the CSV thoroughly
items_dict = {}
items_set = set()
prices_all = []
price_issues = []

row_count = 0

with open('price_table_dataset/pricecatcher_2026-03.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        row_count += 1
        item_code = int(row['item_code'])
        items_set.add(item_code)
        
        try:
            price = float(row['price'])
            prices_all.append(price)
            
            if item_code not in items_dict:
                items_dict[item_code] = {'count': 0, 'prices': []}
            items_dict[item_code]['count'] += 1
            items_dict[item_code]['prices'].append(price)
            
            if price < 0:
                price_issues.append((item_code, price, 'negative'))
            if price == 0:
                price_issues.append((item_code, price, 'zero'))
        except ValueError as e:
            price_issues.append((item_code, row['price'], 'not_a_number'))

print("=" * 70)
print("MARCH 2026 CSV - DETAILED ITEM COUNT ANALYSIS")
print("=" * 70)

print(f"\nDATA OVERVIEW:")
print(f"  Total rows: {row_count:,}")
print(f"  Columns: date, premise_code, item_code, price")

print(f"\nITEM CODE ANALYSIS:")
print(f"  Unique items: {len(items_set)}")
print(f"  Min item code: {min(items_set)}")
print(f"  Max item code: {max(items_set)}")

print(f"\nDATA QUALITY CHECKS:")
# Check price issues
negative_prices = len([x for x in price_issues if x[2] == 'negative'])
zero_prices = len([x for x in price_issues if x[2] == 'zero'])
non_numeric = len([x for x in price_issues if x[2] == 'not_a_number'])

print(f"  Negative prices: {negative_prices}")
print(f"  Zero prices: {zero_prices}")
print(f"  Non-numeric prices: {non_numeric}")

if price_issues:
    print(f"\n⚠️  Problem prices found (first 10):")
    for item, price, issue_type in price_issues[:10]:
        print(f"    Item {item}: price={price} ({issue_type})")

# Item distribution
print(f"\nITEM DISTRIBUTION (top 10 most frequent):")
top_items = sorted(items_dict.items(), key=lambda x: x[1]['count'], reverse=True)[:10]
for item_code, data in top_items:
    print(f"  Item {item_code}: {data['count']} records, avg price: RM{sum(data['prices'])/len(data['prices']):.2f}")
