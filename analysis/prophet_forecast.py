import pandas as pd
from prophet import Prophet
import glob
import json
import os

# Path to your CSV files and output JSON
CSV_PATH = 'price_table_dataset/*.csv'
LOOKUP_PATH = 'price_table_dataset/premise_item_lookup/lookup_item.csv'
OUTPUT_PATH = 'public/data/price_forecast.json'

# Load all CSVs into one DataFrame
df_list = []
for file in glob.glob(CSV_PATH):
    df = pd.read_csv(file)
    df_list.append(df)
all_data = pd.concat(df_list, ignore_index=True)

# Ensure correct columns
df = all_data[['date', 'item_code', 'price']].copy()
df['date'] = pd.to_datetime(df['date'])

# Get unique items
item_codes = df['item_code'].unique()

# Forecast horizon
PERIODS = 14

result = {}

for item in item_codes:
    item_df = df[df['item_code'] == item].groupby('date').mean().reset_index()
    item_df = item_df.rename(columns={'date': 'ds', 'price': 'y'})
    if len(item_df) < 10:
        continue  # Skip items with too little data
    model = Prophet(daily_seasonality=True, yearly_seasonality=True)
    model.fit(item_df)
    future = model.make_future_dataframe(periods=PERIODS)
    forecast = model.predict(future)
    # Prepare history and forecast
    history = [
        {'date': row['ds'].strftime('%Y-%m-%d'), 'price': float(row['y'])}
        for _, row in item_df.iterrows()
    ]
    forecast_points = [
        {'date': row['ds'].strftime('%Y-%m-%d'), 'price': float(row['yhat'])}
        for _, row in forecast.iloc[-PERIODS:].iterrows()
    ]
    trend = 'up' if forecast_points[-1]['price'] > history[-1]['price'] else 'down' if forecast_points[-1]['price'] < history[-1]['price'] else 'stable'
    slope = (forecast_points[-1]['price'] - history[-1]['price']) / PERIODS
    last_price = history[-1]['price']
    result[str(item)] = {
        'history': history,
        'forecast': forecast_points,
        'trend': trend,
        'slope': slope,
        'last_price': last_price
    }

# Save to JSON
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
with open(OUTPUT_PATH, 'w') as f:
    json.dump(result, f, indent=2)

print(f"Saved new forecast to {OUTPUT_PATH}")
