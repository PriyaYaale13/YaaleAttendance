with open(r'd:\ATM-WMS\frontend\src\components\index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Clean BOM if it exists
if content.startswith('\ufeff'):
    content = content[1:]
    
# Remove duplicate early departure if any
lines = [l for l in content.split('\n') if 'EarlyDepartureManagement' not in l]
lines.append("export { default as EarlyDepartureManagement } from './EarlyDepartureManagement';")

with open(r'd:\ATM-WMS\frontend\src\components\index.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write('\n'.join(lines))
