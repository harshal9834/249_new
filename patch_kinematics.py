import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add missing kinematic fields to createNewAircraft
fix_kinematics = """        heading: 360,
        bankAngle: 0,
        pitchAngle: 0,
        verticalSpeed: 0,
        groundSpeed: 0,
        machNumber: 0,
        angleOfAttack: 0,"""

content = content.replace("        heading: 360,", fix_kinematics)

# Also fix the % 360 bug that turns 360 immediately into 0
content = content.replace("heading = (heading + turnRate * dt) % 360;", "heading = (heading + turnRate * dt);\n            if (heading >= 360) heading -= 360;")

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
