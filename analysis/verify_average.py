import csv

# Read the CSV file
csv_file = 'price_table_dataset/pricecatcher_2026-03.csv'
prices = []

with open(csv_file, 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        prices.append(float(row['price']))

print(f'Total data points: {len(prices)}')
print(f'Average price (simple mean): RM{sum(prices) / len(prices):.2f}')
print(f'Min price: RM{min(prices):.2f}')
print(f'Max price: RM{max(prices):.2f}')
print(f'Sum of all prices: RM{sum(prices):.2f}')
