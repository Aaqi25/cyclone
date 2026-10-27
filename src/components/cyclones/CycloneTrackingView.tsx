import React, { useState } from 'react';
import { CycloneEvent, CycloneCategory } from '../../types/index.ts';
import { CommandMap } from '../map/CommandMap.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../api/client.ts';
import {
  Compass,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Wind,
  Navigation,
  Clock,
  Eye,
  AlertTriangle,
  X,
  CheckCircle,
} from 'lucide-react';

interface CycloneTrackingViewProps {
  cyclones: CycloneEvent[];
  onRefresh: () => void;
  setActiveTab: (tab: string) => void;
}

export const CycloneTrackingView: React.FC<CycloneTrackingViewProps> = ({
  cyclones,
  onRefresh,
  setActiveTab,
}) => {
  const { canManageCyclones } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [basinFilter, setBasinFilter] = useState('All');
  const [selectedCyclone, setSelectedCyclone] = useState<CycloneEvent | null>(cyclones[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Form state for creating a new cyclone observation
  const [newCyclone, setNewCyclone] = useState({
    name: '',
    identifier: '',
    basin: 'Bay of Bengal',
    latitude: 18.2,
    longitude: 86.5,
    windSpeedKmph: 120,
    centralPressureHpa: 980,
    movementDirection: 'NW',
    movementSpeedKmph: 15,
    category: 'Severe Cyclonic Storm' as CycloneCategory,
    warningStatus: 'ORANGE WARNING' as const,
    affectedRegions: 'Ganjam, Puri, Jagatsinghpur',
    notes: '',
  });

  const filteredCyclones = cyclones.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.affectedRegions.some((r) => r.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchBasin = basinFilter === 'All' || c.basin === basinFilter;
    return matchSearch && matchBasin;
  });

  const handleSyncAuthoritativeFeeds = async () => {
    setIsSyncingLive(true);
    setSyncStatus(null);
    try {
      const res = await api.fetchLiveMeteorology();
      setSyncStatus(`IMD GTS Gateway Synced: ${res.liveAdapter.activeTropicalSystemsFound} systems verified.`);
      onRefresh();
    } catch (err: any) {
      setSyncStatus(`Adapter Notice: ${err.message}. Retaining stored observations.`);
    } finally {
      setIsSyncingLive(false);
    }
  };

  const handleCreateCyclone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<CycloneEvent> = {
        name: newCyclone.name.toUpperCase(),
        identifier: newCyclone.identifier || `CYC-${Date.now().toString().slice(-4)}`,
        basin: newCyclone.basin,
        latitude: Number(newCyclone.latitude),
        longitude: Number(newCyclone.longitude),
        windSpeedKmph: Number(newCyclone.windSpeedKmph),
        centralPressureHpa: Number(newCyclone.centralPressureHpa),
        movementDirection: newCyclone.movementDirection,
        movementSpeedKmph: Number(newCyclone.movementSpeedKmph),
        category: newCyclone.category,
        warningStatus: newCyclone.warningStatus,
        affectedRegions: newCyclone.affectedRegions.split(',').map((r) => r.trim()),
        notes: newCyclone.notes,
        forecastTrack: [
          {
            timeHorizonHours: 12,
            latitude: Number(newCyclone.latitude) + 0.6,
            longitude: Number(newCyclone.longitude) - 0.4,
            estimatedWindSpeedKmph: Number(newCyclone.windSpeedKmph) + 15,
            expectedCategory: newCyclone.category,
          },
          {
            timeHorizonHours: 24,
            latitude: Number(newCyclone.latitude) + 1.2,
            longitude: Number(newCyclone.longitude) - 0.8,
            estimatedWindSpeedKmph: Number(newCyclone.windSpeedKmph) + 20,
            expectedCategory: 'Very Severe Cyclonic Storm',
          },
        ],
      };

      await api.createCyclone(payload);
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      alert(`Error registering cyclone: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-red-500" />
            Cyclone Observation & Forecast Tracking
          </h1>
          <p className="text-xs text-slate-400">
            Authoritative tropical cyclone positions, barometric trends, and numerical trajectory cones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSyncAuthoritativeFeeds}
            disabled={isSyncingLive}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLive ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Poll IMD / NOAA Feeds</span>
          </button>

          {canManageCyclones && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Record Observation</span>
            </button>
          )}
        </div>
      </div>

      {syncStatus && (
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/80 text-xs text-cyan-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Main Grid: Interactive Map + Selected Cyclone Telemetry Card */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map (Span 2) */}
        <div className="xl:col-span-2 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">
              Interactive Radar Cone: {selectedCyclone ? selectedCyclone.name : 'All Active Storms'}
            </span>
            <span className="font-mono text-[11px]">
              Click any eye marker to view detailed telemetry
            </span>
          </div>

          <CommandMap
            cyclones={filteredCyclones}
            selectedCycloneId={selectedCyclone?.id}
            onSelectCyclone={(cyc) => setSelectedCyclone(cyc)}
            height="440px"
            focusLocation={
              selectedCyclone
                ? { lat: selectedCyclone.latitude, lng: selectedCyclone.longitude, zoom: 7 }
                : undefined
            }
          />
        </div>

        {/* Selected Cyclone Detail Card */}
        <div className="space-y-4">
          {selectedCyclone ? (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-white">{selectedCyclone.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                      {selectedCyclone.identifier}
                    </span>
                  </div>
                  <div className="text-xs text-cyan-400 font-medium mt-0.5">
                    {selectedCyclone.category}
                  </div>
                </div>

                <span
                  className={`text-[11px] font-bold px-2 py-1 rounded-md border ${
                    selectedCyclone.warningStatus === 'RED ALERT'
                      ? 'bg-red-950 text-red-400 border-red-800'
                      : 'bg-amber-950 text-amber-400 border-amber-800'
                  }`}
                >
                  {selectedCyclone.warningStatus}
                </span>
              </div>

              {/* Metric Badges */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Wind className="w-3 h-3 text-cyan-400" />
                    Wind Velocity
                  </div>
                  <div className="text-base font-extrabold text-white mt-0.5">
                    {selectedCyclone.windSpeedKmph} <span className="text-xs text-slate-400 font-normal">km/h</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Compass className="w-3 h-3 text-amber-400" />
                    Barometric Pressure
                  </div>
                  <div className="text-base font-extrabold text-white mt-0.5">
                    {selectedCyclone.centralPressureHpa} <span className="text-xs text-slate-400 font-normal">hPa</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-purple-400" />
                    Heading & Speed
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {selectedCyclone.movementDirection} @ {selectedCyclone.movementSpeedKmph} km/h
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    Coordinates
                  </div>
                  <div className="text-xs font-mono font-bold text-white mt-0.5">
                    {selectedCyclone.latitude}°N, {selectedCyclone.longitude}°E
                  </div>
                </div>
              </div>

              {/* Threat Areas */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Threatened Coastal Sectors
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCyclone.affectedRegions.map((r, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {selectedCyclone.notes && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400">Meteorological Notes:</span>{' '}
                  {selectedCyclone.notes}
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-2 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => setActiveTab('impact')}
                  className="flex-1 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-colors"
                >
                  Predict Impact
                </button>
                <button
                  onClick={() => setActiveTab('evacuation')}
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Plan Evacuation
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-xs">
              Select a cyclone from the table or map to view telemetry.
            </div>
          )}
        </div>
      </div>

      {/* Filter and Searchable Table */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search cyclone, ID, or region..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={basinFilter}
                onChange={(e) => setBasinFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="All">All Basins</option>
                <option value="Bay of Bengal">Bay of Bengal</option>
                <option value="Arabian Sea">Arabian Sea</option>
                <option value="Indian Ocean">Indian Ocean</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            Showing <strong className="text-slate-200">{filteredCyclones.length}</strong> active cyclone events
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Cyclone Name & ID</th>
                <th className="py-2.5 px-3">Basin</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Wind Speed</th>
                <th className="py-2.5 px-3">Pressure</th>
                <th className="py-2.5 px-3">Coordinates</th>
                <th className="py-2.5 px-3">Trajectory</th>
                <th className="py-2.5 px-3">Warning Status</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCyclones.map((cyc) => {
                const isSelected = selectedCyclone?.id === cyc.id;
                return (
                  <tr
                    key={cyc.id}
                    onClick={() => setSelectedCyclone(cyc)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/40 text-cyan-200' : 'hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-3 font-semibold">
                      <div className="text-slate-100 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        {cyc.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{cyc.identifier}</div>
                    </td>
                    <td className="py-3 px-3">{cyc.basin}</td>
                    <td className="py-3 px-3 font-medium text-cyan-400">{cyc.category}</td>
                    <td className="py-3 px-3 font-bold text-slate-100">{cyc.windSpeedKmph} km/h</td>
                    <td className="py-3 px-3 font-mono">{cyc.centralPressureHpa} hPa</td>
                    <td className="py-3 px-3 font-mono">
                      {cyc.latitude}°N, {cyc.longitude}°E
                    </td>
                    <td className="py-3 px-3">
                      {cyc.movementDirection} @ {cyc.movementSpeedKmph} km/h
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          cyc.warningStatus === 'RED ALERT'
                            ? 'bg-red-950 text-red-400 border-red-800'
                            : 'bg-amber-950 text-amber-400 border-amber-800'
                        }`}
                      >
                        {cyc.warningStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-400">{cyc.dataSource}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCyclone(cyc);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                      >
                        Focus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Cyclone Observation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Record Cyclone Field Observation
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCyclone} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Cyclone Name</label>
                  <input
                    type="text"
                    required
                    value={newCyclone.name}
                    onChange={(e) => setNewCyclone({ ...newCyclone, name: e.target.value })}
                    placeholder="e.g. MIDHILI"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Event Identifier</label>
                  <input
                    type="text"
                    value={newCyclone.identifier}
                    onChange={(e) => setNewCyclone({ ...newCyclone, identifier: e.target.value })}
                    placeholder="e.g. BOB-05-2026"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newCyclone.latitude}
                    onChange={(e) => setNewCyclone({ ...newCyclone, latitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newCyclone.longitude}
                    onChange={(e) => setNewCyclone({ ...newCyclone, longitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Wind Speed (km/h)</label>
                  <input
                    type="number"
                    required
                    value={newCyclone.windSpeedKmph}
                    onChange={(e) => setNewCyclone({ ...newCyclone, windSpeedKmph: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Central Pressure (hPa)</label>
                  <input
                    type="number"
                    required
                    value={newCyclone.centralPressureHpa}
                    onChange={(e) => setNewCyclone({ ...newCyclone, centralPressureHpa: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Intensity Category</label>
                  <select
                    value={newCyclone.category}
                    onChange={(e) => setNewCyclone({ ...newCyclone, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="Cyclonic Storm">Cyclonic Storm</option>
                    <option value="Severe Cyclonic Storm">Severe Cyclonic Storm</option>
                    <option value="Very Severe Cyclonic Storm">Very Severe Cyclonic Storm</option>
                    <option value="Extremely Severe Cyclonic Storm">Extremely Severe Cyclonic Storm</option>
                    <option value="Super Cyclonic Storm">Super Cyclonic Storm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Warning Status</label>
                  <select
                    value={newCyclone.warningStatus}
                    onChange={(e) => setNewCyclone({ ...newCyclone, warningStatus: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="RED ALERT">RED ALERT</option>
                    <option value="ORANGE WARNING">ORANGE WARNING</option>
                    <option value="YELLOW WATCH">YELLOW WATCH</option>
                    <option value="INFORMATIONAL">INFORMATIONAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Threatened Coastal Regions (comma separated)</label>
                <input
                  type="text"
                  value={newCyclone.affectedRegions}
                  onChange={(e) => setNewCyclone({ ...newCyclone, affectedRegions: e.target.value })}
                  placeholder="Ganjam, Puri, Kendrapara..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Save Observation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
