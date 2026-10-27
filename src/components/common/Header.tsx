import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext.tsx';
import { UserRole, EmergencyAlert } from '../../types/index.ts';
import {
  ShieldAlert,
  Bell,
  LogOut,
  Database,
  UserCheck,
  Clock,
  ChevronDown,
  Info,
  CheckCircle,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  dataSourceMode: 'MongoDB Atlas' | 'Demonstration Store';
  dataSourceConnected: boolean;
  alerts: EmergencyAlert[];
}

export const Header: React.FC<HeaderProps> = ({
  setActiveTab,
  dataSourceMode,
  dataSourceConnected,
  alerts,
}) => {
  const { user, logout, switchDemoRole } = useAuth();
  const [time, setTime] = useState<Date>(new Date());
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);

  // Live time ticker
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeAlerts = alerts.filter((a) => a.status === 'Active');
  const criticalCount = activeAlerts.filter((a) => a.severity === 'Critical').length;

  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between z-30 sticky top-0 shadow-lg">
      {/* Left: Branding & Operational Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 shadow-md shadow-cyan-500/20">
            <ShieldAlert className="w-5 h-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                CYCLONESHIELD
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                Ops Center
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="font-semibold text-red-400 uppercase tracking-wider text-[10px]">
                DEFCON 2 : SEVERE STORM THREAT ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Data Source Transparency Badge */}
        <div
          title={
            dataSourceConnected
              ? 'Operating with live MongoDB Atlas connection'
              : 'MongoDB Atlas URI not configured; operating with resilient, persistent Demonstration Store. Never presenting fake states.'
          }
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            dataSourceConnected
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/60'
              : 'bg-amber-950/50 text-amber-300 border-amber-700/60'
          }`}
        >
          <Database className="w-3 h-3" />
          <span>DATA SOURCE: {dataSourceMode}</span>
          {!dataSourceConnected && (
            <span className="text-[9px] bg-amber-500/20 px-1 rounded text-amber-300 font-mono">
              STANDBY
            </span>
          )}
        </div>
      </div>

      {/* Right: Clock, Alerts Indicator, Role Switcher, Profile & Logout */}
      <div className="flex items-center gap-3">
        {/* Real-time Clock */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 shadow-inner">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{time.toUTCString().slice(17, 25)} UTC</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{time.toLocaleTimeString()} Local</span>
        </div>

        {/* Alerts Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowAlertsMenu(!showAlertsMenu)}
            className="relative p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            title="Emergency Alerts"
          >
            <Bell className="w-4 h-4" />
            {activeAlerts.length > 0 && (
              <span
                className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full text-white px-1 shadow-md ${
                  criticalCount > 0 ? 'bg-red-600 animate-pulse' : 'bg-amber-600'
                }`}
              >
                {activeAlerts.length}
              </span>
            )}
          </button>

          {/* Alerts Dropdown Drawer */}
          {showAlertsMenu && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                <span className="font-semibold text-xs text-slate-200 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  Active Operational Alerts ({activeAlerts.length})
                </span>
                <button
                  onClick={() => {
                    setShowAlertsMenu(false);
                    setActiveTab('alerts');
                  }}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {activeAlerts.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-500">
                    No active emergency alerts recorded.
                  </div>
                ) : (
                  activeAlerts.slice(0, 4).map((al) => (
                    <div
                      key={al.id}
                      onClick={() => {
                        setShowAlertsMenu(false);
                        setActiveTab('alerts');
                      }}
                      className="p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800/70 cursor-pointer border border-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span
                          className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                            al.severity === 'Critical'
                              ? 'bg-red-950 text-red-400 border border-red-800'
                              : 'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}
                        >
                          {al.severity}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(al.issuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-200 line-clamp-1">{al.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{al.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Quick Switcher & Profile */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-left transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
              {user?.name?.slice(0, 2).toUpperCase() || 'OP'}
            </div>
            <div className="hidden sm:block text-xs leading-tight">
              <div className="font-semibold text-slate-200 line-clamp-1">{user?.name}</div>
              <div className="text-[10px] text-cyan-400 font-medium">{user?.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Role Switcher Menu */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-2 border-b border-slate-800 mb-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Operational Role
                </div>
                <div className="text-[10px] text-slate-500">
                  Instantly test different role authorizations & permissions
                </div>
              </div>

              <div className="space-y-1">
                {(Object.keys(DEMO_CREDENTIALS) as UserRole[]).map((r) => {
                  const isCurrent = user?.role === r;
                  return (
                    <button
                      key={r}
                      onClick={async () => {
                        setShowRoleMenu(false);
                        await switchDemoRole(r);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-cyan-950/70 text-cyan-300 font-semibold border border-cyan-800'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <UserCheck className={`w-3.5 h-3.5 ${isCurrent ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <span>{r}</span>
                      </div>
                      {isCurrent && <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-800">
                <button
                  onClick={async () => {
                    setShowRoleMenu(false);
                    await logout();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Ops Center</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
