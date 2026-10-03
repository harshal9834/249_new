import re

with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

bad_block = re.search(r"\{activeModule === 'maintenance-planner'.*?<footer", content, re.DOTALL)

if bad_block:
    new_block = """{activeModule === 'maintenance-planner' && (
          <TechnicalRecords />
        )}

        {activeModule === 'notifications' && (
          <NotificationCenter
            notifications={notifications}
            onMarkRead={handleMarkNotifRead}
            onNavigateToTarget={(url) => {
              if (url?.includes('/aircraft/')) {
                const id = url.split('/aircraft/')[1];
                setSelectedAircraftId(id);
                setIsViewingDetails(true);
                setActiveModule('aircraft-management');
              } else if (url?.includes('/inventory')) {
                setActiveModule('spare-parts');
              } else if (url?.includes('/predictive')) {
                setActiveModule('predictive-maintenance');
              } else if (url?.includes('/maintenance')) {
                setActiveModule('maintenance-planner');
              }
            }}
          />
        )}

        {activeModule === 'simulator' && (
          <SimulatorErrorBoundary>
            <SimulatorControlCenter />
          </SimulatorErrorBoundary>
        )}
      </main>

      {/* Executive Defense Footer */}
      <footer"""
    content = content[:bad_block.start()] + new_block + content[bad_block.end()-7:]
    
    with open('src/App.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
