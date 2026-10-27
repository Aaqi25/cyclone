import React, { useState } from 'react';
import { ResponseTask, TaskPriority, TaskStatus } from '../../types/index.ts';
import { api } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertTriangle,
  User,
  MapPin,
  CheckCircle2,
  X,
  Search,
  Filter,
} from 'lucide-react';

interface ResponseTasksViewProps {
  tasks: ResponseTask[];
  onRefreshTasks: () => void;
  setActiveTab: (tab: string) => void;
}

export const ResponseTasksView: React.FC<ResponseTasksViewProps> = ({
  tasks,
  onRefreshTasks,
}) => {
  const { canManageTasks } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Form State
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'High' as TaskPriority,
    assignedTeam: 'ODRAF 4th Battalion Rescue Unit',
    responsibleUser: 'Capt. Vikram Rathore',
    location: 'Gopalpur on Sea, Ganjam',
    deadlineHoursFromNow: 6,
  });

  const now = new Date();

  // Summary Metrics
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress' || t.status === 'Assigned').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const overdueCount = tasks.filter(
    (t) => (t.status === 'Pending' || t.status === 'In Progress' || t.status === 'Assigned') && new Date(t.deadline) < now
  ).length;

  const filteredTasks = tasks.filter((t) => {
    const isOverdue = new Date(t.deadline) < now && t.status !== 'Completed';
    if (statusFilter === 'Overdue') {
      if (!isOverdue) return false;
    } else if (statusFilter !== 'All' && t.status !== statusFilter) {
      return false;
    }

    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;

    const matchSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assignedTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location.toLowerCase().includes(searchTerm.toLowerCase());

    return matchSearch;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const deadlineDate = new Date(Date.now() + newTask.deadlineHoursFromNow * 3600000).toISOString();
      await api.createTask({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        assignedTeam: newTask.assignedTeam,
        responsibleUser: newTask.responsibleUser,
        location: newTask.location,
        deadline: deadlineDate,
      });
      setShowCreateModal(false);
      onRefreshTasks();
    } catch (err: any) {
      alert(`Error creating task: ${err.message}`);
    }
  };

  const handleUpdateStatus = async (id: string, status: TaskStatus) => {
    try {
      await api.updateTask(id, { status });
      onRefreshTasks();
    } catch (err: any) {
      alert(`Error updating task status: ${err.message}`);
    }
  };

  const handleCompleteTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId) return;
    try {
      await api.updateTask(selectedTaskId, {
        status: 'Completed',
        completionNotes,
      });
      setShowCompleteModal(false);
      setCompletionNotes('');
      onRefreshTasks();
    } catch (err: any) {
      alert(`Error completing task: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-cyan-400" />
            Emergency Response Task Operations Command
          </h1>
          <p className="text-xs text-slate-400">
            Field deployment orders, ODRAF/NDRF dispatch tracking, and deadline enforcement.
          </p>
        </div>

        {canManageTasks && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create Response Task</span>
          </button>
        )}
      </div>

      {/* Task Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div
          onClick={() => setStatusFilter('Pending')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-800/80 cursor-pointer transition-all shadow-md"
        >
          <div className="text-slate-400 text-xs font-semibold">Pending Assignment</div>
          <div className="text-2xl font-black text-white mt-1">{pendingCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting unit deployment</div>
        </div>

        <div
          onClick={() => setStatusFilter('In Progress')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-800/80 cursor-pointer transition-all shadow-md"
        >
          <div className="text-cyan-400 text-xs font-semibold">Active In-Progress</div>
          <div className="text-2xl font-black text-cyan-300 mt-1">{inProgressCount}</div>
          <div className="text-[11px] text-cyan-500 mt-1">Units executing in field</div>
        </div>

        <div
          onClick={() => setStatusFilter('Completed')}
          className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-800/80 cursor-pointer transition-all shadow-md"
        >
          <div className="text-emerald-400 text-xs font-semibold">Completed Orders</div>
          <div className="text-2xl font-black text-emerald-300 mt-1">{completedCount}</div>
          <div className="text-[11px] text-emerald-500 mt-1">Acknowledged by team lead</div>
        </div>

        <div
          onClick={() => setStatusFilter('Overdue')}
          className="p-4 rounded-xl bg-red-950/30 border border-red-900/40 hover:border-red-700 cursor-pointer transition-all shadow-md"
        >
          <div className="text-red-400 text-xs font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Overdue Critical
          </div>
          <div className="text-2xl font-black text-red-300 mt-1">{overdueCount}</div>
          <div className="text-[11px] text-red-400 mt-1">Exceeded target deadline</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-2 w-full">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks, teams, locations..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue Deadlines Only</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono">
          {filteredTasks.length} Task Records
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const isOverdue = new Date(task.deadline) < now && task.status !== 'Completed';

          const priorityBadge =
            task.priority === 'Critical'
              ? 'bg-red-950 text-red-400 border-red-800'
              : task.priority === 'High'
              ? 'bg-amber-950 text-amber-400 border-amber-800'
              : 'bg-slate-800 text-slate-300 border-slate-700';

          const statusBadge =
            task.status === 'Completed'
              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
              : task.status === 'In Progress'
              ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
              : 'bg-slate-800 text-slate-400 border-slate-700';

          return (
            <div
              key={task.id}
              className={`p-4 rounded-xl border shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
                isOverdue
                  ? 'bg-red-950/20 border-red-800/70'
                  : task.status === 'Completed'
                  ? 'bg-slate-950/60 border-slate-800/80'
                  : 'bg-slate-900 border-slate-800 hover:border-cyan-800/80'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${priorityBadge}`}>
                    {task.priority} Priority
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${statusBadge}`}>
                    {task.status}
                  </span>

                  {isOverdue && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white animate-pulse flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> OVERDUE
                    </span>
                  )}

                  <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Target Deadline: {new Date(task.deadline).toLocaleString()}
                  </span>
                </div>

                <h3 className="font-bold text-slate-100 text-sm">{task.title}</h3>
                <p className="text-slate-300 text-xs leading-relaxed">{task.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-cyan-400" />
                    Unit: <strong className="text-slate-200">{task.assignedTeam}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {task.location}
                  </span>
                  <span>Officer: {task.responsibleUser}</span>
                </div>

                {task.completionNotes && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-[11px] text-emerald-300">
                    <strong>Completion Verification:</strong> {task.completionNotes}
                  </div>
                )}
              </div>

              {/* Status Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {task.status === 'Pending' && (
                  <button
                    onClick={() => handleUpdateStatus(task.id, 'In Progress')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
                  >
                    Start Execution
                  </button>
                )}

                {task.status === 'In Progress' && (
                  <button
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setCompletionNotes('');
                      setShowCompleteModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
                  >
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Task */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-cyan-400" />
                Issue Emergency Operational Task
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Deploy inflatable rescue boats to Gopalpur harbor"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Operational Description</label>
                <textarea
                  rows={2}
                  required
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Detail instructions, equipment to mobilize, safety protocols..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target Hours to Deadline</label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    required
                    value={newTask.deadlineHoursFromNow}
                    onChange={(e) => setNewTask({ ...newTask, deadlineHoursFromNow: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Assigned Response Team</label>
                  <input
                    type="text"
                    required
                    value={newTask.assignedTeam}
                    onChange={(e) => setNewTask({ ...newTask, assignedTeam: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Target Location</label>
                  <input
                    type="text"
                    required
                    value={newTask.location}
                    onChange={(e) => setNewTask({ ...newTask, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Issue Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Complete Task Notes */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Record Task Completion Notes
              </h3>
              <button
                onClick={() => setShowCompleteModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCompleteTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Field Outcome / Completion Notes</label>
                <textarea
                  rows={3}
                  required
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Record summary of execution, personnel deployed, equipment recovered..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
