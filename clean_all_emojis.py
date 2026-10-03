import os
import re

# Comprehensive emoji Unicode ranges
emoji_pattern = re.compile(
    r'['
    r'\U0001f600-\U0001f64f'  # emoticons
    r'\U0001f300-\U0001f5ff'  # symbols & pictographs
    r'\U0001f680-\U0001f6ff'  # transport & map symbols
    r'\U0001f1e0-\U0001f1ff'  # flags (iOS)
    r'\U00002702-\U000027b0'  # Dingbats
    r'\U000024C2-\U0001F251'
    r']+', flags=re.UNICODE)

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if emoji_pattern.search(content) or '✈' in content or '⚠️' in content:
                # Replace known emojis with lucide icons or symbols
                content = content.replace('🛩️', '<Plane className="inline w-4 h-4 mr-1" />')
                content = content.replace('🛩', '<Plane className="inline w-4 h-4 mr-1" />')
                content = content.replace('🛠️', '<Wrench className="inline w-4 h-4 mr-1" />')
                content = content.replace('🛠', '<Wrench className="inline w-4 h-4 mr-1" />')
                content = content.replace('⚙️', '<Settings className="inline w-4 h-4 mr-1" />')
                content = content.replace('⚙', '<Settings className="inline w-4 h-4 mr-1" />')
                content = content.replace('🛡️', '<ShieldAlert className="inline w-4 h-4 mr-1" />')
                content = content.replace('🛡', '<ShieldAlert className="inline w-4 h-4 mr-1" />')
                content = content.replace('✈️', '<Plane className="inline w-4 h-4 mr-1" />')
                content = content.replace('✈', '<Plane className="inline w-4 h-4 mr-1" />')
                content = content.replace('⚠️', '<AlertTriangle className="inline w-4 h-4 mr-1" />')
                content = content.replace('✨', '<Sparkles className="inline w-4 h-4 mr-1" />')
                
                # Use regex to strip any remaining unmapped emojis
                content = emoji_pattern.sub('', content)

                # Ensure icons are imported if we injected them
                for icon in ['Plane', 'Wrench', 'Settings', 'ShieldAlert', 'AlertTriangle', 'Sparkles']:
                    if f"<{icon}" in content:
                        if "from 'lucide-react'" in content:
                            if icon not in content[:content.find("from 'lucide-react'")]:
                                content = content.replace("from 'lucide-react'", f", {icon} }} from 'lucide-react'").replace("} ,", ",")
                                content = re.sub(r'\}\s*\}\s*from', '} from', content)
                        else:
                            content = f"import {{ {icon} }} from 'lucide-react';\n" + content

                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
