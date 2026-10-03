import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  Wrench, 
  Package, 
  Zap, 
  CheckCheck, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { FleetNotification } from '../types/fleet';

interface NotificationCenterProps {
  notifications: FleetNotification[];
  onMarkRead: (id: string) => void;
  onNavigateToTarget: (url?: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkRead,
  onNavigateToTarget
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filtered = notifications.filter(n => {
    if (severityFilter !== 'ALL' && n.severity !== severityFilter) return false;
    return true;
  });

  const getSeverityBadge = (severity: FleetNotification['severity']) => {
    switch (severity) {
      case 'Critical':
        return {
          icon: ShieldAlert,
          bg: 'bg-red-100 text-red-700 border-red-200',
          borderLeft: 'border-l-red-600'
        };
      case 'Warning':
        return {
          icon: AlertTriangle,
          bg: 'bg-amber-100 text-amber-700 border-amber-200',
          borderLeft: 'border-l-amber-500'
        };
      case 'Maintenance Due':
        return {
          icon: Wrench,
          bg: 'bg-blue-100 text-blue-700 border-blue-200',
          borderLeft: 'border-l-blue-600'
        };
      case 'Inventory Shortage':
        return {
          icon: Package,
          bg: 'bg-purple-100 text-purple-700 border-purple-200',
          borderLeft: 'border-l-purple-600'
        };
      case 'AI Prediction Alert':
        return {
          icon: Zap,
          bg: 'bg-indigo-100 text-indigo-700 border-indigo-200',
          borderLeft: 'border-l-indigo-600'
        };
      default:
        return {
          icon: Bell,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          borderLeft: 'border-l-slate-400'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Fleet Notification & Alert Center</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-mono font-medium">
              REAL-TIME DISPATCH
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time critical faults, telemetry exceedances, depot milestones, inventory shortages, and predictive AI model alerts.
          </p>
        </div>

        <button
          onClick={() => onMarkRead('all')}
          className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors self-start md:self-auto font-medium"
        >
          <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
          <span>Mark All as Acknowledged</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-2 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center space-x-1">
          <Filter className="w-3 h-3" />
          <span>Filter:</span>
        </span>
        {(['ALL', 'Critical', 'Warning', 'Maintenance Due', 'Inventory Shortage', 'AI Prediction Alert'] as const).map(sev => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
              severityFilter === sev
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {sev === 'ALL' ? 'All Alerts' : sev}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map(item => {
          const badge = getSeverityBadge(item.severity);
          const Icon = badge.icon;

          return (
            <div
              key={item.id}
              className={`bg-white p-4 rounded-lg border border-slate-200 shadow-xs border-l-4 ${badge.borderLeft} flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                !item.isRead ? 'ring-1 ring-blue-500/20 bg-blue-50/20' : ''
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className={`p-2 rounded-md ${badge.bg} shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${badge.bg}`}>
                      {item.severity}
                    </span>
                    {item.tailNumber && (
                      <span className="text-xs font-mono font-bold text-slate-800">[{item.tailNumber}]</span>
                    )}
                    {!item.isRead && (
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 mt-1">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.message}</p>
                  <div className="text-[11px] font-mono text-slate-400 mt-1.5">
                    Timestamp: {new Date(item.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                {!item.isRead && (
                  <button
                    onClick={() => onMarkRead(item.id)}
                    className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs border border-slate-200"
                  >
                    Acknowledge
                  </button>
                )}
                {item.actionUrl && (
                  <button
                    onClick={() => onNavigateToTarget(item.actionUrl)}
                    className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center space-x-1"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white p-12 rounded-lg border border-slate-200 text-center text-slate-500 text-xs">
            No active alerts matching this filter criteria. Fleet systems nominal.
          </div>
        )}
      </div>
    </div>
  );
};
