
import pandas as pd

file_path = 'Controle de Serviços Realizados Jan.26.xlsx'
try:
    xl = pd.ExcelFile(file_path)
    sheet = xl.sheet_names[0]
    df = xl.parse(sheet, header=None)
    
    print("--- Row 8 (Potential Header) ---")
    print(list(enumerate(df.iloc[8].tolist())))

    print("\n--- Row 9 (Potential Header or Data) ---")
    print(list(enumerate(df.iloc[9].tolist())))

    print("\n--- Row 34 (Data Sample) ---")
    print(list(enumerate(df.iloc[34].tolist())))
    
except Exception as e:
    print(f"Error: {e}")
