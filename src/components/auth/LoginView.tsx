import React, { useState } from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext.tsx';
import { UserRole } from '../../types/index.ts';
import { ShieldAlert, Lock, Mail, ArrowRight, CheckCircle, ShieldCheck } from 'lucide-react';

interface LoginViewProps {
  onSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@cycloneshield.gov');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectDemoRole = (role: UserRole) => {
    const creds = DEMO_CREDENTIALS[role];
    if (creds) {
      setEmail(creds.email);
      setPassword(creds.pass);
      setError(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-xl shadow-cyan-500/20 mb-2">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">CYCLONESHIELD</h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Intelligent Cyclone Tracking, Impact Prediction, Evacuation Planning & Relief Coordination Platform
          </p>
        </div>

        {/* Login Form Box */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
            Authorized Personnel Sign-In
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Government / Agency Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cycloneshield.gov"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Access Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate to Command Center'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Switcher for Evaluation */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Preset Demonstration Account:
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {(Object.keys(DEMO_CREDENTIALS) as UserRole[]).map((r) => {
                const creds = DEMO_CREDENTIALS[r];
                const isSelected = email === creds.email;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => selectDemoRole(r)}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors border ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-700 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{r}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{creds.email}</div>
                    </div>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          Emergency Command & Decision Support Core • SEC-OPS ENFORCED
        </div>
      </div>
    </div>
  );
};
