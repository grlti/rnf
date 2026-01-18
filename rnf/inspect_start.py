
import pandas as pd

file_path = 'Controle de Serviços Realizados Jan.26.xlsx'
try:
    xl = pd.ExcelFile(file_path)
    sheet = xl.sheet_names[0]
    df = xl.parse(sheet, header=None)
    
    print("Rows 0-20:")
    for i in range(0, 21):
        try:
            print(f"Row {i}: {df.iloc[i].tolist()}")
        except:
            pass
except Exception as e:
    print(f"Error: {e}")
