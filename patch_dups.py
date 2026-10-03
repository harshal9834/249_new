import re

with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('''        bankAngle: 0,
        pitchAngle: 0,
        verticalSpeed: 0,
        groundSpeed: 0,
        machNumber: 0,
        angleOfAttack: 0,
        bankAngle: 0,
        pitchAngle: 0,
        verticalSpeed: 0,''', '''        bankAngle: 0,
        pitchAngle: 0,
        verticalSpeed: 0,
        groundSpeed: 0,
        machNumber: 0,
        angleOfAttack: 0,''')

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)
