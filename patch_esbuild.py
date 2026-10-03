import json

with open('package.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

if 'devDependencies' in data and 'esbuild' in data['devDependencies']:
    data['devDependencies']['esbuild'] = "^0.28.2"

with open('package.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)
