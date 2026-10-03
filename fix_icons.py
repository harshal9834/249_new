import re

# 1. Fix Header.tsx emoji corruption
with open('src/components/Header.tsx', 'r', encoding='utf-8') as f:
    header_content = f.read()

header_content = header_content.replace(
    "import { Bell, ChevronDown, CheckCircle2, Plane, Clock, Radio, Activity, Layers } from 'lucide-react';",
    "import { Bell, ChevronDown, CheckCircle2, Plane, Clock, Radio, Activity, Layers, Rocket } from 'lucide-react';"
)

header_content = header_content.replace(
    "<span>dYs?</span>",
    "<Rocket className=\"w-4 h-4\" />"
)
header_content = header_content.replace(
    "<span>🚀</span>",
    "<Rocket className=\"w-4 h-4\" />"
)

with open('src/components/Header.tsx', 'w', encoding='utf-8') as f:
    f.write(header_content)

# 2. Fix App.tsx emoji corruption
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

app_content = app_content.replace(
    "<span>?</span>",
    "<span className=\"mx-2\">•</span>"
)
app_content = app_content.replace(
    "<span>✈️</span>",
    "<span className=\"mx-2\">•</span>"
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_content)
