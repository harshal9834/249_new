import os
import re

emoji_pattern = re.compile(r'[\U00010000-\U0010ffff]')
files_with_emojis = []

for root, _, files in os.walk('src/components'):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                if emoji_pattern.search(content):
                    files_with_emojis.append(path)

print("Files with emojis:", files_with_emojis)
