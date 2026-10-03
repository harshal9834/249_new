import React, { useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  ShieldAlert, 
  Activity, 
  Clock, 
  CheckCircle, 
  ArrowUpRight, 
  FileText, 
  Wrench, 
  TrendingUp, 
  ChevronRight,
  Bot
} from 'lucide-react';
import { PredictiveInsight } from '../types/fleet';

interface PredictiveMaintenanceProps {
  insights: PredictiveInsight[];
  onScheduleAction: (insight: PredictiveInsight) => void;
  onAskCopilot: (query: string) => void;
}

export const PredictiveMaintenance: React.FC<PredictiveMaintenanceProps> = ({
  insights,
  onScheduleAction,
  onAskCopilot
}) => {
  const [selectedInsight, setSelectedInsight] = useState<PredictiveInsight>(insights[0] || null);
  const [activeTab, setActiveTab] = useState<'all' | 'critical' | 'priority'>('all');

  const filteredInsights = insights.filter(item => {
    if (activeTab === 'critical') return item.urgency === 'Immediate Grounding';
    if (activeTab === 'priority') return item.urgency === 'Priority';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">AI Predictive Maintenance & RUL Engine</h1>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-mono font-medium">
              ML WEIBULL HAZARD MODEL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated multi-sensor anomaly detection, failure mode predictions, and remaining useful life (RUL) projections.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          {(['all', 'critical', 'priority'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'all' ? 'All Predictions' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Insights Feed + Deep Dive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of AI Predictions */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Active Failure Predictions ({filteredInsights.length})
          </div>

          {filteredInsights.map(insight => {
            const isSelected = selectedInsight?.id === insight.id;
            const isCrit = insight.urgency === 'Immediate Grounding';

            return (
              <div
                key={insight.id}
                onClick={() => setSelectedInsight(insight)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-500 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 font-mono text-xs">{insight.tailNumber}</span>
                    <span className="text-xs text-slate-500 font-medium">{insight.aircraftName}</span>
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      isCrit
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {insight.urgency}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800 mt-2 line-clamp-1">{insight.anomalyType}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-mono line-clamp-1">{insight.componentName}</div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400 text-[11px]">Risk:</span>
                    <span className={`font-mono font-bold ${isCrit ? 'text-red-600' : 'text-amber-600'}`}>
                      {insight.failureRiskScore}/100
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-mono font-bold text-blue-700">{insight.rulFlightHours} hrs RUL</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column (2 Cols): Selected Prediction Deep Breakdown */}
        {selectedInsight && (
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                    {selectedInsight.tailNumber}
                  </span>
                  <h2 className="text-base font-bold text-slate-900">{selectedInsight.aircraftName}</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Subsystem: <strong className="text-slate-800">{selectedInsight.componentName}</strong>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onAskCopilot(`Why is Aircraft ${selectedInsight.tailNumber} at risk? Analyze anomaly: ${selectedInsight.anomalyType}`)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center space-x-1.5 shadow-2xs"
                >
                  <Bot className="w-3.5 h-3.5 text-blue-400" />
                  <span>Consult AI Copilot</span>
                </button>
                <button
                  onClick={() => onScheduleAction(selectedInsight)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center space-x-1.5 shadow-2xs"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Schedule Work Order</span>
                </button>
              </div>
            </div>

            {/* Core Risk & RUL Engine Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Failure Risk Score */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Composite Risk Score
                </div>
                <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1">
                  {selectedInsight.failureRiskScore}
                  <span className="text-sm font-normal text-slate-400">/100</span>
                </div>
                <div className="text-xs font-medium text-red-600 mt-1">
                  Urgency: {selectedInsight.urgency}
                </div>
              </div>

              {/* Remaining Useful Life */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  Calculated RUL
                </div>
                <div className="text-3xl font-extrabold font-mono text-blue-700 mt-1">
                  {selectedInsight.rulFlightHours}
                  <span className="text-sm font-normal text-slate-400"> hrs</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Flight envelope countdown
                </div>
              </div>

              {/* Confidence Score */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                  AI Model Confidence
                </div>
                <div className="text-3xl font-extrabold font-mono text-emerald-600 mt-1">
                  {Math.round(selectedInsight.confidenceScore * 1000) / 10}%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Weibull + Autoencoder fit
                </div>
              </div>
            </div>

            {/* Anomaly Detection Details */}
            <div className="p-4 rounded-lg bg-amber-50/50 border border-amber-200/80 space-y-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Detected Anomaly Signature</h3>
              </div>
              <p className="text-xs text-slate-800 font-semibold">{selectedInsight.anomalyType}</p>
              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="bg-white p-2 rounded border border-amber-200">
                  <span className="text-slate-500 text-[11px]">Vibration Harmonic Spike:</span>
                  <div className="font-mono font-bold text-red-600 text-sm mt-0.5">{selectedInsight.vibrationTrend} IPS</div>
                </div>
                <div className="bg-white p-2 rounded border border-amber-200">
                  <span className="text-slate-500 text-[11px]">Thermal Gradient Delta:</span>
                  <div className="font-mono font-bold text-red-600 text-sm mt-0.5">{selectedInsight.temperatureDelta}°C</div>
                </div>
              </div>
            </div>

            {/* Prescribed Technical Recommendation */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Prescribed Maintenance Recommendation</h3>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                {selectedInsight.recommendation}
              </div>
            </div>

            {/* Technical Order Citation */}
            <div className="p-3 rounded-lg bg-slate-900 text-slate-200 text-xs font-mono flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Authorized Technical Order:</span>
                <span className="text-white font-bold">{selectedInsight.technicalOrder}</span>
              </div>
              <span className="text-[10px] text-slate-400">MIL-STD COMPLIANT</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
