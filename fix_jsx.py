import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the broken block
broken_block_regex = r"\{activeModule === 'maintenance-planner' && \([\s\S]*?\*/\}"
fixed_block = """{activeModule === 'maintenance-planner' && (
          <TechnicalRecords />
        )}"""

content = re.sub(broken_block_regex, fixed_block, content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
