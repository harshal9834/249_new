import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Make sure aircraft={currentAircraft!} is passed to EngineDigitalTwin
app_content = re.sub(r"<EngineDigitalTwin\s*aircraftTailNumber=\{currentAircraft \? `\$\{currentAircraft\.tailNumber\} \(\$\{currentAircraft\.name\}\)` : 'AF-023 \(F-35A\)'\}\s*/>",
                     "<EngineDigitalTwin aircraftTailNumber={currentAircraft ? `${currentAircraft.tailNumber} (${currentAircraft.name})` : 'AF-023 (F-35A)'} aircraft={currentAircraft!} />",
                     app_content)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_content)
