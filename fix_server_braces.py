import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the stray braces before startServer
content = content.replace("  } catch(e: any) { res.status(500).json({ error: e.message }); }\n});\n }\n});\n\nasync function startServer() {", 
                          "  } catch(e: any) { res.status(500).json({ error: e.message }); }\n});\n\nasync function startServer() {")

# Just to be safe if formatting is slightly different:
content = re.sub(r"\}\);\n\s*\}\n\}\);\n\nasync function startServer\(\)", "});\n\nasync function startServer()", content)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
