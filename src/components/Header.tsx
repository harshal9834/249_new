import React from 'react';
import { 
  ShieldAlert, 
  Bell, 
  Activity, 
  Radio, 
  User, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle,
  Plane,
  Clock,
  Layers
} from 'lucide-react';
import { UserRole, FleetNotification } from '../types/fleet';

interface HeaderProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedWing: string;
  setSelectedWing: (wing: string) => void;
  notifications: FleetNotification[];
  onOpenNotifications: () => void;
  availabilityPct: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  setCurrentRole,
  selectedWing,
  setSelectedWing,
  notifications,
  onOpenNotifications,
  availabilityPct
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);
  const [wingMenuOpen, setWingMenuOpen] = React.useState(false);
  const [zuluTime, setZuluTime] = React.useState('');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const mins = String(now.getUTCMinutes()).padStart(2, '0');
      const secs = String(now.getUTCSeconds()).padStart(2, '0');
      setZuluTime(`${hours}:${mins}:${secs}Z`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const wings = [
    'Global Air Fleet Command (All Wings)',
    '388th Fighter Wing (Hill AFB, UT)',
    '86th Airlift Wing (Ramstein AB, GE)',
    '432d Reconnaissance Wing (Creech AFB, NV)',
    '142d Strike Wing (Portland ANGB, OR)'
  ];

  const roles: UserRole[] = ['Fleet Commander', 'Maintenance Officer', 'Admin', 'Viewer'];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Defense Classification Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-[11px] font-mono tracking-wider px-4 py-1 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-100">DEFENSE FLIGHT READINESS DATA SYSTEM</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">UNCLASSIFIED // FOR OFFICIAL USE ONLY</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>ZULU: {zuluTime || '00:00:00Z'}</span>
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-emerald-400 flex items-center space-x-1">
            <Radio className="w-3 h-3" />
            <span>TELEMETRY FEED: ONLINE (2.4 GHz MIL-SPEC)</span>
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Emblem */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm ring-1 ring-slate-800">
            <Plane className="w-5 h-5 text-blue-400 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">AeroPulse</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono">
                AI MIL-TWIN
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Unified Air Fleet Predictive Maintenance & Digital Twin</p>
          </div>
        </div>

        {/* Center Wing Selector */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="relative">
            <button
              onClick={() => { setWingMenuOpen(!wingMenuOpen); setRoleMenuOpen(false); }}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <span className="max-w-[240px] truncate">{selectedWing}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {wingMenuOpen && (
              <div className="absolute left-0 mt-1 w-72 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Air Base / Command Wing
                </div>
                {wings.map(wing => (
                  <button
                    key={wing}
                    onClick={() => { setSelectedWing(wing); setWingMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      selectedWing === wing ? 'bg-blue-50/70 text-blue-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{wing}</span>
                    {selectedWing === wing && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Availability Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-700">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-500">Fleet Avail:</span>
            <span className="font-semibold text-slate-900">{availabilityPct}%</span>
          </div>
        </div>

        {/* Right Section: Notifications & Role */}
        <div className="flex items-center space-x-3">
          {/* Notification Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Role Switcher */}
          <div className="relative">
            <button
              onClick={() => { setRoleMenuOpen(!roleMenuOpen); setWingMenuOpen(false); }}
              className="flex items-center space-x-2 pl-2.5 pr-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-xs"
            >
              <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-[10px]">
                {currentRole[0]}
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-semibold text-slate-800 leading-none">{currentRole}</p>
                <p className="text-[10px] text-slate-400 leading-tight">Role Access</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Active Role (RBAC)
                </div>
                {roles.map(role => (
                  <button
                    key={role}
                    onClick={() => { setCurrentRole(role); setRoleMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                      currentRole === role ? 'bg-blue-50/70 text-blue-700 font-medium' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{role}</div>
                      <div className="text-[10px] text-slate-400">
                        {role === 'Fleet Commander' && 'Full Operational & Sortie Authority'}
                        {role === 'Maintenance Officer' && 'Work Orders & Part Requisition'}
                        {role === 'Admin' && 'Full System & Hardware Telemetry'}
                        {role === 'Viewer' && 'Read-only Strategic Dashboard'}
                      </div>
                    </div>
                    {currentRole === role && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
