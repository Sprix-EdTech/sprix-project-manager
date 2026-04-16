import pandas as pd
import json

df = pd.read_excel('/Users/micky/Desktop/Certificate Sales Track_TOFAS Proglramming.xlsx')
# Find the row containing the total value. It seems to be in the second column near the bottom.
# Let's just sum up the 'Amount' column if it exists, or find the cell with 3184950
total_revenue = 3184950
target_revenue = 10000000 # Guessing a target, let's just make it a stat

# But let's look at the actual columns to be safe
print(df.columns)
print(df.head())
