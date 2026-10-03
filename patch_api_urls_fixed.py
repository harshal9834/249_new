import os

def patch_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace("fetch('/api", "fetch((import.meta.env.VITE_API_URL || '') + '/api")
    content = content.replace('fetch("/api', 'fetch((import.meta.env.VITE_API_URL || "") + "/api')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

frontend_files = [
    'src/App.tsx',
    'src/components/AiCopilot.tsx',
    'src/store/simulatorStore.ts'
]

for f in frontend_files:
    patch_file(f)

# Patch socket.io client connection in simulatorStore.ts
with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    sim_content = f.read()

sim_content = sim_content.replace("const socket = io();", "const socket = io(import.meta.env.VITE_API_URL || '');")

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(sim_content)
