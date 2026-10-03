import re

with open('src/types/fleet.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the duplicates (humidity, windSpeed, ambientPressure are already in the base properties or added twice)
# Let's just find the second occurrence and remove it, or regex out the exact block.
# Alternatively, I'll just remove all occurrences and add them exactly once.

# Remove existing
content = re.sub(r"\s*humidity\?: number;", "", content)
content = re.sub(r"\s*windSpeed\?: number;", "", content)
content = re.sub(r"\s*ambientPressure\?: number;", "", content)

# Re-insert them exactly once under altitude?: number;
content = content.replace("altitude?: number;", "altitude?: number;\n  humidity?: number;\n  windSpeed?: number;\n  ambientPressure?: number;")

with open('src/types/fleet.ts', 'w', encoding='utf-8') as f:
    f.write(content)
