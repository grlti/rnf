
import pandas as pd
import json
import os

file_path = 'Controle de Serviços Realizados Jan.26.xlsx'
try:
    xl = pd.ExcelFile(file_path)
    print(f"Sheet names: {xl.sheet_names}")
    
    all_data = {}
    
    for sheet in xl.sheet_names:
        print(f"\n--- Sheet: {sheet} ---")
        df = xl.parse(sheet)
        print(df.head())
        print(f"Columns: {list(df.columns)}")
        
        # Convert to records logic, handling dates
        json_str = df.to_json(orient='records', date_format='iso')
        all_data[sheet] = json.loads(json_str)

    with open('initial_data.json', 'w', encoding='utf-8') as f:
        json.dump(all_data, f, ensure_ascii=False, indent=2)
    print("\nData exported to initial_data.json")

except Exception as e:
    print(f"Error reading excel: {e}")
