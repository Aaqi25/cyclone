import React, { useState } from 'react';
import { api } from '../../api/client.ts';
import {
  Sparkles,
  X,
  AlertTriangle,
  Package,
  Users,
  CheckCircle2,
  FileText,
  Printer,
  RefreshCw,
} from 'lucide-react';

interface AIBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCycloneName?: string;
  activeCycloneId?: string;
}

export const AIBriefingModal: React.FC<AIBriefingModalProps> = ({
  isOpen,
  onClose,
  activeCycloneName,
  activeCycloneId,
}) => {
  const [loading, setLoading] = useState(false);
  const [briefing, setBriefing] = useState<any | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const handleFetchBriefing = async () => {
    setLoading(true);
    try {
      const res = await api.generateAIBriefing(activeCycloneId);
      setBriefing(res.briefing);
      setCheckedItems({});
    } catch (err: any) {
      console.error('Error generating briefing:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !briefing) {
      handleFetchBriefing();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-cyan-800/80 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                AI Disaster Operations Briefing
                {activeCycloneName && (
                  <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Cyclone {activeCycloneName}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Multi-agency intelligence synthesis powered by Google Gemini (gemini-3.8-flash)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFetchBriefing}
              disabled={loading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Refresh Briefing"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm font-semibold text-slate-300">
                Synthesizing Operational Situation with Gemini AI...
              </div>
              <div className="text-xs text-slate-500 max-w-md">
                Aggregating active cyclone tracks, coastal storm surge projections, shelter capacities, and critical inventory deficits.
              </div>
            </div>
          ) : briefing ? (
            <>
              {/* Source & Timestamp */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5 font-medium text-cyan-400">
                  <FileText className="w-3.5 h-3.5" />
                  Source: {briefing.source}
                </span>
                <span>
                  Generated: {new Date(briefing.generatedAt).toLocaleString()} | Security Level: EOC RESTRICTED
                </span>
              </div>

              {/* Executive Situation Summary */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1.5">
                  1. Executive Situation Summary
                </div>
                <p className="text-slate-200 leading-relaxed text-sm">{briefing.situationSummary}</p>
              </div>

              {/* Grid: Acute Risks & Resource Shortages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40">
                  <div className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    2. Acute Operational Hazards
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {briefing.majorRisks?.map((risk: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-2">
                    <Package className="w-4 h-4" />
                    3. Critical Resource Deficits
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {briefing.resourceShortages?.map((res: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                        <span>{res}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Evacuation Bottlenecks & Suggested Priorities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5 mb-2">
                    <Users className="w-4 h-4" />
                    4. Evacuation & Shelter Status
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {briefing.evacuationConcerns?.map((ec: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                        <span>{ec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    5. Suggested Immediate Priorities (6-12h)
                  </div>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {briefing.suggestedPriorities?.map((prio: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                        <span>{prio}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Human Sign-Off Checklist */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-900/50">
                <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  6. Statutory Human Sign-Off & Confirmation Checklist
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Under disaster management rules, AI recommendations require formal endorsement by authorized officers.
                </p>
                <div className="space-y-2">
                  {briefing.confirmationChecklist?.map((item: string, idx: number) => {
                    const isChecked = !!checkedItems[idx];
                    return (
                      <label
                        key={idx}
                        className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors border ${
                          isChecked
                            ? 'bg-cyan-950/40 border-cyan-700/60 text-slate-200'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheck(idx)}
                          className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-0"
                        />
                        <span className={`text-xs ${isChecked ? 'line-through text-slate-400' : ''}`}>
                          {item}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Protocol Disclaimer Notice */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{briefing.operationalNotice}</span>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-400">
              Failed to load briefing. Please click refresh to retry.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-500 font-mono">CycloneShield AI Decision Support Core</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors"
          >
            Dismiss Briefing
          </button>
        </div>
      </div>
    </div>
  );
};
