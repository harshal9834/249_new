import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("const prisma = new PrismaClient();", "const prisma = new PrismaClient();\nconst app = express();")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
