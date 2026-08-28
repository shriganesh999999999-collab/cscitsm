import React, { useState } from 'react';
import {
  Building2,
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Server,
  UserCheck,
} from 'lucide-react';
import { UserRole } from '../../types/itsm';

interface LoginPageProps {
  onLogin: (email: string, password?: string) => Promise<void>;
  onQuickRoleLogin: (role: UserRole) => Promise<void>;
}

const DEMO_PERSONAS: { role: UserRole; name: string; title: string; email: string; color: string }[] = [
  { role: 'EMPLOYEE', name: 'Rahul Deshmukh', title: 'Requester (State Ops)', email: 'rahul.deshmukh@csc.gov.in', color: 'border-slate-300 hover:border-slate-500' },
  { role: 'SERVICE_DESK', name: 'Amit Sharma', title: 'L1 Service Desk Lead', email: 'amit.sharma@csc.gov.in', color: 'border-blue-300 hover:border-blue-500' },
  { role: 'L2_ENGINEER', name: 'Priya Patel', title: 'L2 Infrastructure Eng', email: 'priya.patel@csc.gov.in', color: 'border-indigo-300 hover:border-indigo-500' },
  { role: 'L3_SPECIALIST', name: 'Vikramaditya Singh', title: 'L3 Cloud & SecOps', email: 'vikram.singh@csc.gov.in', color: 'border-purple-300 hover:border-purple-500' },
  { role: 'IT_MANAGER', name: 'Rajesh Kumar', title: 'IT Operations Manager', email: 'rajesh.kumar@csc.gov.in', color: 'border-emerald-300 hover:border-emerald-500' },
  { role: 'CHANGE_MANAGER', name: 'Ananya Sen', title: 'Change Manager (CAB)', email: 'ananya.sen@csc.gov.in', color: 'border-amber-300 hover:border-amber-500' },
  { role: 'PROBLEM_MANAGER', name: 'Suresh Iyer', title: 'Problem Manager (RCA)', email: 'suresh.iyer@csc.gov.in', color: 'border-teal-300 hover:border-teal-500' },
  { role: 'ASSET_MANAGER', name: 'Neha Gupta', title: 'Asset Manager (CMDB)', email: 'neha.gupta@csc.gov.in', color: 'border-cyan-300 hover:border-cyan-500' },
  { role: 'AUDITOR', name: 'Devendra Verma', title: 'ISO 27001 Auditor', email: 'devendra.verma@csc.gov.in', color: 'border-rose-300 hover:border-rose-500' },
  { role: 'ADMIN', name: 'System Admin', title: 'Root Administrator', email: 'admin@csc.gov.in', color: 'border-red-300 hover:border-red-500' },
];

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  onQuickRoleLogin,
}) => {
  const [email, setEmail] = useState('admin@csc.gov.in');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      await onQuickRoleLogin(role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06182C] text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Top Banner */}
      <div className="p-4 border-b border-[#133E6D] bg-[#0B2545] flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white tracking-wide">
            CSC e-Governance Services India Ltd.
          </span>
          <span className="text-slate-400 hidden sm:inline">| Special Purpose Vehicle, Ministry of Electronics & IT (MeitY)</span>
        </div>
        <div className="text-slate-300 flex items-center gap-1.5 text-[11px]">
          <Server className="w-3.5 h-3.5 text-blue-400" />
          <span>National Data Centre (NDC) Gateway</span>
        </div>
      </div>

      {/* Main Login Box */}
      <div className="max-w-4xl mx-auto px-4 py-8 w-full">
        <div className="text-center mb-8 space-y-2">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl border border-amber-300/30">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Enterprise IT Service Management Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Single-sign-on access for incident lifecycle management, SLA governance, and privileged production authorization.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Credentials Login Form */}
          <div className="lg:col-span-5 bg-[#0B2545] p-6 rounded-2xl border border-[#1C5494] shadow-2xl space-y-4">
            <div className="border-b border-[#133E6D] pb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Authorized Sign In</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Use official CSC government credentials</p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Official Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#06182C] border border-[#1C5494] focus:border-amber-400 rounded-lg text-white outline-none font-mono text-xs"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#06182C] border border-[#1C5494] focus:border-amber-400 rounded-lg text-white outline-none text-xs"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In to ITSM Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Persona Evaluation Switcher */}
          <div className="lg:col-span-7 bg-[#0B2545]/60 p-6 rounded-2xl border border-[#1C5494] shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#133E6D] pb-3">
              <div>
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click Persona Simulator</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Select any pre-configured role to inspect RBAC permissions & workflows
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.role}
                  onClick={() => handleQuickLogin(p.role)}
                  className={`p-2.5 rounded-xl bg-[#06182C] hover:bg-[#133E6D] border text-left transition-all group flex items-center justify-between ${p.color}`}
                >
                  <div className="truncate">
                    <p className="font-bold text-white group-hover:text-amber-300 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{p.title}</p>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-bold shrink-0 ml-1">
                    {p.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[#133E6D] bg-[#0B2545] text-center text-[11px] text-slate-400">
        &copy; 2026 CSC e-Governance Services India Ltd. • Ministry of Electronics & Information Technology, Government of India.
      </div>
    </div>
  );
};
