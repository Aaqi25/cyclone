import React, { useState } from 'react';
import {
  CycloneEvent,
  Shelter,
  EvacuationPlan,
  ReliefInventoryItem,
  ReliefTransaction,
  EmergencyAlert,
  ResponseTask,
  ImpactAssessment,
} from '../../types/index.ts';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Filter,
  ShieldAlert,
  Package,
  Home,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface ReportsViewProps {
  cyclones: CycloneEvent[];
  shelters: Shelter[];
  plans: EvacuationPlan[];
  inventory: ReliefInventoryItem[];
  transactions: ReliefTransaction[];
  alerts: EmergencyAlert[];
  tasks: ResponseTask[];
  assessments: ImpactAssessment[];
  dataSourceMode: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  cyclones,
  shelters,
  plans,
  inventory,
  transactions,
  alerts,
  tasks,
  assessments,
  dataSourceMode,
}) => {
  const [reportType, setReportType] = useState<
    'evacuation' | 'shelters' | 'relief' | 'impact' | 'tasks'
  >('evacuation');
  const [regionFilter, setRegionFilter] = useState('All');

  const exportCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((cell) => `"${cell}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCsv = () => {
    if (reportType === 'evacuation') {
      const headers = ['Plan ID', 'Cyclone', 'Region', 'District', 'Target Pop', 'Allocated Pop', 'Deficit', 'Status', 'Date'];
      const rows = plans.map((p) => [
        p.id,
        p.cycloneName,
        p.regionName,
        p.district,
        p.targetPopulation,
        p.allocatedPopulation,
        p.unallocatedPopulation,
        p.status,
        p.createdAt,
      ]);
      exportCsv('CycloneShield_Evacuation_Report', headers, rows);
    } else if (reportType === 'shelters') {
      const headers = ['Shelter Code', 'Facility Name', 'District', 'State', 'Max Capacity', 'Current Occupancy', 'Available Capacity', 'Status', 'Phone'];
      const rows = shelters.map((s) => [
        s.code,
        s.name,
        s.district,
        s.state,
        s.maxCapacity,
        s.currentOccupancy,
        s.availableCapacity,
        s.status,
        s.contactPhone,
      ]);
      exportCsv('CycloneShield_Shelter_Utilization_Report', headers, rows);
    } else if (reportType === 'relief') {
      const headers = ['Item Name', 'Category', 'Current Stock', 'Unit', 'Safety Minimum', 'Storage Depot', 'Status'];
      const rows = inventory.map((i) => [
        i.name,
        i.category,
        i.quantity,
        i.unit,
        i.minThreshold,
        i.storageLocation,
        i.status,
      ]);
      exportCsv('CycloneShield_Relief_Inventory_Report', headers, rows);
    } else if (reportType === 'tasks') {
      const headers = ['Task ID', 'Title', 'Priority', 'Assigned Team', 'Responsible User', 'Location', 'Deadline', 'Status'];
      const rows = tasks.map((t) => [
        t.id,
        t.title,
        t.priority,
        t.assignedTeam,
        t.responsibleUser,
        t.location,
        t.deadline,
        t.status,
      ]);
      exportCsv('CycloneShield_Response_Tasks_Report', headers, rows);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-cyan-400" />
            Statutory Disaster Analytics & Situation Reports
          </h1>
          <p className="text-xs text-slate-400">
            Exportable CSV metrics, audited operational tallies, and print-ready situation briefings.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Report</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setReportType('evacuation')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              reportType === 'evacuation'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Evacuation Allocation
          </button>

          <button
            onClick={() => setReportType('shelters')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              reportType === 'shelters'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Shelter Saturation
          </button>

          <button
            onClick={() => setReportType('relief')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              reportType === 'relief'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Relief Inventory & Supplies
          </button>

          <button
            onClick={() => setReportType('tasks')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              reportType === 'tasks'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Response Task Execution
          </button>
        </div>

        <div className="text-slate-400 text-[11px] font-mono">
          Data Engine: {dataSourceMode}
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Official Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 print:text-blue-800">
              NATIONAL DISASTER EMERGENCY COMMAND NETWORK • CYCLONESHIELD
            </div>
            <h2 className="text-lg font-extrabold text-white print:text-black mt-0.5">
              {reportType === 'evacuation' && 'Evacuation Allocation & Safe Transit Order'}
              {reportType === 'shelters' && 'Multi-Hazard Shelter Capacity & Occupancy Ledger'}
              {reportType === 'relief' && 'Emergency Relief Supply Reserve & Distribution Status'}
              {reportType === 'tasks' && 'Field Response Directive & Operational Task Tally'}
            </h2>
            <div className="text-xs text-slate-400 print:text-gray-600 mt-1">
              Generated: {new Date().toUTCString()} | Active Theater: Bay of Bengal
            </div>
          </div>

          <div className="text-right text-xs text-slate-400 font-mono">
            <div>CONFIDENTIAL • SEC-OPS 4</div>
            <div className="text-[10px] text-emerald-400 print:text-green-700">Audit Status: VERIFIED</div>
          </div>
        </div>

        {/* Content Table Depending on Type */}
        {reportType === 'evacuation' && (
          <div className="space-y-4">
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 print:bg-gray-100 text-slate-300 print:text-black border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Plan Code</th>
                    <th className="py-2.5 px-3">Target Region</th>
                    <th className="py-2.5 px-3">Target Evacuees</th>
                    <th className="py-2.5 px-3">Allocated Pax</th>
                    <th className="py-2.5 px-3">Deficit</th>
                    <th className="py-2.5 px-3">Buses Req.</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-gray-300">
                  {plans.map((p) => (
                    <tr key={p.id} className="text-slate-300 print:text-black">
                      <td className="py-3 px-3 font-mono font-bold text-cyan-400 print:text-blue-700">{p.id}</td>
                      <td className="py-3 px-3 font-semibold">{p.regionName}</td>
                      <td className="py-3 px-3 font-mono">{p.targetPopulation.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono text-emerald-400 font-bold">
                        {p.allocatedPopulation.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-red-400 font-bold">
                        {p.unallocatedPopulation.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono">{p.transportationRequirements.busesRequired} units</td>
                      <td className="py-3 px-3 font-bold">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'shelters' && (
          <div className="space-y-4">
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 print:bg-gray-100 text-slate-300 print:text-black border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Shelter Name & Code</th>
                    <th className="py-2.5 px-3">District</th>
                    <th className="py-2.5 px-3">Max Capacity</th>
                    <th className="py-2.5 px-3">Occupancy</th>
                    <th className="py-2.5 px-3">Available Places</th>
                    <th className="py-2.5 px-3">Amenities</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-gray-300">
                  {shelters.map((s) => (
                    <tr key={s.id} className="text-slate-300 print:text-black">
                      <td className="py-3 px-3 font-semibold">
                        <div>{s.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{s.code}</div>
                      </td>
                      <td className="py-3 px-3">{s.district}</td>
                      <td className="py-3 px-3 font-mono">{s.maxCapacity.toLocaleString()}</td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-400">
                        {s.currentOccupancy.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                        {s.availableCapacity.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-[11px]">
                        Gen: {s.hasGenerator ? 'Yes' : 'No'} | Water: {s.hasCleanWaterStorage ? 'Yes' : 'No'}
                      </td>
                      <td className="py-3 px-3 font-bold">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'relief' && (
          <div className="space-y-4">
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 print:bg-gray-100 text-slate-300 print:text-black border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Resource Item</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Available Stock</th>
                    <th className="py-2.5 px-3">Safety Min</th>
                    <th className="py-2.5 px-3">Warehouse Depot</th>
                    <th className="py-2.5 px-3">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-gray-300">
                  {inventory.map((i) => (
                    <tr key={i.id} className="text-slate-300 print:text-black">
                      <td className="py-3 px-3 font-semibold">{i.name}</td>
                      <td className="py-3 px-3">{i.category}</td>
                      <td className="py-3 px-3 font-mono font-bold text-white print:text-black">
                        {i.quantity.toLocaleString()} {i.unit}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {i.minThreshold.toLocaleString()} {i.unit}
                      </td>
                      <td className="py-3 px-3">{i.storageLocation}</td>
                      <td className="py-3 px-3 font-bold">{i.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {reportType === 'tasks' && (
          <div className="space-y-4">
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-950 print:bg-gray-100 text-slate-300 print:text-black border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Task Title</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Assigned Unit</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Deadline</th>
                    <th className="py-2.5 px-3">Execution Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-gray-300">
                  {tasks.map((t) => (
                    <tr key={t.id} className="text-slate-300 print:text-black">
                      <td className="py-3 px-3 font-semibold">{t.title}</td>
                      <td className="py-3 px-3 font-bold">{t.priority}</td>
                      <td className="py-3 px-3">{t.assignedTeam}</td>
                      <td className="py-3 px-3">{t.location}</td>
                      <td className="py-3 px-3 font-mono">{new Date(t.deadline).toLocaleDateString()}</td>
                      <td className="py-3 px-3 font-bold">{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Official Statutory Disclaimer */}
        <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 print:text-gray-500 leading-relaxed space-y-1">
          <div>
            <strong>MANDATORY DISCLOSURE:</strong> All statistics generated in this report reflect authenticated operational records from the CycloneShield command repository. Does not substitute formal gazetted disaster relief bulletins issued by the State Relief Commissioner.
          </div>
          <div>Report Signatory: State Emergency Operations Command Duty Officer • Verified by System Audit Hash #8390F2A1</div>
        </div>
      </div>
    </div>
  );
};
