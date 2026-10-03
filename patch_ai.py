import re

with open('src/components/PredictiveMaintenance.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

import_stmt = "import { HistoricalTelemetryTrends } from './HistoricalTelemetryTrends';\n"
if "HistoricalTelemetryTrends" not in content:
    content = import_stmt + content

# Inject before the final closing div
last_div = content.rfind("</div>")
content = content[:last_div] + "      <HistoricalTelemetryTrends />\n    " + content[last_div:]

with open('src/components/PredictiveMaintenance.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
