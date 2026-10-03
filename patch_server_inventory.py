import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace inventory endpoints safely
inventory_patch = """app.get('/api/inventory', async (_req, res) => {
  try {
    const parts = await prisma.sparePart.findMany();
    if (parts.length === 0) {
      await prisma.sparePart.createMany({
        data: [
          { name: 'Turbofan Compressor Blade', category: 'Propulsion', stockQuantity: 42, unitCost: 12500, leadTimeDays: 45 },
          { name: 'Hydraulic Actuator', category: 'Hydraulics', stockQuantity: 8, unitCost: 4500, leadTimeDays: 14 },
          { name: 'AESA Radar Module', category: 'Avionics', stockQuantity: 2, unitCost: 85000, leadTimeDays: 120 }
        ]
      });
      const newParts = await prisma.sparePart.findMany();
      res.json(newParts);
      return;
    }
    res.json(parts);
  } catch(e) { res.status(500).json({ error: 'DB Error' }); }
});

app.post('/api/inventory/reorder', async (req, res) => {
  try {
    const { partId, quantity } = req.body;
    const part = await prisma.sparePart.findUnique({ where: { id: partId } });
    if (!part) { res.status(404).json({ error: 'Part not found' }); return; }
    await prisma.sparePart.update({
      where: { id: partId },
      data: { stockQuantity: part.stockQuantity + quantity }
    });
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: 'DB Error' }); }
});"""

content = re.sub(
    r"app\.get\('/api/inventory', \(_req: Request, res: Response\) => \{[\s\S]*?res\.json\(\{ message: 'Purchase requisition approved and stock replenished', part \}\);\n\s*\}\);",
    inventory_patch,
    content
)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
