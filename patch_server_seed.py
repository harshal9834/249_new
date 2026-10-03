import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("{ name: 'Turbofan Compressor Blade', stockQuantity: 42, unitCost: 12500 }", "{ name: 'Turbofan Compressor Blade', partNumber: 'ENG-F135-01', stockQuantity: 42, minThreshold: 15, unitCost: 12500 }")
content = content.replace("{ name: 'Hydraulic Actuator', stockQuantity: 8, unitCost: 4500 }", "{ name: 'Hydraulic Actuator', partNumber: 'HYD-ACT-09', stockQuantity: 8, minThreshold: 10, unitCost: 4500 }")
content = content.replace("{ name: 'AESA Radar Module', stockQuantity: 2, unitCost: 85000 }", "{ name: 'AESA Radar Module', partNumber: 'AVI-RAD-33', stockQuantity: 2, minThreshold: 5, unitCost: 85000 }")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
