import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

app_content = app_content.replace(
    "<span>?</span>",
    "<span className=\"mx-2\">•</span>"
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_content)
