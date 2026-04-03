import json

# Read the prices_agg.json which is used by the website
with open('public/data/prices_agg.json', 'r') as f:
    items = json.load(f)

# Calculate the average using the website's logic: average of item averages
item_averages = [item['avg'] for item in items]
website_avg = sum(item_averages) / len(item_averages)

print(f'Number of items in prices_agg.json: {len(items)}')
print(f'Website calculation (avg of item averages): RM{website_avg:.2f}')
print(f'\nFirst few items:')
for item in items[:5]:
    print(f"  Item {item['c']}: RM{item['avg']:.2f}")
