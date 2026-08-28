import React, { useState } from 'react';
import {
  Bell,
  Search,
  Shield,
  User as UserIcon,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Server,
  LogOut,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { User, UserRole } from '../../types/itsm';

interface HeaderProps {
  currentUser: User;
  onSwitchRole: (role: UserRole) => void;
  onLogout: () => void;
  onSearch: (query: string) => void;
  onOpenCreateTicket: () => void;
  onResetDemo: () => void;
  pendingApprovalsCount: number;
  activeView: string;
  onNavigate: (view: string) => void;
}

const ROLES_LIST: { role: UserRole; label: string; badgeColor: string }[] = [
  { role: 'EMPLOYEE', label: 'Requester / Employee', badgeColor: 'bg-slate-700 text-slate-100' },
  { role: 'SERVICE_DESK', label: 'L1 Service Desk', badgeColor: 'bg-blue-800 text-blue-100' },
  { role: 'L2_ENGINEER', label: 'L2 Infrastructure', badgeColor: 'bg-indigo-800 text-indigo-100' },
  { role: 'L3_SPECIALIST', label: 'L3 Cloud & SecOps', badgeColor: 'bg-purple-800 text-purple-100' },
  { role: 'IT_MANAGER', label: 'IT Operations Manager', badgeColor: 'bg-emerald-800 text-emerald-100' },
  { role: 'CHANGE_MANAGER', label: 'Change Manager (CAB)', badgeColor: 'bg-amber-800 text-amber-100' },
  { role: 'PROBLEM_MANAGER', label: 'Problem Manager (RCA)', badgeColor: 'bg-teal-800 text-teal-100' },
  { role: 'ASSET_MANAGER', label: 'Asset Manager (CMDB)', badgeColor: 'bg-cyan-800 text-cyan-100' },
  { role: 'AUDITOR', label: 'ISO 27001 Auditor', badgeColor: 'bg-rose-800 text-rose-100' },
  { role: 'ADMIN', label: 'System Administrator', badgeColor: 'bg-red-800 text-red-100' },
];

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onSwitchRole,
  onLogout,
  onSearch,
  onOpenCreateTicket,
  onResetDemo,
  pendingApprovalsCount,
  onNavigate,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <header className="bg-[#0B2545] text-white border-b border-[#133E6D] sticky top-0 z-40 shadow-md">
      {/* Top Banner: Organization Branding & Quick Role Simulator */}
      <div className="px-4 py-2 bg-[#06182C] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-slate-200 tracking-wide">
              CSC e-Governance Services India Ltd.
            </span>
          </div>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 font-medium hidden md:inline flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-blue-400 inline" /> National Data Centre (NDC) Active • ISO 27001 Compliant
          </span>
        </div>

        {/* Quick Role Switcher for live demo evaluation */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium text-[11px] hidden lg:inline">
            Role Switcher:
          </span>
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#133E6D] hover:bg-[#1C5494] text-white text-xs border border-white/20 transition-all font-medium"
              title="Switch role to test RBAC and screen permissions"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentUser.role.replace('_', ' ')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1 w-64 bg-white text-slate-800 rounded-lg shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Test Role-Based Access (RBAC)
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {ROLES_LIST.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => {
                        onSwitchRole(item.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        currentUser.role === item.role ? 'bg-blue-50 font-semibold text-blue-900' : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${item.badgeColor}`}>
                        {item.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onResetDemo}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs border border-white/10 transition-colors"
            title="Reset to fresh demo data"
          >
            <RotateCcw className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Reset Seed</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* App Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md border border-amber-300/30">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">CSC ITSM</h1>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-semibold px-2 py-0.5 rounded">
                ENTERPRISE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-normal hidden sm:block">
              IT Service Management Portal • CSC e-Governance Services India Ltd.
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-2 hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Ticket #, Subject, Asset Tag, IP, or KB..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch(e.target.value);
              }}
              className="w-full bg-[#06182C] border border-[#1C5494] focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 outline-none transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </form>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenCreateTicket}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span className="hidden sm:inline">Raise Ticket / Request</span>
            <span className="sm:hidden">Raise</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-lg bg-[#06182C] hover:bg-[#133E6D] text-slate-200 border border-white/10 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {pendingApprovalsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800">System Notifications</span>
                  <span className="text-[10px] text-blue-600 font-medium cursor-pointer">Mark all read</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  <div
                    onClick={() => {
                      onNavigate('approvals');
                      setShowNotifMenu(false);
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex gap-2.5 items-start"
                  >
                    <div className="p-1.5 rounded-full bg-amber-100 text-amber-700 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-medium text-slate-800">Production Access Request Pending</p>
                      <p className="text-slate-500 text-[11px]">Rahul Deshmukh requested DB access for UP State Audit</p>
                      <p className="text-[10px] text-slate-400 mt-1">10 mins ago</p>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      onNavigate('tickets');
                      setShowNotifMenu(false);
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex gap-2.5 items-start"
                  >
                    <div className="p-1.5 rounded-full bg-blue-100 text-blue-700 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-medium text-slate-800">Ticket INC-2026-000101 Assigned</p>
                      <p className="text-slate-500 text-[11px]">Critical disk alert assigned to Infrastructure Team</p>
                      <p className="text-[10px] text-slate-400 mt-1">25 mins ago</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Card */}
          <div className="flex items-center space-x-2.5 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-amber-300 font-bold text-xs border border-amber-400/40">
              {currentUser?.name
                ? currentUser.name
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()
                : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">{currentUser?.name || 'User'}</div>
              <div className="text-[11px] text-slate-300">{currentUser?.departmentName || 'CSC Ops'}</div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 rounded hover:bg-red-500/20 text-slate-300 hover:text-red-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
