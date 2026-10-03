import re
import codecs

paths = ['src/components/AircraftManagement.tsx', 'src/components/CommandCenter.tsx']

for path in paths:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if we need to add Plane import
    if "import { Plane" not in content and "import {Plane" not in content and "from 'lucide-react'" in content:
        content = content.replace("from 'lucide-react';", ", Plane } from 'lucide-react';")
    elif "lucide-react" not in content:
        content = "import { Plane } from 'lucide-react';\n" + content
    
    # Replace the airplane emoji and other common emojis
    content = content.replace('✈️', '<Plane className="inline w-4 h-4 mr-1" />')
    content = content.replace('✈', '<Plane className="inline w-4 h-4 mr-1" />')
    content = content.replace('🚀', '<Rocket className="inline w-4 h-4 mr-1" />')
    content = content.replace('⚠️', '<AlertTriangle className="inline w-4 h-4 mr-1" />')
    content = content.replace('✨', '<Sparkles className="inline w-4 h-4 mr-1" />')
    
    # Make sure we import added icons if missing
    for icon in ['Rocket', 'AlertTriangle', 'Sparkles']:
        if f"<{icon}" in content and f"{icon}" not in content[:content.find("from 'lucide-react'")]:
            content = content.replace("from 'lucide-react';", f", {icon} }} from 'lucide-react';")
            
    # Fix import comma issues if it became `import { ..., Icon } } from 'lucide-react';` 
    content = re.sub(r'\}\s*\}\s*from', '} from', content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
