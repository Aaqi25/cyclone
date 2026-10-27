import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { api, getStoredToken, getStoredUser, setStoredAuth, clearStoredAuth } from '../api/client.ts';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => Promise<void>;
  canManageCyclones: boolean;
  canManageShelters: boolean;
  canManageRelief: boolean;
  canManageTasks: boolean;
  canManageAlerts: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Quick credentials map for testing and demonstration
export const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string; label: string }> = {
  Administrator: {
    email: 'admin@cycloneshield.gov',
    pass: 'admin123',
    label: 'Dr. Rajeshwar Sharma (Administrator)',
  },
  'Disaster Management Officer': {
    email: 'dmo@cycloneshield.gov',
    pass: 'dmo123',
    label: 'Sunita Mohapatra (Disaster Management Officer)',
  },
  'Evacuation Coordinator': {
    email: 'evac@cycloneshield.gov',
    pass: 'evac123',
    label: 'Capt. Vikram Rathore (Evacuation Coordinator)',
  },
  'Relief Coordinator': {
    email: 'relief@cycloneshield.gov',
    pass: 'relief123',
    label: 'Ananya Sen (Relief Coordinator)',
  },
  'Read-Only Viewer': {
    email: 'viewer@cycloneshield.gov',
    pass: 'viewer123',
    label: 'Rohan Mehra (Read-Only Viewer)',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // If no session exists on initial load, auto-initialize with Administrator for smooth demo experience
    const init = async () => {
      const stored = getStoredToken();
      if (!stored) {
        try {
          const creds = DEMO_CREDENTIALS['Administrator'];
          const res = await api.login(creds.email, creds.pass);
          setStoredAuth(res.token, res.user);
          setToken(res.token);
          setUser(res.user);
        } catch (e) {
          console.warn('Auto-login initialization fallback:', e);
        }
      } else {
        try {
          const res = await api.getCurrentUser();
          setUser(res.user);
        } catch {
          // If token expired, re-login as default
          try {
            const creds = DEMO_CREDENTIALS['Administrator'];
            const res = await api.login(creds.email, creds.pass);
            setStoredAuth(res.token, res.user);
            setToken(res.token);
            setUser(res.user);
          } catch {}
        }
      }
      setIsLoading(false);
    };

    init();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setStoredAuth(res.token, res.user);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    clearStoredAuth();
    setToken(null);
    setUser(null);
  };

  const switchDemoRole = async (role: UserRole) => {
    const creds = DEMO_CREDENTIALS[role];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  const role = user?.role;
  const isAdmin = role === 'Administrator';
  const canManageCyclones = isAdmin || role === 'Disaster Management Officer';
  const canManageShelters = isAdmin || role === 'Evacuation Coordinator';
  const canManageRelief = isAdmin || role === 'Relief Coordinator';
  const canManageAlerts = isAdmin || role === 'Disaster Management Officer';
  const canManageTasks = isAdmin || role === 'Disaster Management Officer' || role === 'Evacuation Coordinator';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        switchDemoRole,
        canManageCyclones,
        canManageShelters,
        canManageRelief,
        canManageTasks,
        canManageAlerts,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
