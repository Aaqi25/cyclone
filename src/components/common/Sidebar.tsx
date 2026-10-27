import React from 'react';
import {
  LayoutDashboard,
  Compass,
  Zap,
  Users,
  Home,
  Package,
  BellRing,
  FileBarChart,
  Settings,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeAlertsCount?: number;
  shortagesCount?: number;
  pendingRequestsCount?: number;
  onOpenAIBriefing?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeAlertsCount = 0,
  shortagesCount = 0,
  pendingRequestsCount = 0,
  onOpenAIBriefing,
}) => {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'cyclones',
      label: 'Cyclone Tracking',
      icon: Compass,
      badge: 'LIVE',
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'impact',
      label: 'Impact Prediction',
      icon: Zap,
      badge: null,
    },
    {
      id: 'evacuation',
      label: 'Evacuation Planning',
      icon: Users,
      badge: null,
    },
    {
      id: 'shelters',
      label: 'Shelters',
      icon: Home,
      badge: null,
    },
    {
      id: 'relief',
      label: 'Relief Coordination',
      icon: Package,
      badge: shortagesCount > 0 ? `${shortagesCount} short` : null,
      badgeColor: 'bg-amber-950 text-amber-300 border border-amber-800',
    },
    {
      id: 'tasks',
      label: 'Response Tasks',
      icon: CheckSquare,
      badge: null,
    },
    {
      id: 'alerts',
      label: 'Emergency Alerts',
      icon: BellRing,
      badge: activeAlertsCount > 0 ? activeAlertsCount : null,
      badgeColor: 'bg-red-600 text-white animate-pulse',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: FileBarChart,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-20">
      {/* Navigation Links */}
      <div className="py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Command Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/40 text-cyan-300 border border-cyan-800/80 shadow-md shadow-cyan-950/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* AI Disaster Briefing Quick Launch Card */}
      <div className="p-3 m-3 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-900/50 shadow-lg">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-md bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">AI Disaster Briefing</div>
            <div className="text-[10px] text-cyan-400 font-mono">Gemini 3.8 Flash</div>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mb-2.5 leading-relaxed">
          Synthesize multi-agency situation reports, acute risks, and priority checklists.
        </p>
        <button
          onClick={onOpenAIBriefing}
          className="w-full py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all hover:shadow-cyan-500/50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Generate AI Briefing
        </button>
      </div>
    </aside>
  );
};
