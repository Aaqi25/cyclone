import React, { useState } from 'react';
import { AuditLog, UserRole } from '../../types/index.ts';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext.tsx';
import {
  Settings,
  Database,
  Shield,
  UserCheck,
  History,
  Search,
  CheckCircle,
  AlertCircle,
  Server,
  Key,
} from 'lucide-react';

interface SettingsViewProps {
  auditLogs: AuditLog[];
  dataSourceMode: string;
  dataSourceConnected: boolean;
  onRefreshLogs: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  auditLogs,
  dataSourceMode,
  dataSourceConnected,
}) => {
  const { user, switchDemoRole } = useAuth();
  const [logSearch, setLogSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  const filteredLogs = auditLogs.filter((l) => {
    const matchAction = actionFilter === 'All' || l.action.toLowerCase().includes(actionFilter.toLowerCase());
    const matchSearch =
      l.performedBy.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.action.toLowerCase().includes(logSearch.toLowerCase());
    return matchAction && matchSearch;
  });

  const rolesCatalog: { role: UserRole; title: string; desc: string; permissions: string[] }[] = [
    {
      role: 'Administrator',
      title: 'Emergency Center Administrator',
      desc: 'Full governance over all cyclone events, shelters, supply chains, task allocation, and audit logs.',
      permissions: ['Manage Users', 'Manage Cyclones', 'Manage Shelters', 'Manage Relief', 'Issue Alerts', 'Manage Tasks'],
    },
    {
      role: 'Disaster Management Officer',
      title: 'Disaster Management Officer (DMO)',
      desc: 'Authoritative oversight of cyclone observations, numerical impact models, and public warnings.',
      permissions: ['Manage Cyclones', 'Run Impact Assessment', 'Broadcast Alerts', 'View All Reports'],
    },
    {
      role: 'Evacuation Coordinator',
      title: 'Evacuation & Shelter Coordinator',
      desc: 'Manages shelter directories, sets occupancy numbers, and confirms statutory evacuation convoy orders.',
      permissions: ['Manage Shelters', 'Update Occupancy', 'Confirm Evacuation Plans', 'View Telemetry'],
    },
    {
      role: 'Relief Coordinator',
      title: 'Civil Supplies & Relief Coordinator',
      desc: 'Supervises emergency logistics warehouses, atomic supply distributions, and field relief requisitions.',
      permissions: ['Manage Inventory', 'Execute Distributions', 'Approve Requisitions', 'Track Shortages'],
    },
    {
      role: 'Read-Only Viewer',
      title: 'Civil Defense Volunteer / Viewer',
      desc: 'Public and volunteer situational awareness access to operational maps, alert bulletins, and reports.',
      permissions: ['View Dashboard', 'View Radar Map', 'Acknowledge Alerts', 'Export Reports'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          System Settings, Database Status & Security Governance
        </h1>
        <p className="text-xs text-slate-400">
          Database connection diagnostics, Role-Based Access Control (RBAC) governance, and immutable audit logs.
        </p>
      </div>

      {/* Database Diagnostics Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Database className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Database & Persistence Engine Architecture</h2>
              <div className="text-[11px] text-slate-400">
                MongoDB Atlas cluster integration with resilient local operational fallback.
              </div>
            </div>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
              dataSourceConnected
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                : 'bg-amber-950 text-amber-300 border-amber-800'
            }`}
          >
            {dataSourceConnected ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>{dataSourceMode}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Storage Mode</span>
            <div className="text-sm font-bold text-slate-200">{dataSourceMode}</div>
            <p className="text-[11px] text-slate-400">
              {dataSourceConnected
                ? 'Directly connected to MongoDB Atlas Cloud Cluster.'
                : 'Controlled Demonstration Store mode engaged (MONGODB_URI not configured in env). All operations are stateful and persistent during presentation.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Database Collections</span>
            <div className="text-sm font-bold text-slate-200">10 Schemas Indexed</div>
            <p className="text-[11px] text-slate-400 font-mono">
              cyclones, shelters, evac_plans, relief, requests, alerts, tasks, users, audit
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 font-bold uppercase text-[10px]">Security Protocol</span>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1">
              <Key className="w-3.5 h-3.5" />
              <span>Bcrypt + Signed JWT</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Zero plaintext password exposure. Token expiry: 24h. Server-side validation on every mutative action.
            </p>
          </div>
        </div>
      </div>

      {/* Role-Based Access Control (RBAC) Governance */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Authorized Roles & Permission Matrix</h2>
          </div>
          <span className="text-xs text-slate-400">
            Current Active Role: <strong className="text-cyan-400">{user?.role}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          {rolesCatalog.map((r) => {
            const isCurrent = user?.role === r.role;
            return (
              <div
                key={r.role}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-800 shadow-md shadow-cyan-950/40'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-xs">{r.title}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{r.desc}</p>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Assigned Rights:</div>
                  <div className="flex flex-wrap gap-1">
                    {r.permissions.map((p, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                      >
                        ✓ {p}
                      </span>
                    ))}
                  </div>
                </div>

                {!isCurrent && (
                  <button
                    onClick={() => switchDemoRole(r.role)}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors"
                  >
                    Switch to {r.role}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Immutable Operational Audit Log Explorer */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Emergency Operations Audit Trail (Immutable)</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200"
            >
              <option value="All">All Actions</option>
              <option value="LOGIN">User Logins</option>
              <option value="CYCLONE">Cyclone Telemetry</option>
              <option value="SHELTER">Shelter Occupancy</option>
              <option value="EVACUATION">Evacuation Orders</option>
              <option value="RELIEF">Relief Distributions</option>
              <option value="ALERT">Alert Broadcasts</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Log ID</th>
                <th className="py-2.5 px-3">Action Identifier</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Officer Name & Role</th>
                <th className="py-2.5 px-3">Timestamp (UTC)</th>
                <th className="py-2.5 px-3">Operational Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.slice(0, 30).map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 text-slate-300">
                  <td className="py-2.5 px-3 text-cyan-400 text-[11px]">{log.id}</td>
                  <td className="py-2.5 px-3 font-bold text-white text-[11px]">{log.action}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">{log.entityType}</td>
                  <td className="py-2.5 px-3 text-[11px]">
                    <span className="font-semibold text-slate-200">{log.performedBy}</span>{' '}
                    <span className="text-[10px] text-slate-500">({log.userRole})</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-300 text-[11px]">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
