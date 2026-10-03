import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix tier in Agency creation
content = content.replace("{ name: 'Lockheed Martin Aerospace', location: 'Fort Worth, TX' }", "{ name: 'Lockheed Martin Aerospace', location: 'Fort Worth, TX', tier: 'Tier 1' }")
content = content.replace("{ name: 'USAF Base Maintenance Facility', location: 'Nellis AFB, NV' }", "{ name: 'USAF Base Maintenance Facility', location: 'Nellis AFB, NV', tier: 'Tier 1' }")
content = content.replace("{ name: 'AeroPulse Rapid Response', location: 'Mobile Unit' }", "{ name: 'AeroPulse Rapid Response', location: 'Mobile Unit', tier: 'Tier 2' }")

# Fix orderBy in MaintenanceRecord
content = content.replace("orderBy: { createdAt: 'desc' }", "orderBy: { performedAt: 'desc' }")

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
