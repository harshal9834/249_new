import os
import re

emoji_pattern = re.compile(r'[\U00010000-\U0010ffff]')

for path in ['src/components/AircraftManagement.tsx', 'src/components/CommandCenter.tsx']:
    print(f"\n--- {path} ---")
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        for i, line in enumerate(lines):
            if emoji_pattern.search(line):
                print(f"Line {i+1}: {line.strip()}")
