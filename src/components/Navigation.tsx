import React from 'react';
import { 
  LayoutDashboard, 
  Plane, 
  Box, 
  Cpu, 
  Zap, 
  SlidersHorizontal, 
  Bot, 
  CalendarClock, 
  Package, 
  BarChart3, 
  Bell
} from 'lucide-react';

export type NavModule = 
  | 'command-center'
  | 'aircraft-management'
  | 'aircraft-digital-twin'
  | 'engine-digital-twin'
  | 'predictive-maintenance'
  | 'availability-simulator'
  | 'ai-copilot'
  | 'maintenance-planner'
  | 'spare-parts'
  | 'fleet-analytics'
  | 'notifications'
  | 'simulator';

interface NavigationProps {
  activeModule: NavModule;
  setActiveModule: (module: NavModule) => void;
  unreadAlertsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeModule,
  setActiveModule,
  unreadAlertsCount
}) => {
  const navItems = [
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
    { id: 'aircraft-management', label: 'Aircraft Fleet', icon: Plane },
    { id: 'aircraft-digital-twin', label: 'Aircraft 3D Twin', icon: Box, badge: '3D' },
    { id: 'engine-digital-twin', label: 'Engine 3D Twin', icon: Cpu, badge: '3D' },
    { id: 'predictive-maintenance', label: 'Predictive AI', icon: Zap },
    { id: 'availability-simulator', label: 'Availability Sim', icon: SlidersHorizontal },
    { id: 'ai-copilot', label: 'AI Copilot', icon: Bot, badge: 'Dual AI' },
    { id: 'maintenance-planner', label: 'Technical Records', icon: CalendarClock },
    { id: 'spare-parts', label: 'Spare Parts Depot', icon: Package },
    { id: 'fleet-analytics', label: 'Maintenance Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Alerts', icon: Bell, badge: unreadAlertsCount > 0 ? `${unreadAlertsCount}` : undefined, badgeColor: 'bg-red-500 text-white' }
  ];

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-slate-200">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id as NavModule)}
                className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-bold leading-tight ${
                      item.badgeColor || (isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700')
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
