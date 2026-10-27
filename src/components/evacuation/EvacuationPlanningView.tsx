import React, { useState } from 'react';
import { CycloneEvent, Shelter, EvacuationPlan } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Users,
  Bus,
  CheckCircle,
  AlertTriangle,
  Building,
  Navigation,
  Save,
  Clock,
  ArrowRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';

interface EvacuationPlanningViewProps {
  cyclones: CycloneEvent[];
  shelters: Shelter[];
  plans: EvacuationPlan[];
  onRefreshPlans: () => void;
  setActiveTab: (tab: string) => void;
}

export const EvacuationPlanningView: React.FC<EvacuationPlanningViewProps> = ({
  cyclones,
  shelters,
  plans,
  onRefreshPlans,
  setActiveTab,
}) => {
  const { canManageShelters } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<EvacuationPlan | null>(plans[0] || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Proposal Generator Form State
  const [targetCycloneId, setTargetCycloneId] = useState(cyclones[0]?.id || '');
  const [targetRegion, setTargetRegion] = useState('Ganjam Coastal High-Vulnerability Strip');
  const [targetDistrict, setTargetDistrict] = useState('Ganjam');
  const [targetPopulation, setTargetPopulation] = useState(6500);

  const selectedCyclone = cyclones.find((c) => c.id === targetCycloneId) || cyclones[0];

  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    try {
      const res = await api.generateEvacuationProposal({
        cycloneId: selectedCyclone.id,
        regionName: targetRegion,
        district: targetDistrict,
        targetPopulation,
      });
      setSelectedPlan(res.plan);
    } catch (err: any) {
      alert(`Error generating evacuation proposal: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedPlan) return;
    try {
      await api.saveEvacuationPlan(selectedPlan);
      alert('Evacuation plan draft saved to operational database.');
      onRefreshPlans();
    } catch (err: any) {
      alert(`Error saving plan: ${err.message}`);
    }
  };

  const handleConfirmPlan = async (planId: string) => {
    setIsConfirming(true);
    try {
      const res = await api.confirmEvacuationPlan(planId);
      setSelectedPlan(res.plan);
      alert('Evacuation order confirmed! Shelters reserved and convoy escorts dispatched.');
      onRefreshPlans();
    } catch (err: any) {
      alert(`Error confirming evacuation order: ${err.message}`);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Evacuation Planning & Shelter Allocation Engine
          </h1>
          <p className="text-xs text-slate-400">
            Capacity-constrained allocation algorithm, convoy fleet calculations, and mandatory evacuation order confirmation.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('shelters')}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors self-start sm:self-auto"
        >
          <Building className="w-4 h-4 text-emerald-400" />
          <span>Shelter Directory &rarr;</span>
        </button>
      </div>

      {/* Generator Controls Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-800">
          <Navigation className="w-4 h-4 text-cyan-400" />
          Configure Evacuation Target & Capacity Allocator
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Active Threat Cyclone</label>
            <select
              value={targetCycloneId}
              onChange={(e) => setTargetCycloneId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {cyclones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.warningStatus})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Evacuation Sector / District</label>
            <select
              value={targetDistrict}
              onChange={(e) => {
                setTargetDistrict(e.target.value);
                setTargetRegion(`${e.target.value} Coastal Vulnerability Belt`);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="Ganjam">Ganjam District (High Surge)</option>
              <option value="Puri">Puri District (Pilgrim Corridor)</option>
              <option value="Jagatsinghpur">Jagatsinghpur (Port & Estuary)</option>
              <option value="Srikakulam">Srikakulam (North Coastal Plain)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              Target Evacuees: <strong className="text-white">{targetPopulation.toLocaleString()}</strong>
            </label>
            <input
              type="number"
              min="500"
              max="50000"
              step="500"
              value={targetPopulation}
              onChange={(e) => setTargetPopulation(Math.max(100, Number(e.target.value)))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateProposal}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isGenerating ? 'Optimizing Allocation...' : 'Calculate Allocation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Proposal / Plan View */}
      {selectedPlan && (
        <div className="space-y-6">
          {/* Plan Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="text-slate-400 text-xs font-semibold">Target Evacuees</div>
              <div className="text-2xl font-black text-white mt-1">
                {selectedPlan.targetPopulation.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">{selectedPlan.regionName}</div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/40 shadow-md">
              <div className="text-emerald-400 text-xs font-semibold">Assigned to Shelters</div>
              <div className="text-2xl font-black text-emerald-300 mt-1">
                {selectedPlan.allocatedPopulation.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1">
                {selectedPlan.sheltersAssigned.length} operational shelters utilized
              </div>
            </div>

            <div
              className={`p-4 rounded-xl shadow-md border ${
                selectedPlan.unallocatedPopulation > 0
                  ? 'bg-red-950/30 border-red-900/40'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div
                className={`text-xs font-semibold ${
                  selectedPlan.unallocatedPopulation > 0 ? 'text-red-400' : 'text-slate-400'
                }`}
              >
                Unallocated Deficit
              </div>
              <div
                className={`text-2xl font-black mt-1 ${
                  selectedPlan.unallocatedPopulation > 0 ? 'text-red-300' : 'text-slate-400'
                }`}
              >
                {selectedPlan.unallocatedPopulation.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {selectedPlan.unallocatedPopulation > 0 ? 'Requires auxiliary schools' : '0 deficit (100% covered)'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="text-slate-400 text-xs font-semibold">Buses Required</div>
              <div className="text-2xl font-black text-cyan-400 mt-1">
                {selectedPlan.transportationRequirements.busesRequired}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                50 pax/coach + {selectedPlan.transportationRequirements.ambulancesRequired} ambulances
              </div>
            </div>
          </div>

          {/* Allocation Breakdown and Fleet Logistics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Shelter Allocations List (Span 2) */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">
                    Assigned Shelter Capacities & Route Distances
                  </h3>
                  <p className="text-xs text-slate-400">
                    Allocated strictly within available capacity (Available = Max - Occupancy).
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    selectedPlan.status === 'Confirmed Order'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                      : 'bg-amber-950 text-amber-400 border-amber-800'
                  }`}
                >
                  {selectedPlan.status}
                </span>
              </div>

              <div className="space-y-3">
                {selectedPlan.sheltersAssigned.map((alloc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-slate-200 text-xs">{alloc.shelterName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>Approx straight-line dist: <strong className="text-cyan-400">{alloc.distanceKm} km</strong></span>
                        <span>Available before: {alloc.availableCapacityBefore} places</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-emerald-400">
                        +{alloc.allocatedCount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase font-mono">Assigned Pax</div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedPlan.unallocatedPopulation > 0 && (
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <strong className="text-red-300 font-bold">CAPACITY DEFICIT ALERT</strong>
                    <p className="text-slate-300 leading-relaxed">
                      {selectedPlan.unallocatedPopulation.toLocaleString()} citizens cannot be safely sheltered in frontline primary buildings without causing dangerous overcrowding. Immediate requisition of secondary inland college buildings or district headquarters auditoriums is required.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Logistics & Confirmation Column */}
            <div className="space-y-4">
              {/* Transport Fleet Logistics */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 pb-2 border-b border-slate-800">
                  <Bus className="w-4 h-4 text-cyan-400" />
                  Transport & Convoy Logistics
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Heavy Evacuation Buses:</span>
                    <strong className="text-white font-mono">{selectedPlan.transportationRequirements.busesRequired} units</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Emergency Ambulances:</span>
                    <strong className="text-white font-mono">{selectedPlan.transportationRequirements.ambulancesRequired} units</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Police / ODRAF Escort Vehicles:</span>
                    <strong className="text-white font-mono">{selectedPlan.transportationRequirements.escortVehiclesRequired} units</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Paramedic Response Teams:</span>
                    <strong className="text-white font-mono">{selectedPlan.transportationRequirements.paramedicTeamsRequired} squads</strong>
                  </div>
                </div>
              </div>

              {/* Confirmation Action Card */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-900/60 shadow-xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Statutory Evacuation Order
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Confirming this order locks shelter capacity, records transactions into the audit trail, and issues convoy departure clearances.
                </p>

                {selectedPlan.status === 'Confirmed Order' ? (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Order Confirmed at {new Date(selectedPlan.confirmedAt || '').toLocaleTimeString()}</span>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    {canManageShelters ? (
                      <button
                        onClick={() => handleConfirmPlan(selectedPlan.id)}
                        disabled={isConfirming}
                        className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isConfirming ? 'Confirming Order...' : 'Confirm Evacuation Order'}</span>
                      </button>
                    ) : (
                      <div className="text-[11px] text-amber-400 bg-amber-950/40 p-2.5 rounded-lg border border-amber-900">
                        Requires Evacuation Coordinator or Administrator role to issue statutory order.
                      </div>
                    )}

                    <button
                      onClick={handleSaveDraft}
                      className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Draft Proposal</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
