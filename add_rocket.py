import re

with open('src/components/Header.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Make sure Rocket is imported
if "Rocket" not in content[:content.find("from 'lucide-react'")]:
    content = content.replace("from 'lucide-react';", ", Rocket } from 'lucide-react';")

with open('src/components/Header.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
