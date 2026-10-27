import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Header } from './components/common/Header.tsx';
import { Sidebar } from './components/common/Sidebar.tsx';
import { AIBriefingModal } from './components/common/AIBriefingModal.tsx';
import { LoginView } from './components/auth/LoginView.tsx';

// Module Views
import { OverviewView } from './components/dashboard/OverviewView.tsx';
import { CycloneTrackingView } from './components/cyclones/CycloneTrackingView.tsx';
import { ImpactPredictionView } from './components/impact/ImpactPredictionView.tsx';
import { EvacuationPlanningView } from './components/evacuation/EvacuationPlanningView.tsx';
import { ShelterManagementView } from './components/shelters/ShelterManagementView.tsx';
import { ReliefCoordinationView } from './components/relief/ReliefCoordinationView.tsx';
import { EmergencyAlertsView } from './components/alerts/EmergencyAlertsView.tsx';
import { ResponseTasksView } from './components/tasks/ResponseTasksView.tsx';
import { ReportsView } from './components/reports/ReportsView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';

import { api } from './api/client.ts';
import {
  CycloneEvent,
  Shelter,
  EvacuationPlan,
  ReliefInventoryItem,
  ReliefTransaction,
  ReliefRequest,
  EmergencyAlert,
  ResponseTask,
  DashboardSummary,
  ImpactAssessment,
  AuditLog,
} from './types/index.ts';

function MainApp() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showAIBriefing, setShowAIBriefing] = useState<boolean>(false);

  // Core Data State
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [cyclones, setCyclones] = useState<CycloneEvent[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [evacuationPlans, setEvacuationPlans] = useState<EvacuationPlan[]>([]);
  const [inventory, setInventory] = useState<ReliefInventoryItem[]>([]);
  const [transactions, setTransactions] = useState<ReliefTransaction[]>([]);
  const [requests, setRequests] = useState<ReliefRequest[]>([]);
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [tasks, setTasks] = useState<ResponseTask[]>([]);
  const [assessments, setAssessments] = useState<ImpactAssessment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Unified Data Fetcher
  const loadPlatformData = useCallback(async () => {
    try {
      const [
        sumRes,
        actRes,
        cycRes,
        shlRes,
        evacRes,
        invRes,
        txRes,
        reqRes,
        altRes,
        tskRes,
        impRes,
        auditRes,
      ] = await Promise.all([
        api.getDashboardSummary().catch(() => null),
        api.getDashboardActivity().catch(() => ({ activities: [] })),
        api.getCyclones().catch(() => ({ cyclones: [] })),
        api.getShelters().catch(() => ({ shelters: [] })),
        api.getEvacuationPlans().catch(() => ({ plans: [] })),
        api.getReliefInventory().catch(() => ({ inventory: [] })),
        api.getReliefTransactions().catch(() => ({ transactions: [] })),
        api.getReliefRequests().catch(() => ({ requests: [] })),
        api.getAlerts().catch(() => ({ alerts: [] })),
        api.getTasks().catch(() => ({ tasks: [] })),
        api.getImpactAssessments().catch(() => ({ assessments: [] })),
        api.getAuditLogs().catch(() => ({ logs: [] })),
      ]);

      if (sumRes) setSummary(sumRes);
      if (actRes) setActivities(actRes.activities);
      if (cycRes) setCyclones(cycRes.cyclones);
      if (shlRes) setShelters(shlRes.shelters);
      if (evacRes) setEvacuationPlans(evacRes.plans);
      if (invRes) setInventory(invRes.inventory);
      if (txRes) setTransactions(txRes.transactions);
      if (reqRes) setRequests(reqRes.requests);
      if (altRes) setAlerts(altRes.alerts);
      if (tskRes) setTasks(tskRes.tasks);
      if (impRes) setAssessments(impRes.assessments);
      if (auditRes) setAuditLogs(auditRes.logs);
    } catch (err) {
      console.warn('Data sync warning:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadPlatformData();
    }
  }, [isAuthenticated, loadPlatformData]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-cyan-400 font-mono">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xs tracking-wider uppercase">Loading CycloneShield Command Center...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView onSuccess={loadPlatformData} />;
  }

  const activeAlertsCount = alerts.filter((a) => a.status === 'Active').length;
  const shortagesCount = inventory.filter((i) => i.status !== 'Adequate').length;
  const pendingRequestsCount = requests.filter(
    (r) => r.status === 'Submitted' || r.status === 'Under Review'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Command Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dataSourceMode={summary?.dataSourceMode || 'Demonstration Store'}
        dataSourceConnected={summary?.dataSourceConnected || false}
        alerts={alerts}
      />

      <div className="flex flex-1">
        {/* Persistent Module Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeAlertsCount={activeAlertsCount}
          shortagesCount={shortagesCount}
          pendingRequestsCount={pendingRequestsCount}
          onOpenAIBriefing={() => setShowAIBriefing(true)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
          {activeTab === 'overview' && (
            <OverviewView
              summary={summary}
              cyclones={cyclones}
              shelters={shelters}
              plans={evacuationPlans}
              inventory={inventory}
              activities={activities}
              setActiveTab={setActiveTab}
              onOpenAIBriefing={() => setShowAIBriefing(true)}
            />
          )}

          {activeTab === 'cyclones' && (
            <CycloneTrackingView
              cyclones={cyclones}
              onRefresh={loadPlatformData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'impact' && (
            <ImpactPredictionView
              cyclones={cyclones}
              assessments={assessments}
              onRefreshAssessments={loadPlatformData}
              setActiveTab={setActiveTab}
              onOpenAIBriefing={() => setShowAIBriefing(true)}
            />
          )}

          {activeTab === 'evacuation' && (
            <EvacuationPlanningView
              cyclones={cyclones}
              shelters={shelters}
              plans={evacuationPlans}
              onRefreshPlans={loadPlatformData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'shelters' && (
            <ShelterManagementView
              shelters={shelters}
              onRefreshShelters={loadPlatformData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'relief' && (
            <ReliefCoordinationView
              inventory={inventory}
              transactions={transactions}
              requests={requests}
              onRefreshRelief={loadPlatformData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'tasks' && (
            <ResponseTasksView
              tasks={tasks}
              onRefreshTasks={loadPlatformData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'alerts' && (
            <EmergencyAlertsView
              alerts={alerts}
              onRefreshAlerts={loadPlatformData}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              cyclones={cyclones}
              shelters={shelters}
              plans={evacuationPlans}
              inventory={inventory}
              transactions={transactions}
              alerts={alerts}
              tasks={tasks}
              assessments={assessments}
              dataSourceMode={summary?.dataSourceMode || 'Demonstration Store'}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              auditLogs={auditLogs}
              dataSourceMode={summary?.dataSourceMode || 'Demonstration Store'}
              dataSourceConnected={summary?.dataSourceConnected || false}
              onRefreshLogs={loadPlatformData}
            />
          )}
        </main>
      </div>

      {/* AI Disaster Operations Briefing Modal */}
      <AIBriefingModal
        isOpen={showAIBriefing}
        onClose={() => setShowAIBriefing(false)}
        activeCycloneName={cyclones[0]?.name}
        activeCycloneId={cyclones[0]?.id}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
