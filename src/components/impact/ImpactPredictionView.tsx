import React, { useState } from 'react';
import { CycloneEvent, ImpactAssessment, RegionalRiskAssessment } from '../../types/index.ts';
import { CommandMap } from '../map/CommandMap.tsx';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Zap,
  Play,
  Clock,
  Waves,
  CloudRain,
  ShieldAlert,
  AlertTriangle,
  Building2,
  Users,
  Compass,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ImpactPredictionViewProps {
  cyclones: CycloneEvent[];
  assessments: ImpactAssessment[];
  onRefreshAssessments: () => void;
  setActiveTab: (tab: string) => void;
  onOpenAIBriefing: () => void;
}

export const ImpactPredictionView: React.FC<ImpactPredictionViewProps> = ({
  cyclones,
  assessments,
  onRefreshAssessments,
  setActiveTab,
  onOpenAIBriefing,
}) => {
  const { canManageCyclones } = useAuth();
  const [selectedCycloneId, setSelectedCycloneId] = useState<string>(cyclones[0]?.id || '');
  const [timeHorizon, setTimeHorizon] = useState<number>(24);
  const [surgeHeight, setSurgeHeight] = useState<number>(3.8);
  const [rainfallBuffer, setRainfallBuffer] = useState<number>(48);
  const [isAssessing, setIsAssessing] = useState<boolean>(false);
  const [currentAssessment, setCurrentAssessment] = useState<ImpactAssessment | null>(
    assessments[0] || null
  );

  const selectedCyclone = cyclones.find((c) => c.id === selectedCycloneId) || cyclones[0];

  const handleRunAssessment = async () => {
    if (!selectedCyclone) return;
    setIsAssessing(true);
    try {
      const res = await api.runImpactAssessment({
        cycloneId: selectedCyclone.id,
        timeHorizonHours: timeHorizon,
        stormSurgeHeightMeters: surgeHeight,
        rainfallBufferHours: rainfallBuffer,
      });
      setCurrentAssessment(res.assessment);
      onRefreshAssessments();
    } catch (err: any) {
      alert(`Assessment calculation failed: ${err.message}`);
    } finally {
      setIsAssessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Cyclone Impact Prediction & Risk Modeling
          </h1>
          <p className="text-xs text-slate-400">
            Multi-factor deterministic modeling combining trajectory proximity, coastal elevation, and storm surge dynamics.
          </p>
        </div>

        <button
          onClick={onOpenAIBriefing}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-cyan-600/30 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate AI Briefing</span>
        </button>
      </div>

      {/* Configuration & Scenario Parameter Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            Simulation Parameters & Threat Scenario
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800">
            Model: Exponential Roughness Decay v3.2
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Target Cyclone Selection */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Selected Cyclone Event</label>
            <select
              value={selectedCycloneId}
              onChange={(e) => setSelectedCycloneId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {cyclones.map((c) => (
                <option key={c.id} value={c.id}>
                  Cyclone {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          {/* Time Horizon */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Forecast Horizon: <strong className="text-white">+{timeHorizon} Hours</strong>
            </label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value={6}>+6 Hours (Immediate Outer Bands)</option>
              <option value={12}>+12 Hours (Approaching Gale Radius)</option>
              <option value={18}>+18 Hours (Pre-Landfall Peak Surge)</option>
              <option value={24}>+24 Hours (Projected Eye Landfall)</option>
              <option value={36}>+36 Hours (Inland Dissipation Window)</option>
            </select>
          </div>

          {/* Storm Surge Height */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
              Tidal Surge Amplitude: <strong className="text-white">{surgeHeight.toFixed(1)} m</strong>
            </label>
            <input
              type="range"
              min="1.0"
              max="6.0"
              step="0.2"
              value={surgeHeight}
              onChange={(e) => setSurgeHeight(Number(e.target.value))}
              className="w-full accent-cyan-500 mt-2"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>1.0m (Minor)</span>
              <span>3.5m (Severe)</span>
              <span>6.0m (Catastrophic)</span>
            </div>
          </div>

          {/* Run Assessment Action */}
          <div className="flex items-end">
            <button
              onClick={handleRunAssessment}
              disabled={isAssessing}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isAssessing ? 'animate-spin' : ''}`} />
              <span>{isAssessing ? 'Computing Exposure...' : 'Run Impact Simulation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Assessment Results Section */}
      {currentAssessment ? (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="text-slate-400 text-xs font-semibold">Total Exposed Population</div>
              <div className="text-2xl font-black text-white mt-1">
                {currentAssessment.totalExposedPopulation.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Across 6 assessed coastal corridors</div>
            </div>

            <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/40 shadow-md">
              <div className="text-red-400 text-xs font-semibold">Critical Threat Exposure</div>
              <div className="text-2xl font-black text-red-300 mt-1">
                {currentAssessment.highRiskPopulation.toLocaleString()}
              </div>
              <div className="text-[11px] text-red-400 mt-1">Mandatory immediate evacuation</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="text-slate-400 text-xs font-semibold">Critical Infra at Risk</div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {currentAssessment.infrastructureExposureSummary.hospitalsAtRisk +
                  currentAssessment.infrastructureExposureSummary.powerGridsAtRisk}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                {currentAssessment.infrastructureExposureSummary.hospitalsAtRisk} hospitals,{' '}
                {currentAssessment.infrastructureExposureSummary.powerGridsAtRisk} substations
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md">
              <div className="text-slate-400 text-xs font-semibold">Model Confidence</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {currentAssessment.confidenceScore}%
              </div>
              <div className="text-[11px] text-emerald-400 mt-1">High fidelity IMD verification</div>
            </div>
          </div>

          {/* Regional Exposure Table */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Regional Exposure & Vulnerability Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Assessed based on distance from projected eye, coastal surge run-up, and structural masonry density.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('evacuation')}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors self-start"
              >
                <span>Launch Evacuation Planner &rarr;</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Region & State</th>
                    <th className="py-2.5 px-3">Dist. from Track</th>
                    <th className="py-2.5 px-3">Exposure Type</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3">Exposed Pop.</th>
                    <th className="py-2.5 px-3">Risk Score</th>
                    <th className="py-2.5 px-3">Critical Infrastructure</th>
                    <th className="py-2.5 px-3">Key Directive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {currentAssessment.regions.map((reg, idx) => {
                    const badgeClass =
                      reg.riskLevel === 'CRITICAL'
                        ? 'bg-red-950 text-red-400 border-red-800'
                        : reg.riskLevel === 'HIGH'
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : reg.riskLevel === 'MODERATE'
                        ? 'bg-yellow-950 text-yellow-400 border-yellow-800'
                        : 'bg-emerald-950 text-emerald-400 border-emerald-800';

                    return (
                      <tr key={idx} className="hover:bg-slate-800/40 text-slate-300">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-100">{reg.regionName}</div>
                          <div className="text-[10px] text-slate-500">{reg.state}</div>
                        </td>
                        <td className="py-3 px-3 font-mono">{reg.distanceFromTrackKm.toFixed(1)} km</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                            {reg.coastalExposure}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
                            {reg.riskLevel}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-white">
                          {reg.estimatedExposedPopulation.toLocaleString()}{' '}
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({Math.round((reg.estimatedExposedPopulation / reg.population) * 100)}%)
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold font-mono text-cyan-400">
                          {reg.riskScore} <span className="text-[10px] text-slate-500 font-normal">/100</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            {reg.criticalInfrastructure.slice(0, 2).map((inf, i) => (
                              <div key={i} className="text-[11px] text-slate-400 line-clamp-1">
                                • {inf}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[11px] text-slate-300 line-clamp-2">
                            {reg.recommendedActions[0]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Methodology & Limitations Notice */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="font-bold text-slate-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Scientific Methodology & Verification Protocols
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {currentAssessment.disclaimer} Calculations utilize verified mathematical track decay formulas with high-tide astronomical surge run-ups. Distinguishes official meteorological forecasts from illustrative simulation models.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
          <div className="text-slate-400 text-sm">No impact assessment selected.</div>
          <button
            onClick={handleRunAssessment}
            className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold"
          >
            Run Initial Assessment
          </button>
        </div>
      )}
    </div>
  );
};
