#!/usr/bin/env python3
"""
Generate prices_by_store.json from raw price CSVs.
Aggregates prices per item per store (premise).
"""

import csv
import json
from pathlib import Path
from collections import defaultdict

def load_premises_lookup(lookup_path):
    """Load premise_code -> premise_name mapping."""
    premises = {}
    with open(lookup_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            code = int(row['premise_code'])
            premises[code] = {
                'name': row['premise'],
                'state': row['state'],
                'district': row['district'],
                'address': row['address'],
                'postcode': row['Postcode'],
                'premise_type': row['premise_type'],
            }
    return premises

def aggregate_prices_by_store(csv_folder, output_file):
    """
    Aggregate prices from all CSVs by item and store (premise).
    
    Structure:
    {
        "ITEM_CODE": {
            "STORE_CODE": {
                "avg": 2.50,
                "min": 2.00,
                "max": 3.00,
                "n": 42
            }
        }
    }
    """
    
    # Load premises lookup
    premises_lookup = load_premises_lookup(
        csv_folder / 'premise_item_lookup' / 'lookup_premise.csv'
    )
    
    # Aggregate data
    store_prices = defaultdict(lambda: defaultdict(lambda: {'prices': []}))
    
    # Read all price CSVs
    csv_files = sorted(csv_folder.glob('pricecatcher_*.csv'))
    print(f"Processing {len(csv_files)} CSV files...")
    
    for csv_file in csv_files:
        print(f"  Reading {csv_file.name}...")
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                item_code = row['item_code']
                premise_code = row['premise_code']
                price = float(row['price'])
                
                store_prices[item_code][premise_code]['prices'].append(price)
    
    # Convert to aggregated format
    result = {}
    for item_code, stores in store_prices.items():
        result[item_code] = {}
        for premise_code, data in stores.items():
            prices = data['prices']
            if prices:
                result[item_code][premise_code] = {
                    'avg': round(sum(prices) / len(prices), 2),
                    'min': round(min(prices), 2),
                    'max': round(max(prices), 2),
                    'n': len(prices),
                }
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Generated {output_file}")
    print(f"   Items: {len(result)}")
    total_stores = sum(len(stores) for stores in result.values())
    print(f"   Store-item combos: {total_stores}")
    
    # Also save premises lookup as JSON for reference
    premises_output = output_file.parent / 'premises_metadata.json'
    with open(premises_output, 'w', encoding='utf-8') as f:
        json.dump(premises_lookup, f, indent=2, ensure_ascii=False)
    print(f"✅ Generated {premises_output}")

if __name__ == '__main__':
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    dataset_dir = project_root / 'price_table_dataset'
    output_path = project_root / 'public' / 'data' / 'prices_by_store.json'
    
    if not dataset_dir.exists():
        print(f"❌ Dataset directory not found: {dataset_dir}")
        exit(1)
    
    aggregate_prices_by_store(dataset_dir, output_path)
