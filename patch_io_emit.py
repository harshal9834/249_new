import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("socket.broadcast.emit('telemetry_update', data);", "io.emit('telemetry_update', data);")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
