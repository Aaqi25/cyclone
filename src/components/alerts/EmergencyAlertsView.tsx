import React, { useState } from 'react';
import { EmergencyAlert, AlertSeverity } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  BellRing,
  Plus,
  ShieldAlert,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  MapPin,
  X,
  Filter,
} from 'lucide-react';

interface EmergencyAlertsViewProps {
  alerts: EmergencyAlert[];
  onRefreshAlerts: () => void;
  setActiveTab: (tab: string) => void;
}

export const EmergencyAlertsView: React.FC<EmergencyAlertsViewProps> = ({
  alerts,
  onRefreshAlerts,
}) => {
  const { canManageAlerts } = useAuth();
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Resolved'>('Active');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Alert State
  const [newAlert, setNewAlert] = useState({
    title: '',
    severity: 'Critical' as AlertSeverity,
    affectedRegions: 'Ganjam, Puri Coastal Belt',
    description: '',
    instructions: '',
  });

  const filteredAlerts = alerts.filter((a) => {
    const matchSeverity = severityFilter === 'All' || a.severity === severityFilter;
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchSeverity && matchStatus;
  });

  const handleAcknowledge = async (id: string) => {
    try {
      await api.acknowledgeAlert(id);
      onRefreshAlerts();
    } catch (err: any) {
      alert(`Error acknowledging alert: ${err.message}`);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await api.updateAlert(id, { status: 'Resolved' });
      onRefreshAlerts();
    } catch (err: any) {
      alert(`Error resolving alert: ${err.message}`);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createAlert({
        title: newAlert.title,
        severity: newAlert.severity,
        affectedRegions: newAlert.affectedRegions.split(',').map((r) => r.trim()),
        description: newAlert.description,
        instructions: newAlert.instructions,
      });
      setShowCreateModal(false);
      onRefreshAlerts();
    } catch (err: any) {
      alert(`Error broadcasting alert: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <BellRing className="w-5 h-5 text-red-500" />
            Emergency Operations Alert Broadcast Center
          </h1>
          <p className="text-xs text-slate-400">
            Real-time public safety advisories, shelter saturation notices, and critical resource shortage warnings.
          </p>
        </div>

        {canManageAlerts && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Broadcast Emergency Alert</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="Active">Active Only</option>
              <option value="Resolved">Resolved</option>
              <option value="All">All Records</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical (Red)</option>
              <option value="Warning">Warning (Orange)</option>
              <option value="Watch">Watch (Yellow)</option>
              <option value="Informational">Informational</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono">
          {filteredAlerts.length} Broadcasts Filtered
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.severity === 'Critical';
          const isWarning = alert.severity === 'Warning';
          const isResolved = alert.status === 'Resolved';

          const cardBorder = isResolved
            ? 'border-slate-800 bg-slate-950/60 opacity-75'
            : isCritical
            ? 'border-red-800/80 bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900'
            : isWarning
            ? 'border-amber-800/80 bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900'
            : 'border-slate-800 bg-slate-900';

          const badgeClass =
            alert.severity === 'Critical'
              ? 'bg-red-950 text-red-400 border-red-800'
              : alert.severity === 'Warning'
              ? 'bg-amber-950 text-amber-400 border-amber-800'
              : alert.severity === 'Watch'
              ? 'bg-yellow-950 text-yellow-400 border-yellow-800'
              : 'bg-slate-800 text-slate-300 border-slate-700';

          return (
            <div
              key={alert.id}
              className={`p-5 rounded-2xl border shadow-xl transition-all space-y-3 ${cardBorder}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${badgeClass}`}>
                      {alert.severity}
                    </span>
                    <span className="font-mono text-xs text-slate-500 font-bold">{alert.code}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Issued: {new Date(alert.issuedAt).toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    {alert.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono px-2 py-1 rounded bg-slate-950 border border-slate-800">
                    {alert.acknowledgedCount} Acknowledged
                  </span>

                  {alert.status === 'Active' && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  {canManageAlerts && alert.status === 'Active' && (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

              {alert.instructions && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">
                    Operational Instructions & Safeguards:
                  </span>
                  <p className="text-slate-300 leading-relaxed">{alert.instructions}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>Affected: {alert.affectedRegions.join(', ')}</span>
                </div>
                <div>Issued by: {alert.issuedBy}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Broadcast Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BellRing className="w-4 h-4 text-red-500" />
                Broadcast Emergency Operations Alert
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Alert Headline</label>
                <input
                  type="text"
                  required
                  value={newAlert.title}
                  onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                  placeholder="e.g. FLASH INUNDATION ALERT: Ganjam Lower Delta"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Severity</label>
                  <select
                    value={newAlert.severity}
                    onChange={(e) => setNewAlert({ ...newAlert, severity: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="Critical">Critical (Immediate Danger)</option>
                    <option value="Warning">Warning (High Probability)</option>
                    <option value="Watch">Watch (Developing Hazard)</option>
                    <option value="Advisory">Advisory (General Public)</option>
                    <option value="Informational">Informational</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Affected Regions</label>
                  <input
                    type="text"
                    required
                    value={newAlert.affectedRegions}
                    onChange={(e) => setNewAlert({ ...newAlert, affectedRegions: e.target.value })}
                    placeholder="e.g. Ganjam, Puri, Jagatsinghpur"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Situation Description</label>
                <textarea
                  rows={2}
                  required
                  value={newAlert.description}
                  onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                  placeholder="Describe the nature of the emergency threat..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Standard Operational Instructions</label>
                <textarea
                  rows={2}
                  value={newAlert.instructions}
                  onChange={(e) => setNewAlert({ ...newAlert, instructions: e.target.value })}
                  placeholder="Directives for ground teams and affected citizens..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Broadcast Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
