import re
import os

# 1. Patch server.ts for CORS
with open('server.ts', 'r', encoding='utf-8') as f:
    server_content = f.read()

# Add cors import
if "import cors from 'cors';" not in server_content:
    server_content = server_content.replace("import express, { Request, Response } from 'express';", "import express, { Request, Response } from 'express';\nimport cors from 'cors';")

# Add app.use(cors)
if "app.use(cors(" not in server_content:
    server_content = server_content.replace("app.use(express.json());", "app.use(express.json());\napp.use(cors({ origin: '*' })); // Allow all origins for Vercel/Render split")

# Add cors to socket.io
if "cors: {" not in server_content:
    server_content = server_content.replace("const io = new Server(server);", "const io = new Server(server, {\n  cors: {\n    origin: '*',\n    methods: ['GET', 'POST']\n  }\n});")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(server_content)


# 2. Patch Frontend Files for VITE_API_URL
def patch_file(filepath):
    if not os.path.exists(filepath): return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace fetch('/api/... with fetch(`${import.meta.env.VITE_API_URL || ''}/api/...
    content = content.replace("fetch('/api", "fetch(`${import.meta.env.VITE_API_URL || ''}/api")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

frontend_files = [
    'src/App.tsx',
    'src/components/AiCopilot.tsx',
    'src/store/simulatorStore.ts'
]

for f in frontend_files:
    patch_file(f)

# 3. Patch socket.io client connection in simulatorStore.ts
with open('src/store/simulatorStore.ts', 'r', encoding='utf-8') as f:
    sim_content = f.read()

if "const socket = io();" in sim_content:
    sim_content = sim_content.replace("const socket = io();", "const socket = io(import.meta.env.VITE_API_URL || '');")

with open('src/store/simulatorStore.ts', 'w', encoding='utf-8') as f:
    f.write(sim_content)
