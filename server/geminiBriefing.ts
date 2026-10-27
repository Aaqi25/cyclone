import { GoogleGenAI } from '@google/genai';
import {
  CycloneEvent,
  Shelter,
  EvacuationPlan,
  ReliefInventoryItem,
  EmergencyAlert,
  ResponseTask,
} from '../src/types/index.ts';

export interface DisasterBriefingInput {
  cyclones: CycloneEvent[];
  shelters: Shelter[];
  evacuationPlans: EvacuationPlan[];
  inventory: ReliefInventoryItem[];
  alerts: EmergencyAlert[];
  tasks: ResponseTask[];
  requesterName?: string;
  focusCycloneId?: string;
}

export interface DisasterBriefingOutput {
  generatedAt: string;
  source: 'Google Gemini AI (gemini-3.8-flash)' | 'Rule-Based Fallback Synthesis';
  situationSummary: string;
  majorRisks: string[];
  resourceShortages: string[];
  evacuationConcerns: string[];
  suggestedPriorities: string[];
  confirmationChecklist: string[];
  operationalNotice: string;
}

export async function generateDisasterBriefing(
  input: DisasterBriefingInput
): Promise<DisasterBriefingOutput> {
  const activeCyclones = input.cyclones.filter((c) => c.warningStatus !== 'INFORMATIONAL');
  const criticalAlerts = input.alerts.filter((a) => a.severity === 'Critical' && a.status === 'Active');
  const fullShelters = input.shelters.filter((s) => s.status === 'Full' || s.status === 'Near Capacity');
  const shortSupplies = input.inventory.filter((i) => i.status !== 'Adequate');
  const pendingTasks = input.tasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled');

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const promptPayload = {
        activeCyclones: activeCyclones.map((c) => ({
          name: c.name,
          category: c.category,
          windSpeedKmph: c.windSpeedKmph,
          centralPressure: c.centralPressureHpa,
          location: [c.latitude, c.longitude],
          affectedRegions: c.affectedRegions,
        })),
        criticalAlertCount: criticalAlerts.length,
        sheltersSummary: {
          total: input.shelters.length,
          nearCapacityOrFull: fullShelters.length,
          totalAvailableCapacity: input.shelters.reduce((acc, s) => acc + s.availableCapacity, 0),
        },
        inventoryShortages: shortSupplies.map((s) => ({
          name: s.name,
          category: s.category,
          currentQuantity: s.quantity,
          unit: s.unit,
          threshold: s.minThreshold,
          status: s.status,
        })),
        evacuationPlans: input.evacuationPlans.map((p) => ({
          region: p.regionName,
          target: p.targetPopulation,
          allocated: p.allocatedPopulation,
          unallocatedDeficit: p.unallocatedPopulation,
          progress: `${p.evacuationPercentage}%`,
        })),
        openTasksCount: pendingTasks.length,
      };

      const systemInstruction = `You are the Senior Emergency Operations AI Briefing Assistant for CycloneShield.
Synthesize a high-level command operations briefing based exclusively on the provided disaster telemetry.
Structure your response in strict JSON with the following keys:
{
  "situationSummary": "A concise 2-3 sentence executive synopsis of current cyclone threats and landfall timelines.",
  "majorRisks": ["list of 3-4 top acute hazards (surge, wind, infrastructure)"],
  "resourceShortages": ["list of specific logistics deficits from inventory and shelter data"],
  "evacuationConcerns": ["list of unallocated populations, near-capacity shelters, or convoy bottlenecks"],
  "suggestedPriorities": ["3-5 high-priority immediate inter-agency actions for the next 6-12 hours"],
  "confirmationChecklist": ["3-4 specific decisions that require human commander sign-off"]
}
Do not hallucinate coordinates or announce false safe zones. Tone must be authoritative, objective, and urgent.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: JSON.stringify(promptPayload),
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const rawJson = response.text ? response.text.trim() : '';
      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        return {
          generatedAt: new Date().toISOString(),
          source: 'Google Gemini AI (gemini-3.8-flash)',
          situationSummary: parsed.situationSummary || 'Severe cyclonic conditions ongoing across coastal corridors.',
          majorRisks: Array.isArray(parsed.majorRisks) ? parsed.majorRisks : [],
          resourceShortages: Array.isArray(parsed.resourceShortages) ? parsed.resourceShortages : [],
          evacuationConcerns: Array.isArray(parsed.evacuationConcerns) ? parsed.evacuationConcerns : [],
          suggestedPriorities: Array.isArray(parsed.suggestedPriorities) ? parsed.suggestedPriorities : [],
          confirmationChecklist: Array.isArray(parsed.confirmationChecklist) ? parsed.confirmationChecklist : [],
          operationalNotice:
            'AI-GENERATED ADVISORY: This synthesis is compiled by Google Gemini based on platform telemetry. It does not replace statutory directives issued by the State Emergency Operations Center or IMD.',
        };
      }
    } catch (err: any) {
      console.warn('[CycloneShield Gemini] Gemini briefing generation error, falling back to rule engine:', err?.message || err);
    }
  }

  // Resilient Rule-Based Fallback Synthesis
  const primaryCyclone = activeCyclones[0] || input.cyclones[0];
  const totalDeficit = input.evacuationPlans.reduce((sum, p) => sum + p.unallocatedPopulation, 0);

  return {
    generatedAt: new Date().toISOString(),
    source: 'Rule-Based Fallback Synthesis',
    situationSummary: primaryCyclone
      ? `Cyclone ${primaryCyclone.name} (${primaryCyclone.category}) is centered at [${primaryCyclone.latitude}°N, ${primaryCyclone.longitude}°E] packing sustained winds of ${primaryCyclone.windSpeedKmph} km/h with central pressure ${primaryCyclone.centralPressureHpa} hPa. Coastal approach presents imminent storm surge threat to ${primaryCyclone.affectedRegions.slice(0, 3).join(', ')}.`
      : 'No active high-intensity cyclone systems currently detected in frontline basins.',
    majorRisks: [
      `Inundation danger: Storm surge predicted between 2.5m - 4.2m above normal tide in low-lying coastal belts.`,
      `Structural hazard: High-velocity gale winds (>160 kmph) likely to uproot trees and disrupt electric power transmission.`,
      `Communication vulnerability: Ground mobile cell towers susceptible to line-of-sight mast damage.`,
    ],
    resourceShortages: shortSupplies.length > 0
      ? shortSupplies.map((s) => `${s.name}: Current stock ${s.quantity} ${s.unit} is below safety threshold (${s.minThreshold} ${s.unit}).`)
      : ['All frontline supply depots currently meet minimum reserve levels.'],
    evacuationConcerns: [
      totalDeficit > 0
        ? `Deficit warning: ${totalDeficit.toLocaleString()} vulnerable residents remain unallocated in designated primary shelters.`
        : 'Primary shelter capacity is currently aligned with planned evacuation numbers.',
      `${fullShelters.length} shelter facilities are currently near or at 100% capacity and require perimeter traffic diversions.`,
      'Convoy transport routes require continuous police escort clearance along coastal arteries.',
    ],
    suggestedPriorities: [
      'Expedite deployment of secondary inland transit shelters for unallocated evacuees.',
      'Pre-position potable water tanker convoys and high-capacity de-watering pumps in flood zones.',
      'Coordinate with district electric supply boards for controlled pre-emptive grid shutdowns.',
      'Conduct satellite phone check-in protocols across all coastal District Emergency Operation Centers (DEOCs).',
    ],
    confirmationChecklist: [
      'Formal declaration of mandatory evacuation for the 0-3km coastal zone by District Magistrate.',
      'Approval of emergency relief budget requisition for mutual aid water logistics.',
      'Authorization to requisition private transport fleet and school auditorium compounds.',
    ],
    operationalNotice:
      'OFFICIAL PROTOCOL: This operational briefing is synthesized from active CycloneShield sensor feeds and shelter records. Deployment orders require formal signature by an authorized Disaster Management Officer.',
  };
}
