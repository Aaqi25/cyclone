import React from 'react';
import {
  CycloneEvent,
  Shelter,
  DashboardSummary,
  ActivityItem,
  EvacuationPlan,
  ReliefInventoryItem,
} from '../../types/index.ts';
import { CommandMap } from '../map/CommandMap.tsx';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import {
  Compass,
  MapPin,
  Users,
  Home,
  Package,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Database,
  CheckCircle,
} from 'lucide-react';

interface OverviewViewProps {
  summary: DashboardSummary | null;
  cyclones: CycloneEvent[];
  shelters: Shelter[];
  plans: EvacuationPlan[];
  inventory: ReliefInventoryItem[];
  activities: ActivityItem[];
  setActiveTab: (tab: string) => void;
  onOpenAIBriefing: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  summary,
  cyclones,
  shelters,
  plans,
  inventory,
  activities,
  setActiveTab,
  onOpenAIBriefing,
}) => {
  const activeCyclone = cyclones[0];

  // Data for Shelter Occupancy Chart
  const shelterChartData = shelters.slice(0, 6).map((s) => ({
    name: s.code,
    occupancy: s.currentOccupancy,
    available: s.availableCapacity,
    total: s.maxCapacity,
  }));

  // Data for Risk Category Distribution
  const riskPieData = [
    { name: 'Critical Risk', value: 185000, color: '#ef4444' },
    { name: 'High Risk', value: 140000, color: '#f97316' },
    { name: 'Moderate Risk', value: 75000, color: '#eab308' },
    { name: 'Low Risk', value: 25000, color: '#10b981' },
  ];

  // Data for Cyclone Wind & Pressure Trend
  const cycloneTrendData = activeCyclone
    ? [
        { time: '-12h', wind: 135, pressure: 984 },
        { time: '-6h', wind: 155, pressure: 976 },
        { time: 'Current', wind: activeCyclone.windSpeedKmph, pressure: activeCyclone.centralPressureHpa },
        ...(activeCyclone.forecastTrack?.map((pt) => ({
          time: `+${pt.timeHorizonHours}h`,
          wind: pt.estimatedWindSpeedKmph,
          pressure: 960 + Math.floor(pt.timeHorizonHours * 1.5),
        })) || []),
      ]
    : [];

  const totalEvacTarget = plans.reduce((acc, p) => acc + p.targetPopulation, 0);
  const totalEvacAlloc = plans.reduce((acc, p) => acc + p.allocatedPopulation, 0);
  const totalEvacPercent = totalEvacTarget > 0 ? Math.round((totalEvacAlloc / totalEvacTarget) * 100) : 78;

  return (
    <div className="space-y-6">
      {/* Top Banner: Cyclone Status and Action Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              Active Threat Monitoring
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-300 font-mono">
              Theater: Bay of Bengal & Eastern Seaboard
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            {activeCyclone ? (
              <>
                Cyclone {activeCyclone.name} ({activeCyclone.category})
                <span className="text-xs px-2.5 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 font-bold">
                  {activeCyclone.warningStatus}
                </span>
              </>
            ) : (
              'Command Operations Dashboard'
            )}
          </h1>
          <p className="text-xs text-slate-400">
            {activeCyclone
              ? `Position: ${activeCyclone.latitude}°N, ${activeCyclone.longitude}°E | Sustained Winds: ${activeCyclone.windSpeedKmph} km/h | Central Pressure: ${activeCyclone.centralPressureHpa} hPa`
              : 'Real-time multi-agency coordination system for disaster management and relief.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('impact')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            Impact Predictor
          </button>
          <button
            onClick={onOpenAIBriefing}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            AI Situation Briefing
          </button>
        </div>
      </div>

      {/* Summary Stat KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Active Cyclones */}
        <div
          onClick={() => setActiveTab('cyclones')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-800/80 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Cyclones</span>
            <Compass className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">
            {summary?.activeCyclonesCount ?? cyclones.length}
          </div>
          <div className="text-[11px] text-red-400 font-medium flex items-center gap-1 mt-1">
            <span>{cyclones[0]?.category.split(' ')[0] || 'Monitored'}</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Regions Under Warning */}
        <div
          onClick={() => setActiveTab('impact')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-800/80 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Regions in Warning</span>
            <MapPin className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">
            {summary?.regionsUnderWarningCount ?? 5}
          </div>
          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1 mt-1">
            <span>Odisha & AP Coast</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Population at Risk */}
        <div
          onClick={() => setActiveTab('impact')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-800/80 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Population at Risk</span>
            <Users className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">
            {summary?.totalPopulationAtRisk?.toLocaleString() ?? '425,000'}
          </div>
          <div className="text-[11px] text-cyan-400 font-medium flex items-center gap-1 mt-1">
            <span>Exposed within 50km</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Operational Shelters */}
        <div
          onClick={() => setActiveTab('shelters')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-800/80 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Operational Shelters</span>
            <Home className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">
            {summary?.sheltersOperational ?? shelters.filter((s) => s.status === 'Operational').length}
            <span className="text-xs text-slate-500 font-normal"> / {shelters.length}</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <span>{summary?.availableShelterBeds?.toLocaleString() ?? '8,250'} beds free</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Shelters Near/At Capacity */}
        <div
          onClick={() => setActiveTab('shelters')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-800/80 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Near Capacity</span>
            <AlertTriangle className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">
            {(summary?.sheltersNearCapacity ?? 2) + (summary?.sheltersFull ?? 1)}
          </div>
          <div className="text-[11px] text-yellow-400 font-medium flex items-center gap-1 mt-1">
            <span>Diversion required</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Pending Relief Requests */}
        <div
          onClick={() => setActiveTab('relief')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-800/80 cursor-pointer transition-all shadow-md group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Pending Requests</span>
            <Package className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white">
            {summary?.pendingReliefRequestsCount ?? 3}
          </div>
          <div className="text-[11px] text-purple-400 font-medium flex items-center gap-1 mt-1">
            <span>{summary?.criticalInventoryShortagesCount ?? 1} critical shortage</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Command Map & Tactical Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Tactical Command Map (Span 2) */}
        <div className="xl:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Tactical Operations Theater & Cyclone Track
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Layer Sync
              </span>
            </div>
          </div>

          <CommandMap
            cyclones={cyclones}
            shelters={shelters}
            height="460px"
            onSelectCyclone={() => setActiveTab('cyclones')}
            onSelectShelter={() => setActiveTab('shelters')}
          />
        </div>

        {/* Right Column: Evacuation Progress & Shelter Occupancy */}
        <div className="space-y-4">
          {/* Evacuation Progress Meter */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-cyan-400" />
                Evacuation Execution
              </span>
              <span className="text-xs font-bold text-cyan-400">{totalEvacPercent}% Complete</span>
            </div>
            <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 mb-2">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${totalEvacPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Allocated: {totalEvacAlloc.toLocaleString()}</span>
              <span>Target: {totalEvacTarget.toLocaleString()}</span>
            </div>
          </div>

          {/* Shelter Capacity vs Occupancy Bar Chart */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Home className="w-4 h-4 text-emerald-400" />
                Shelter Occupancy
              </span>
              <button
                onClick={() => setActiveTab('shelters')}
                className="text-[11px] text-cyan-400 hover:underline"
              >
                Directory &rarr;
              </button>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shelterChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                  />
                  <Bar dataKey="occupancy" name="Occupants" fill="#f59e0b" stackId="a" />
                  <Bar dataKey="available" name="Available Beds" fill="#10b981" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Population Risk Distribution Pie Chart */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Population Exposed by Risk Tier
            </div>
            <div className="h-36 w-full flex items-center">
              <ResponsiveContainer width="55%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => `${Number(val).toLocaleString()} people`}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="w-[45%] text-[10px] space-y-1 text-slate-300 font-medium">
                {riskPieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                    <span className="truncate">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Intensity Trend & Recent Operational Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cyclone Wind Intensity & Pressure Trend */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Cyclone Intensity & Central Barometric Pressure Evolution
              </h3>
              <p className="text-[11px] text-slate-400">
                Observational history + 36-hour numerical forecast trajectory
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              IMD Automated GTS Model
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cycloneTrendData} margin={{ top: 10, right: 30, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#38bdf8" fontSize={11} label={{ value: 'km/h', angle: -90, position: 'insideLeft', fill: '#38bdf8', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" domain={[950, 1000]} fontSize={11} label={{ value: 'hPa', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px' }} />
                <Line yAxisId="left" type="monotone" dataKey="wind" name="Wind Speed (km/h)" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="pressure" name="Pressure (hPa)" stroke="#f43f5e" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Activity Stream */}
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Recent Operations Feed
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Live Telemetry</span>
            </div>

            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {activities.slice(0, 5).map((act) => (
                <div key={act.id} className="flex items-start gap-2.5 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      act.severity === 'critical'
                        ? 'bg-red-500'
                        : act.severity === 'high'
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                    }`}
                  ></div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-200">{act.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">{act.description}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {act.user ? ` • ${act.user}` : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              Source: {summary?.dataSourceMode || 'Demonstration Store'}
            </span>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-cyan-400 hover:underline text-[11px]"
            >
              Audit Logs &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
