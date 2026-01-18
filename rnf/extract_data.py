
import pandas as pd
import json

file_path = 'Controle de Serviços Realizados Jan.26.xlsx'
try:
    xl = pd.ExcelFile(file_path)
    sheet = xl.sheet_names[0]
    # Parse without header initially
    df = xl.parse(sheet, header=None)
    
    header_row_idx = -1
    for idx, row in df.iterrows():
        # Check if row contains "Data" and "Serviço" (or similar)
        row_str = row.astype(str).str.lower().tolist()
        # Loose match
        if any('data' in s for s in row_str) and any('serviço' in s for s in row_str):
            header_row_idx = idx
            print(f"Header found at row {idx}")
            print(f"Header values: {row.tolist()}")
            break
        # Fallback: check for "Atendimento"
        if any('atendimento' in s for s in row_str) and any('agência' in s for s in row_str):
             # This might be the summary header, but let's keep looking or note it
             pass

    if header_row_idx != -1:
        # Re-parse with header
        df = xl.parse(sheet, header=header_row_idx)
        # Rename columns to standard keys if needed, or just use as is
        print(f"Columns: {df.columns.tolist()}")
        
        # Serialize
        json_str = df.to_json(orient='records', date_format='iso')
        with open('services.json', 'w', encoding='utf-8') as f:
            f.write(json_str)
        print("Exported services.json")
    else:
        print("Header not found. Dumping raw data for inspection.")
        # If not found, I will dump everything to services_raw.json 
        df.to_json('services_raw.json', orient='records', date_format='iso')

except Exception as e:
    print(f"Error: {e}")
