import React, { useState } from 'react';
import { Shelter, ShelterStatus } from '../../types/index.ts';
import { CommandMap } from '../map/CommandMap.tsx';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Home,
  Plus,
  Search,
  Filter,
  Users,
  Phone,
  Zap,
  Droplet,
  Edit,
  X,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

interface ShelterManagementViewProps {
  shelters: Shelter[];
  onRefreshShelters: () => void;
  setActiveTab: (tab: string) => void;
}

export const ShelterManagementView: React.FC<ShelterManagementViewProps> = ({
  shelters,
  onRefreshShelters,
  setActiveTab,
}) => {
  const { canManageShelters } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(shelters[0] || null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOccupancyModal, setShowOccupancyModal] = useState(false);
  const [occupancyInput, setOccupancyInput] = useState<number>(0);
  const [occupancyError, setOccupancyError] = useState<string | null>(null);

  // New Shelter Form State
  const [newShelter, setNewShelter] = useState({
    name: '',
    code: '',
    district: 'Ganjam',
    state: 'Odisha',
    latitude: 19.35,
    longitude: 84.95,
    maxCapacity: 2000,
    currentOccupancy: 0,
    accessibilityInfo: 'Step-free ramp, ground floor halls, disabled restrooms',
    medicalFacilities: 'Emergency first aid post, mobile triage clinic',
    contactPerson: '',
    contactPhone: '',
    hasGenerator: true,
    hasCleanWaterStorage: true,
  });

  const districts = ['All', ...Array.from(new Set(shelters.map((s) => s.district)))];

  const filteredShelters = shelters.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDistrict = districtFilter === 'All' || s.district === districtFilter;
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchDistrict && matchStatus;
  });

  const handleOpenOccupancyModal = (shelter: Shelter) => {
    setSelectedShelter(shelter);
    setOccupancyInput(shelter.currentOccupancy);
    setOccupancyError(null);
    setShowOccupancyModal(true);
  };

  const handleUpdateOccupancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShelter) return;

    if (occupancyInput < 0) {
      setOccupancyError('Occupancy count cannot be negative.');
      return;
    }
    if (occupancyInput > selectedShelter.maxCapacity) {
      setOccupancyError(`Cannot exceed maximum shelter capacity (${selectedShelter.maxCapacity}).`);
      return;
    }

    try {
      await api.updateShelter(selectedShelter.id, {
        currentOccupancy: occupancyInput,
      });
      setShowOccupancyModal(false);
      onRefreshShelters();
    } catch (err: any) {
      setOccupancyError(err.message);
    }
  };

  const handleCreateShelter = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createShelter(newShelter);
      setShowAddModal(false);
      onRefreshShelters();
    } catch (err: any) {
      alert(`Error creating shelter: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-emerald-400" />
            Evacuation Shelter Management Directory
          </h1>
          <p className="text-xs text-slate-400">
            Real-time capacity tracking, accessibility amenities, medical support, and dynamic status monitors.
          </p>
        </div>

        {canManageShelters && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Shelter</span>
          </button>
        )}
      </div>

      {/* Map Preview */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
          <span>Frontline Coastal Shelter Geographic Distribution</span>
          <span className="text-[11px] text-slate-400">
            Green: Operational | Yellow: &ge;85% Occupied | Red: 100% Full
          </span>
        </div>
        <CommandMap
          shelters={filteredShelters}
          height="340px"
          onSelectShelter={(shl) => setSelectedShelter(shl)}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2 w-full">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search shelter by name, code, district..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Districts' : `District: ${d}`}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="Operational">Operational</option>
              <option value="Near Capacity">Near Capacity (&ge;85%)</option>
              <option value="Full">Full (100%)</option>
              <option value="Temporarily Closed">Temporarily Closed</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-400 shrink-0 font-mono">
          {filteredShelters.length} Facilities Cataloged
        </div>
      </div>

      {/* Shelter Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShelters.map((shelter) => {
          const occupancyRate =
            shelter.maxCapacity > 0
              ? Math.round((shelter.currentOccupancy / shelter.maxCapacity) * 100)
              : 0;

          const statusBadge =
            shelter.status === 'Operational'
              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
              : shelter.status === 'Near Capacity'
              ? 'bg-amber-950 text-amber-400 border-amber-800'
              : shelter.status === 'Full'
              ? 'bg-red-950 text-red-400 border-red-800'
              : 'bg-slate-800 text-slate-400 border-slate-700';

          return (
            <div
              key={shelter.id}
              className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-800/80 transition-all shadow-md space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm line-clamp-1">{shelter.name}</h3>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {shelter.code} • {shelter.district}, {shelter.state}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${statusBadge}`}>
                    {shelter.status}
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300 font-mono">
                    <span>Occupancy: {shelter.currentOccupancy} / {shelter.maxCapacity}</span>
                    <span className="font-bold text-cyan-400">{occupancyRate}%</span>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        occupancyRate >= 100
                          ? 'bg-red-500'
                          : occupancyRate >= 85
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, occupancyRate)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Available places:</span>
                    <strong className="text-emerald-400 font-bold">{shelter.availableCapacity}</strong>
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                  <span
                    className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                      shelter.hasGenerator
                        ? 'bg-slate-950 text-cyan-300 border border-slate-800'
                        : 'bg-slate-950 text-slate-600 border border-slate-900'
                    }`}
                  >
                    <Zap className="w-3 h-3" /> Generator {shelter.hasGenerator ? '✓' : '✗'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                      shelter.hasCleanWaterStorage
                        ? 'bg-slate-950 text-blue-300 border border-slate-800'
                        : 'bg-slate-950 text-slate-600 border border-slate-900'
                    }`}
                  >
                    <Droplet className="w-3 h-3" /> Water Tank {shelter.hasCleanWaterStorage ? '✓' : '✗'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-1">
                  <strong>Medical:</strong> {shelter.medicalFacilities}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">
                  <strong>Access:</strong> {shelter.accessibilityInfo}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{shelter.contactPhone}</span>
                </div>

                {canManageShelters && (
                  <button
                    onClick={() => handleOpenOccupancyModal(shelter)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Edit className="w-3 h-3 text-cyan-400" />
                    <span>Update Occupancy</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Update Occupancy Modal */}
      {showOccupancyModal && selectedShelter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Update Shelter Occupancy
              </h3>
              <button
                onClick={() => setShowOccupancyModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateOccupancy} className="space-y-4 text-xs">
              <div>
                <div className="font-bold text-slate-200 text-sm">{selectedShelter.name}</div>
                <div className="text-slate-400 text-xs">Maximum Capacity: {selectedShelter.maxCapacity} places</div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  New Headcount / Occupancy
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedShelter.maxCapacity}
                  required
                  value={occupancyInput}
                  onChange={(e) => setOccupancyInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono text-base focus:outline-none focus:border-cyan-500"
                />
                <div className="text-[11px] text-slate-500 mt-1">
                  Available balance will update to: {Math.max(0, selectedShelter.maxCapacity - occupancyInput)}
                </div>
              </div>

              {occupancyError && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-400 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{occupancyError}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOccupancyModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Save Occupancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Shelter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-400" />
                Register New Emergency Cyclone Shelter
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateShelter} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Shelter Facility Name</label>
                  <input
                    type="text"
                    required
                    value={newShelter.name}
                    onChange={(e) => setNewShelter({ ...newShelter, name: e.target.value })}
                    placeholder="e.g. Konark Multi-Hazard Shelter"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Shelter Identification Code</label>
                  <input
                    type="text"
                    required
                    value={newShelter.code}
                    onChange={(e) => setNewShelter({ ...newShelter, code: e.target.value })}
                    placeholder="e.g. CS-KNK-09"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={newShelter.district}
                    onChange={(e) => setNewShelter({ ...newShelter, district: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newShelter.state}
                    onChange={(e) => setNewShelter({ ...newShelter, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min="50"
                    required
                    value={newShelter.maxCapacity}
                    onChange={(e) => setNewShelter({ ...newShelter, maxCapacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={newShelter.latitude}
                    onChange={(e) => setNewShelter({ ...newShelter, latitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={newShelter.longitude}
                    onChange={(e) => setNewShelter({ ...newShelter, longitude: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Contact Officer</label>
                  <input
                    type="text"
                    required
                    value={newShelter.contactPerson}
                    onChange={(e) => setNewShelter({ ...newShelter, contactPerson: e.target.value })}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    required
                    value={newShelter.contactPhone}
                    onChange={(e) => setNewShelter({ ...newShelter, contactPhone: e.target.value })}
                    placeholder="e.g. +91-9876543210"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={newShelter.hasGenerator}
                    onChange={(e) => setNewShelter({ ...newShelter, hasGenerator: e.target.checked })}
                    className="rounded border-slate-700 text-cyan-500"
                  />
                  <span>Backup Diesel Generator</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={newShelter.hasCleanWaterStorage}
                    onChange={(e) => setNewShelter({ ...newShelter, hasCleanWaterStorage: e.target.checked })}
                    className="rounded border-slate-700 text-cyan-500"
                  />
                  <span>Potable Water Tanks</span>
                </label>
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
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Register Shelter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
