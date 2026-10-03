import re

with open('src/components/Header.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("} , Rocket } from 'lucide-react';", ", Rocket } from 'lucide-react';")

with open('src/components/Header.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
