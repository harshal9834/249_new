import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all existing const app = express();
content = content.replace("const app = express();", "")

# Add it right after imports
content = re.sub(r"(import express, \{ Request, Response \} from 'express';)", r"\1\nconst app = express();", content)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
