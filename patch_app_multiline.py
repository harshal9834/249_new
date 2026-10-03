import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r"aircraft=\{currentAircraft!\}\s*", "", content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
