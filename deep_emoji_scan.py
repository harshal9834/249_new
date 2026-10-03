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

found_emojis = {}

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                matches = emoji_pattern.findall(content)
                if matches:
                    found_emojis[path] = set(matches)

print("Files with emojis:", found_emojis)
