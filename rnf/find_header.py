
import pandas as pd
import json

file_path = 'Controle de Serviços Realizados Jan.26.xlsx'
try:
    xl = pd.ExcelFile(file_path)
    sheet = xl.sheet_names[0]
    df = xl.parse(sheet, header=None)
    
    print(f"Scanning sheet: {sheet}")
    for idx, row in df.iterrows():
        # Count non-null values
        non_null = row.count()
        # Get values as list
        values = row.dropna().tolist()
        if non_null > 3:
            print(f"Row {idx}: {values}")

except Exception as e:
    print(f"Error: {e}")
