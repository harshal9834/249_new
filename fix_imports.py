import re

paths = ['src/components/AircraftManagement.tsx', 'src/components/CommandCenter.tsx']

for path in paths:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Fix broken imports
    content = re.sub(r'\}\s*,\s*Plane\s*\}\s*from', '} from', content)
    content = re.sub(r'\}\s*,\s*AlertTriangle\s*\}\s*from', '} from', content)
    content = re.sub(r'\}\s*,\s*Rocket\s*\}\s*from', '} from', content)
    content = re.sub(r'\}\s*,\s*Sparkles\s*\}\s*from', '} from', content)
    content = re.sub(r'\}\s*\}\s*from', '} from', content)
    
    # Ensure they are actually in the import if used
    for icon in ['Plane', 'AlertTriangle', 'Rocket', 'Sparkles']:
        if f"<{icon}" in content:
            # check if it is imported
            match = re.search(r'import\s*\{([^}]*)\}\s*from\s*[\'"]lucide-react[\'"]', content)
            if match and icon not in match.group(1):
                new_import = match.group(0).replace("from 'lucide-react'", f", {icon} }} from 'lucide-react'").replace("} ,", ",")
                content = content.replace(match.group(0), new_import)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
