import React from 'react';
import { 
  Plane, 
  Truck, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowUpRight, 
  ShieldAlert, 
  Wrench, 
  Activity, 
  Zap,
  TrendingDown,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { FleetMetrics, Aircraft, FleetNotification, MaintenanceScheduleItem } from '../types/fleet';

interface CommandCenterProps {
  metrics: FleetMetrics;
  topRiskAircraft: Aircraft[];
  recentAlerts: FleetNotification[];
  recentActivities: MaintenanceScheduleItem[];
  onSelectAircraft: (aircraftId: string) => void;
  onNavigate: (module: any) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  metrics,
  topRiskAircraft,
  recentAlerts,
  recentActivities,
  onSelectAircraft,
  onNavigate
}) => {
  // Semi-circle gauge calculation
  const readiness = metrics.missionReadinessRate || 78.4;
  const radius = 70;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (readiness / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Top Banner / Briefing Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Fleet Command Center</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200">
              AIR COMBAT & LOGISTICS COMMAND
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time digital twin monitoring, AI residual health calculations, and dynamic readiness indices across active theaters.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigate('availability-simulator')}
            className="flex items-center space-x-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Launch Availability Simulator</span>
          </button>
          <button
            onClick={() => onNavigate('ai-copilot')}
            className="flex items-center space-x-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Copilot Briefing</span>
          </button>
        </div>
      </div>

      {/* Fleet Overview Cards (6 core metric cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Aircraft */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Aircraft</span>
            <Plane className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono">{metrics.total}</div>
          <div className="mt-1 text-[11px] text-slate-500">Across 3 squadrons</div>
        </div>

        {/* Operational */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Operational</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 font-mono">{metrics.operational}</div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">Sortie ready</div>
        </div>

        {/* Warning */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Warning</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 font-mono">{metrics.warning}</div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">Subsystem degraded</div>
        </div>

        {/* Maintenance */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Maintenance</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-600 font-mono">{metrics.maintenance}</div>
          <div className="mt-1 text-[11px] text-blue-700 font-medium">In depot / hangar</div>
        </div>

        {/* Critical */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs border-l-4 border-l-red-500">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Critical</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600 font-mono">{metrics.critical}</div>
          <div className="mt-1 text-[11px] text-red-700 font-medium">RED X Grounded</div>
        </div>

        {/* Fleet Availability % */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs border-l-4 border-l-indigo-600">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Availability</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-700 font-mono">{metrics.availabilityPct}%</div>
          <div className="mt-1 text-[11px] text-slate-500">Target: 85.0%</div>
        </div>
      </div>

      {/* Fleet Categories Cards & Readiness Gauge Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Section (Spans 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Fleet Divisions & Category Readiness</h2>
            <button
              onClick={() => onNavigate('aircraft-management')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
            >
              <span>View Full Airframe Table</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fighter Fleet */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                    <Plane className="inline w-4 h-4 mr-1" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">Fighter Fleet</h3>
                    <p className="text-[11px] text-slate-500">Air Superiority & Strike</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                  {metrics.categories.Fighter.total} Jets
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-emerald-50/60 rounded p-2 border border-emerald-100">
                  <div className="text-[10px] uppercase font-semibold text-emerald-700">Healthy</div>
                  <div className="text-base font-bold text-emerald-800 font-mono mt-0.5">{metrics.categories.Fighter.healthy}</div>
                </div>
                <div className="bg-amber-50/60 rounded p-2 border border-amber-100">
                  <div className="text-[10px] uppercase font-semibold text-amber-700">Warning</div>
                  <div className="text-base font-bold text-amber-800 font-mono mt-0.5">{metrics.categories.Fighter.warning}</div>
                </div>
                <div className="bg-red-50/60 rounded p-2 border border-red-100">
                  <div className="text-[10px] uppercase font-semibold text-red-700">Critical</div>
                  <div className="text-base font-bold text-red-800 font-mono mt-0.5">{metrics.categories.Fighter.critical}</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>F-35A, F-15EX, F-22A</span>
                <span className="font-semibold text-slate-700">
                  {Math.round((metrics.categories.Fighter.healthy / (metrics.categories.Fighter.total || 1)) * 100)}% Ready
                </span>
              </div>
            </div>

            {/* Transport Fleet */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">Transport Fleet</h3>
                    <p className="text-[11px] text-slate-500">Airlift & Tanker Wings</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                  {metrics.categories.Transport.total} Planes
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-emerald-50/60 rounded p-2 border border-emerald-100">
                  <div className="text-[10px] uppercase font-semibold text-emerald-700">Healthy</div>
                  <div className="text-base font-bold text-emerald-800 font-mono mt-0.5">{metrics.categories.Transport.healthy}</div>
                </div>
                <div className="bg-amber-50/60 rounded p-2 border border-amber-100">
                  <div className="text-[10px] uppercase font-semibold text-amber-700">Warning</div>
                  <div className="text-base font-bold text-amber-800 font-mono mt-0.5">{metrics.categories.Transport.warning}</div>
                </div>
                <div className="bg-red-50/60 rounded p-2 border border-red-100">
                  <div className="text-[10px] uppercase font-semibold text-red-700">Critical</div>
                  <div className="text-base font-bold text-red-800 font-mono mt-0.5">{metrics.categories.Transport.critical}</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>C-130J, C-17A, KC-46</span>
                <span className="font-semibold text-slate-700">
                  {Math.round((metrics.categories.Transport.healthy / (metrics.categories.Transport.total || 1)) * 100)}% Ready
                </span>
              </div>
            </div>

            {/* UAV Fleet */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Plane className="inline w-4 h-4 mr-1" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">UAV Fleet</h3>
                    <p className="text-[11px] text-slate-500">ISR & Autonomous Wings</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
                  {metrics.categories.UAV.total} Drones
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-emerald-50/60 rounded p-2 border border-emerald-100">
                  <div className="text-[10px] uppercase font-semibold text-emerald-700">Healthy</div>
                  <div className="text-base font-bold text-emerald-800 font-mono mt-0.5">{metrics.categories.UAV.healthy}</div>
                </div>
                <div className="bg-amber-50/60 rounded p-2 border border-amber-100">
                  <div className="text-[10px] uppercase font-semibold text-amber-700">Warning</div>
                  <div className="text-base font-bold text-amber-800 font-mono mt-0.5">{metrics.categories.UAV.warning}</div>
                </div>
                <div className="bg-red-50/60 rounded p-2 border border-red-100">
                  <div className="text-[10px] uppercase font-semibold text-red-700">Critical</div>
                  <div className="text-base font-bold text-red-800 font-mono mt-0.5">{metrics.categories.UAV.critical}</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                <span>MQ-9A, RQ-4B, MQ-25</span>
                <span className="font-semibold text-slate-700">
                  {Math.round((metrics.categories.UAV.healthy / (metrics.categories.UAV.total || 1)) * 100)}% Ready
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Readiness Gauge Dial */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Fleet Readiness Index</h2>
              <p className="text-[11px] text-slate-500">Mission Capable vs Operational Ceiling</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
              LEVEL 2 READINESS
            </span>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            {/* SVG Semicircle Dial */}
            <div className="relative w-48 h-28 flex items-center justify-center overflow-hidden">
              <svg className="w-48 h-48 -rotate-90 transform origin-center" viewBox="0 0 160 160">
                {/* Background arc */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke="#e2e8f0"
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeLinecap="round"
                />
                {/* Active readiness arc */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  stroke={readiness >= 80 ? '#10b981' : readiness >= 70 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="14"
                  fill="transparent"
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              <div className="absolute top-12 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{readiness}%</span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Mission Ready</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-2 text-center text-xs">
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <div className="text-slate-400 text-[10px] uppercase">MTBF Target</div>
                <div className="font-bold text-slate-800 font-mono">412.5 Hrs</div>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <div className="text-slate-400 text-[10px] uppercase">Theater Sorties</div>
                <div className="font-bold text-emerald-700 font-mono">18 / 24 Deployable</div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-100 flex items-center justify-between">
            <span>Minimum DoD Threshold: 75.0%</span>
            <span className="text-emerald-600 font-semibold font-mono">+3.4% Surplus</span>
          </div>
        </div>
      </div>

      {/* Top Risk Aircraft Section & Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Risk Aircraft (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Top Risk Aircraft (Priority Queue)</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Airframes exceeding harmonic or thermal degradation thresholds</p>
            </div>
            <button
              onClick={() => onNavigate('predictive-maintenance')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
            >
              <span>Predictive Diagnostics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {topRiskAircraft.map(ac => {
              const degradedComp = ac.components.find(c => c.status === 'Critical' || c.status === 'Warning') || ac.components[0];
              const isCrit = ac.status === 'Critical';
              return (
                <div
                  key={ac.id}
                  className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCrit ? 'bg-red-50/40 border-red-200' : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-9 h-9 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isCrit ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                      }`}
                    >
                      {ac.tailNumber.split('-')[1] || ac.tailNumber}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">{ac.tailNumber}</span>
                        <span className="text-xs text-slate-600 font-medium">{ac.name}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${
                            ac.status === 'Critical'
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : ac.status === 'Maintenance'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {ac.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Squadron: <strong className="text-slate-700">{ac.squadron}</strong></span>
                        <span>•</span>
                        <span>
                          Failing Component: <strong className="text-slate-800">{degradedComp?.name || 'Engine'}</strong>
                        </span>
                        <span>•</span>
                        <span className="font-mono text-red-600 font-semibold">
                          RUL: {degradedComp?.rulHours || 42}h remaining
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Health Index</div>
                      <div className="text-sm font-bold font-mono text-slate-900">{ac.healthScore}%</div>
                    </div>

                    <button
                      onClick={() => onSelectAircraft(ac.id)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded border border-slate-300 shadow-2xs transition-colors flex items-center space-x-1"
                    >
                      <span>Digital Twin</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Alerts & Maintenance Feed (1 Column) */}
        <div className="space-y-6">
          {/* Recent Alerts */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Recent Alerts</h3>
              </div>
              <button
                onClick={() => onNavigate('notifications')}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {recentAlerts.map(alert => (
                <div
                  key={alert.id}
                  onClick={() => onNavigate('notifications')}
                  className="p-2.5 rounded bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        alert.severity === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : alert.severity === 'Warning'
                          ? 'bg-amber-100 text-amber-700'
                          : alert.severity === 'Inventory Shortage'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1 line-clamp-1">{alert.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{alert.message}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Maintenance Activities */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Maintenance Queue</h3>
              </div>
              <button
                onClick={() => onNavigate('maintenance-planner')}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
              >
                Depot Board
              </button>
            </div>

            <div className="space-y-2.5">
              {recentActivities.map(act => (
                <div key={act.id} className="p-2.5 rounded border border-slate-200 bg-white hover:border-slate-300">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{act.tailNumber} - {act.title}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                        act.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex justify-between items-center">
                    <span>{act.bayLocation}</span>
                    <span className="font-mono text-slate-700 font-medium">{act.estimatedHours} hrs est</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
