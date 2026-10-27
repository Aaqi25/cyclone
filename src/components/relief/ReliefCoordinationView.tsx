import React, { useState } from 'react';
import {
  ReliefInventoryItem,
  ReliefTransaction,
  ReliefRequest,
  ReliefCategory,
  ReliefRequestStatus,
} from '../../types/index.ts';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Package,
  Plus,
  Send,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Truck,
  X,
  History,
} from 'lucide-react';

interface ReliefCoordinationViewProps {
  inventory: ReliefInventoryItem[];
  transactions: ReliefTransaction[];
  requests: ReliefRequest[];
  onRefreshRelief: () => void;
  setActiveTab: (tab: string) => void;
}

export const ReliefCoordinationView: React.FC<ReliefCoordinationViewProps> = ({
  inventory,
  transactions,
  requests,
  onRefreshRelief,
  setActiveTab,
}) => {
  const { canManageRelief } = useAuth();
  const [tabMode, setTabMode] = useState<'inventory' | 'requests' | 'transactions'>('inventory');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [showDistributeModal, setShowDistributeModal] = useState(false);
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);

  // Distribution Form
  const [distributeForm, setDistributeForm] = useState({
    itemId: inventory[0]?.id || '',
    quantity: 100,
    recipientArea: '',
    notes: '',
  });
  const [distributeError, setDistributeError] = useState<string | null>(null);

  // Add Resource Form
  const [newResource, setNewResource] = useState({
    name: '',
    category: 'Food & Rations' as ReliefCategory,
    quantity: 1000,
    unit: 'Packs',
    storageLocation: 'Central Disaster Depot, Bhubaneswar Hub A',
    minThreshold: 500,
  });

  // New Request Form
  const [newRequest, setNewRequest] = useState({
    affectedLocation: '',
    requestingOrg: 'District Disaster Relief Cell',
    resourceCategory: 'Food & Rations' as ReliefCategory,
    resourceName: 'Ready-to-Eat Emergency Food Packs',
    requiredQuantity: 500,
    unit: 'Packs',
    priority: 'High' as const,
    description: '',
  });

  const categories: string[] = ['All', 'Food & Rations', 'Drinking Water', 'Medical Supplies', 'Bedding & Tarpaulins', 'Rescue Gear', 'Sanitation & Hygiene'];

  const filteredInventory = inventory.filter((item) => {
    const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.storageLocation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const filteredRequests = requests.filter((req) => {
    const matchStatus = statusFilter === 'All' || req.status === statusFilter;
    const matchSearch = req.affectedLocation.toLowerCase().includes(searchTerm.toLowerCase()) || req.resourceName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    setDistributeError(null);
    try {
      await api.distributeRelief(distributeForm);
      setShowDistributeModal(false);
      onRefreshRelief();
    } catch (err: any) {
      setDistributeError(err.message);
    }
  };

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addReliefInventory(newResource);
      setShowAddResourceModal(false);
      onRefreshRelief();
    } catch (err: any) {
      alert(`Error adding resource: ${err.message}`);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createReliefRequest(newRequest);
      setShowNewRequestModal(false);
      onRefreshRelief();
    } catch (err: any) {
      alert(`Error creating request: ${err.message}`);
    }
  };

  const handleUpdateRequestStatus = async (id: string, status: ReliefRequestStatus) => {
    try {
      await api.updateReliefRequest(id, { status });
      onRefreshRelief();
    } catch (err: any) {
      alert(`Error updating request: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            Disaster Relief Inventory & Supply Chain Command
          </h1>
          <p className="text-xs text-slate-400">
            Atomic distribution auditing, stock-level enforcement, shortage alerts, and field request workflows.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {canManageRelief && (
            <>
              <button
                onClick={() => setShowAddResourceModal(true)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Add Stock</span>
              </button>

              <button
                onClick={() => {
                  setDistributeForm({
                    itemId: inventory[0]?.id || '',
                    quantity: 100,
                    recipientArea: '',
                    notes: '',
                  });
                  setDistributeError(null);
                  setShowDistributeModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Distribute Supplies</span>
              </button>
            </>
          )}

          <button
            onClick={() => setShowNewRequestModal(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Submit Requisition</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setTabMode('inventory')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            tabMode === 'inventory'
              ? 'bg-purple-950 text-purple-300 border border-purple-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Warehouse Inventory ({inventory.length})</span>
        </button>

        <button
          onClick={() => setTabMode('requests')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            tabMode === 'requests'
              ? 'bg-purple-950 text-purple-300 border border-purple-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Field Requisitions Board ({requests.length})</span>
        </button>

        <button
          onClick={() => setTabMode('transactions')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 ${
            tabMode === 'transactions'
              ? 'bg-purple-950 text-purple-300 border border-purple-800'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Distribution Audit Trail ({transactions.length})</span>
        </button>
      </div>

      {/* VIEW 1: INVENTORY DIRECTORY */}
      {tabMode === 'inventory' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex flex-1 items-center gap-2 w-full">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search resources, medicines, equipment..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-slate-400 font-mono">
              {filteredInventory.length} Items Listed
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {filteredInventory.map((item) => {
              const statusBadge =
                item.status === 'Adequate'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : item.status === 'Low Stock'
                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                  : 'bg-red-950 text-red-400 border-red-800 animate-pulse';

              const percentOfThreshold =
                item.minThreshold > 0 ? Math.round((item.quantity / item.minThreshold) * 100) : 100;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-800/80 transition-all shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                        {item.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusBadge}`}>
                        {item.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-100 text-sm line-clamp-1">{item.name}</h3>
                    <div className="text-[11px] text-slate-400 line-clamp-1">{item.storageLocation}</div>

                    <div className="pt-2 flex items-baseline justify-between">
                      <div className="text-2xl font-black text-white font-mono">
                        {item.quantity.toLocaleString()}{' '}
                        <span className="text-xs text-slate-400 font-normal">{item.unit}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Safety Min: {item.minThreshold.toLocaleString()}
                      </div>
                    </div>

                    {/* Threshold Bar */}
                    <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full ${
                          percentOfThreshold >= 100
                            ? 'bg-emerald-500'
                            : percentOfThreshold >= 40
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, percentOfThreshold)}%` }}
                      ></div>
                    </div>
                  </div>

                  {canManageRelief && (
                    <div className="pt-2 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={() => {
                          setDistributeForm({
                            itemId: item.id,
                            quantity: Math.min(item.quantity, 100),
                            recipientArea: '',
                            notes: '',
                          });
                          setDistributeError(null);
                          setShowDistributeModal(true);
                        }}
                        disabled={item.quantity <= 0}
                        className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-40"
                      >
                        <Send className="w-3 h-3 text-cyan-400" />
                        <span>Issue Dispatch</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: RELIEF REQUISITIONS BOARD */}
      {tabMode === 'requests' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300"
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <span className="text-slate-400 font-mono">{filteredRequests.length} Requests Pending</span>
          </div>

          <div className="space-y-3">
            {filteredRequests.map((req) => {
              const priorityBadge =
                req.priority === 'Critical'
                  ? 'bg-red-950 text-red-400 border-red-800'
                  : req.priority === 'High'
                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                  : 'bg-slate-800 text-slate-300 border-slate-700';

              return (
                <div
                  key={req.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-800/80 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400">{req.code}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${priorityBadge}`}>
                        {req.priority} Priority
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-cyan-400 border border-slate-800">
                        {req.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-100 text-sm">
                      {req.requiredQuantity.toLocaleString()} {req.unit} of {req.resourceName}
                    </h4>

                    <div className="text-slate-400 flex flex-wrap items-center gap-3 text-[11px]">
                      <span>Destination: <strong className="text-slate-200">{req.affectedLocation}</strong></span>
                      <span>Requestor: {req.requestingOrg}</span>
                      <span>Submitted: {new Date(req.requestTimestamp).toLocaleTimeString()}</span>
                    </div>

                    {req.description && (
                      <p className="text-[11px] text-slate-400 italic">"{req.description}"</p>
                    )}
                  </div>

                  {canManageRelief && (
                    <div className="flex items-center gap-2 shrink-0">
                      {req.status === 'Submitted' && (
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, 'Under Review')}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                        >
                          Review
                        </button>
                      )}
                      {(req.status === 'Submitted' || req.status === 'Under Review') && (
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, 'Approved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        >
                          Approve
                        </button>
                      )}
                      {req.status === 'Approved' && (
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, 'In Transit')}
                          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch</span>
                        </button>
                      )}
                      {req.status === 'In Transit' && (
                        <button
                          onClick={() => handleUpdateRequestStatus(req.id, 'Delivered')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                        >
                          Confirm Delivery
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 3: DISTRIBUTION TRANSACTIONS AUDIT TRAIL */}
      {tabMode === 'transactions' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
            Immutable Supply Distribution Ledger
          </div>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Transaction ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Resource Item</th>
                  <th className="py-2.5 px-3">Dispatched Quantity</th>
                  <th className="py-2.5 px-3">Balance After</th>
                  <th className="py-2.5 px-3">Recipient Zone</th>
                  <th className="py-2.5 px-3">Authorized Officer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 text-slate-300">
                    <td className="py-3 px-3 font-mono text-cyan-400">{tx.id}</td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-100">{tx.itemName}</td>
                    <td className="py-3 px-3 font-bold text-red-400">-{tx.quantity.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono text-slate-200">{tx.newBalance.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-200">{tx.recipientArea}</td>
                    <td className="py-3 px-3 text-slate-400">{tx.authorizedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Distribute Relief Supplies */}
      {showDistributeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-400" />
                Authorize Relief Supply Dispatch
              </h3>
              <button
                onClick={() => setShowDistributeModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDistribute} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Select Inventory Resource</label>
                <select
                  value={distributeForm.itemId}
                  onChange={(e) => setDistributeForm({ ...distributeForm, itemId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                >
                  {inventory.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} (Available: {inv.quantity} {inv.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Quantity to Dispatch</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={distributeForm.quantity}
                  onChange={(e) => setDistributeForm({ ...distributeForm, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-base"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Destination / Recipient Zone</label>
                <input
                  type="text"
                  required
                  value={distributeForm.recipientArea}
                  onChange={(e) => setDistributeForm({ ...distributeForm, recipientArea: e.target.value })}
                  placeholder="e.g. Gopalpur Coastal Shelter Sector 4"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Dispatch Notes / Escort Vehicle</label>
                <input
                  type="text"
                  value={distributeForm.notes}
                  onChange={(e) => setDistributeForm({ ...distributeForm, notes: e.target.value })}
                  placeholder="e.g. Dispatched via ODRAF High-Clearance Truck #2"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>

              {distributeError && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{distributeError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDistributeModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Execute Distribution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Resource */}
      {showAddResourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" />
                Register Relief Resource in Inventory
              </h3>
              <button
                onClick={() => setShowAddResourceModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddResource} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Resource Name</label>
                <input
                  type="text"
                  required
                  value={newResource.name}
                  onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                  placeholder="e.g. High-Calorie Ready Meals"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Category</label>
                  <select
                    value={newResource.category}
                    onChange={(e) => setNewResource({ ...newResource, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    {categories.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Unit of Measurement</label>
                  <input
                    type="text"
                    required
                    value={newResource.unit}
                    onChange={(e) => setNewResource({ ...newResource, unit: e.target.value })}
                    placeholder="e.g. Kits, Cans, Units"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Initial Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newResource.quantity}
                    onChange={(e) => setNewResource({ ...newResource, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Low-Stock Alert Threshold</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newResource.minThreshold}
                    onChange={(e) => setNewResource({ ...newResource, minThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Storage Depot Location</label>
                <input
                  type="text"
                  required
                  value={newResource.storageLocation}
                  onChange={(e) => setNewResource({ ...newResource, storageLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddResourceModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Add Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Requisition */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-400" />
                Submit Emergency Field Requisition
              </h3>
              <button
                onClick={() => setShowNewRequestModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Affected Location / Camp</label>
                <input
                  type="text"
                  required
                  value={newRequest.affectedLocation}
                  onChange={(e) => setNewRequest({ ...newRequest, affectedLocation: e.target.value })}
                  placeholder="e.g. Gopalpur Fishermen Colony Ward 2"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Resource Name</label>
                  <input
                    type="text"
                    required
                    value={newRequest.resourceName}
                    onChange={(e) => setNewRequest({ ...newRequest, resourceName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Quantity Needed</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newRequest.requiredQuantity}
                    onChange={(e) => setNewRequest({ ...newRequest, requiredQuantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Priority</label>
                  <select
                    value={newRequest.priority}
                    onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Requesting Agency</label>
                  <input
                    type="text"
                    value={newRequest.requestingOrg}
                    onChange={(e) => setNewRequest({ ...newRequest, requestingOrg: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Field Justification</label>
                <textarea
                  rows={2}
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Explain urgent field need..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
