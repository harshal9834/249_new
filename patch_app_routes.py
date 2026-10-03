import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add routing blocks for spare-parts and fleet-analytics
routing_blocks = """
        {activeModule === 'spare-parts' && (
          <ErrorBoundary moduleName="Spare Parts Depot">
            <SparePartsDepot />
          </ErrorBoundary>
        )}

        {activeModule === 'fleet-analytics' && (
          <ErrorBoundary moduleName="Maintenance Analytics">
            <MaintenanceAnalyticsCenter />
          </ErrorBoundary>
        )}
      </main>
"""

# Insert right before </main>
content = content.replace("</main>", routing_blocks)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
