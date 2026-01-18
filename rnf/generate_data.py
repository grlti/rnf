
import pandas as pd
import json
import datetime

file_path = 'Controle de Serviços Realizados Jan.26.xlsx'

def convert_date(d):
    if isinstance(d, datetime.datetime):
        return d.strftime('%Y-%m-%d')
    return str(d)

try:
    xl = pd.ExcelFile(file_path)
    sheet = xl.sheet_names[0]
    df = xl.parse(sheet, header=None)
    
    extracted_data = []
    
    for idx, row in df.iterrows():
        # Check if first column is a timestamp
        val0 = row.iloc[0]
        if isinstance(val0, datetime.datetime):
            # It's a data row
            record = {
                "id": len(extracted_data) + 1, # specific internal ID
                "date": convert_date(val0),
                "serviceType": str(row.iloc[1]) if pd.notnull(row.iloc[1]) else "",
                "serviceId": str(row.iloc[2]) if pd.notnull(row.iloc[2]) else "",
                "client": str(row.iloc[3]) if pd.notnull(row.iloc[3]) else "",
                # Check columns 4 to 35 for any value, sum them or take first non-null
                "quantity": 0
            }
            
            # Sum up values in day columns (approx index 4 to 35)
            # We treat any numeric value found there as part of the quantity/value
            qty = 0
            for c in range(4, 36): # 4 to 35 inclusive
                if c < len(row):
                    v = row.iloc[c]
                    if pd.notnull(v) and isinstance(v, (int, float)):
                        qty += v
            
            record["quantity"] = qty if qty > 0 else 1 # Default to 1 if not found but row exists? Or keep 0.
            # Row 34 had 1.0, so qty should be 1.0
            
            extracted_data.append(record)

    js_content = f"const initialData = {json.dumps(extracted_data, ensure_ascii=False, indent=2)};"
    
    with open('js/initial-data.js', 'w', encoding='utf-8') as f:
        f.write(js_content)
        
    print(f"Generated js/initial-data.js with {len(extracted_data)} records.")

except Exception as e:
    print(f"Error: {e}")
