import {
  CycloneEvent,
  Shelter,
  ImpactAssessment,
  EvacuationPlan,
  ReliefInventoryItem,
  ReliefTransaction,
  ReliefRequest,
  EmergencyAlert,
  ResponseTask,
  DashboardSummary,
  AuditLog,
  User,
} from '../types/index.ts';

const TOKEN_KEY = 'cycloneshield_auth_token';
const USER_KEY = 'cycloneshield_auth_user';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAuth(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.error || `Command request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export const api = {
  // Auth
  login: async (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  logout: async () =>
    request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
  getCurrentUser: async () => request<{ user: User }>('/api/auth/me'),

  // Dashboard
  getDashboardSummary: async () => request<DashboardSummary>('/api/dashboard/summary'),
  getDashboardActivity: async () =>
    request<{ activities: any[] }>('/api/dashboard/activity'),

  // Cyclones
  getCyclones: async () => request<{ cyclones: CycloneEvent[] }>('/api/cyclones'),
  getCyclone: async (id: string) => request<{ cyclone: CycloneEvent }>(`/api/cyclones/${id}`),
  createCyclone: async (data: Partial<CycloneEvent>) =>
    request<{ cyclone: CycloneEvent }>('/api/cyclones', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCyclone: async (id: string, data: Partial<CycloneEvent>) =>
    request<{ cyclone: CycloneEvent }>(`/api/cyclones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCyclone: async (id: string) =>
    request<{ success: boolean; removedId: string }>(`/api/cyclones/${id}`, {
      method: 'DELETE',
    }),
  fetchLiveMeteorology: async () =>
    request<{ success: boolean; liveAdapter: any }>('/api/cyclones/fetch-live'),

  // Impact
  runImpactAssessment: async (params: {
    cycloneId: string;
    timeHorizonHours?: number;
    stormSurgeHeightMeters?: number;
    rainfallBufferHours?: number;
  }) =>
    request<{ assessment: ImpactAssessment }>('/api/impact/assess', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  getImpactAssessments: async () =>
    request<{ assessments: ImpactAssessment[] }>('/api/impact/assessments'),
  getImpactAssessment: async (id: string) =>
    request<{ assessment: ImpactAssessment }>(`/api/impact/assessments/${id}`),

  // Shelters
  getShelters: async (params?: { district?: string; status?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.district) q.set('district', params.district);
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    const url = `/api/shelters${q.toString() ? '?' + q.toString() : ''}`;
    return request<{ shelters: Shelter[] }>(url);
  },
  getShelter: async (id: string) => request<{ shelter: Shelter }>(`/api/shelters/${id}`),
  createShelter: async (data: Partial<Shelter>) =>
    request<{ shelter: Shelter }>('/api/shelters', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateShelter: async (id: string, data: Partial<Shelter>) =>
    request<{ shelter: Shelter }>(`/api/shelters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Evacuation Plans
  getEvacuationPlans: async () =>
    request<{ plans: EvacuationPlan[] }>('/api/evacuation/plans'),
  generateEvacuationProposal: async (params: {
    cycloneId: string;
    regionName: string;
    district: string;
    targetPopulation: number;
  }) =>
    request<{ plan: EvacuationPlan }>('/api/evacuation/generate-proposal', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
  saveEvacuationPlan: async (plan: Partial<EvacuationPlan>) =>
    request<{ plan: EvacuationPlan }>('/api/evacuation/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    }),
  confirmEvacuationPlan: async (id: string) =>
    request<{ success: boolean; plan: EvacuationPlan }>(`/api/evacuation/plans/${id}/confirm`, {
      method: 'POST',
    }),

  // Relief
  getReliefInventory: async () =>
    request<{ inventory: ReliefInventoryItem[] }>('/api/relief/inventory'),
  addReliefInventory: async (data: Partial<ReliefInventoryItem>) =>
    request<{ item: ReliefInventoryItem }>('/api/relief/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateReliefInventory: async (id: string, data: Partial<ReliefInventoryItem>) =>
    request<{ item: ReliefInventoryItem }>(`/api/relief/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  distributeRelief: async (data: {
    itemId: string;
    quantity: number;
    recipientArea: string;
    notes?: string;
  }) =>
    request<{ success: boolean; transaction: ReliefTransaction; updatedItem: ReliefInventoryItem }>(
      '/api/relief/distributions',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),
  getReliefTransactions: async () =>
    request<{ transactions: ReliefTransaction[] }>('/api/relief/transactions'),
  getReliefRequests: async () =>
    request<{ requests: ReliefRequest[] }>('/api/relief/requests'),
  createReliefRequest: async (data: Partial<ReliefRequest>) =>
    request<{ request: ReliefRequest }>('/api/relief/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateReliefRequest: async (id: string, data: Partial<ReliefRequest>) =>
    request<{ request: ReliefRequest }>(`/api/relief/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Alerts
  getAlerts: async () => request<{ alerts: EmergencyAlert[] }>('/api/alerts'),
  createAlert: async (data: Partial<EmergencyAlert>) =>
    request<{ alert: EmergencyAlert }>('/api/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  acknowledgeAlert: async (id: string) =>
    request<{ success: boolean; count: number }>(`/api/alerts/${id}/acknowledge`, {
      method: 'POST',
    }),
  updateAlert: async (id: string, data: Partial<EmergencyAlert>) =>
    request<{ alert: EmergencyAlert }>(`/api/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Tasks
  getTasks: async () => request<{ tasks: ResponseTask[] }>('/api/tasks'),
  createTask: async (data: Partial<ResponseTask>) =>
    request<{ task: ResponseTask }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTask: async (id: string, data: Partial<ResponseTask>) =>
    request<{ task: ResponseTask }>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // AI Briefing
  generateAIBriefing: async (cycloneId?: string) =>
    request<{ briefing: any }>('/api/ai/disaster-briefing', {
      method: 'POST',
      body: JSON.stringify({ cycloneId }),
    }),

  // Reports
  getEvacuationReport: async () => request<any>('/api/reports/evacuation'),
  getReliefReport: async () => request<any>('/api/reports/relief'),
  getImpactReport: async () => request<any>('/api/reports/impact'),

  // System
  getSystemStatus: async () => request<any>('/api/system/status'),
  getAuditLogs: async () => request<{ logs: AuditLog[] }>('/api/system/audit-logs'),
};
