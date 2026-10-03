import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Replace the specific corrupted line in the footer
app_content = re.sub(
    r"<span>[^<]*?</span>\s*<span>Unified Air Fleet Predictive Maintenance & Digital Twin Platform</span>",
    "<span className=\"mx-2\">•</span>\n            <span>Unified Air Fleet Predictive Maintenance & Digital Twin Platform</span>",
    app_content
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_content)
