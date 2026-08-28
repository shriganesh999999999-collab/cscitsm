import React, { useState } from 'react';
import {
  Bell,
  Search,
  Shield,
  ChevronDown,
  RotateCcw,
  Plus,
  Server,
  LogOut,
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
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
  { role: 'EMPLOYEE', label: 'Requester / Employee', badgeColor: 'bg-slate-100 text-slate-700 border-slate-200' },
  { role: 'SERVICE_DESK', label: 'L1 Service Desk', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
  { role: 'L2_ENGINEER', label: 'L2 Infrastructure', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { role: 'L3_SPECIALIST', label: 'L3 Cloud & SecOps', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
  { role: 'IT_MANAGER', label: 'IT Operations Manager', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { role: 'CHANGE_MANAGER', label: 'Change Manager (CAB)', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
  { role: 'PROBLEM_MANAGER', label: 'Problem Manager (RCA)', badgeColor: 'bg-teal-50 text-teal-700 border-teal-200' },
  { role: 'ASSET_MANAGER', label: 'Asset Manager (CMDB)', badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { role: 'AUDITOR', label: 'ISO 27001 Auditor', badgeColor: 'bg-rose-50 text-rose-700 border-rose-200' },
  { role: 'ADMIN', label: 'System Administrator', badgeColor: 'bg-red-50 text-red-700 border-red-200' },
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <header className="bg-white text-slate-800 border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Banner: Google-style Subtle Status & RBAC Switcher */}
      <div className="px-4 lg:px-6 py-1.5 bg-[#f8fafd] border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3 text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#1e8e3e]" />
            <span className="font-semibold text-slate-800 tracking-tight">
              CSCSPV
            </span>
          </div>
          <span className="text-slate-300 hidden sm:inline">|</span>
          <span className="text-slate-600 font-normal hidden md:inline-flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-[#1a73e8] inline" /> CSCSPV Active • ISO 27001 Compliant
          </span>
        </div>

        {/* Quick Role Switcher for RBAC evaluation */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium text-[11px] hidden lg:inline">
            Active Role:
          </span>
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs border border-slate-300 transition-all font-medium shadow-2xs"
              title="Switch role to test RBAC and permissions"
            >
              <Shield className="w-3.5 h-3.5 text-[#1a73e8]" />
              <span>{currentUser.role.replace(/_/g, ' ')}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                <div className="px-4 py-2 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Select Role (RBAC Simulator)
                </div>
                <div className="max-h-72 overflow-y-auto py-1">
                  {ROLES_LIST.map((item) => (
                    <button
                      key={item.role}
                      onClick={() => {
                        onSwitchRole(item.role);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                        currentUser.role === item.role ? 'bg-blue-50 font-semibold text-[#1a73e8]' : 'text-slate-700'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${item.badgeColor}`}>
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
            className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-600 text-xs border border-slate-300 transition-colors shadow-2xs"
            title="Reset to fresh demo data"
          >
            <RotateCcw className="w-3 h-3 text-[#1e8e3e]" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>
      </div>

      {/* Main Google-Style Header Bar */}
      <div className="px-4 lg:px-6 py-2.5 flex items-center justify-between gap-4">
        {/* App Title & Google-style Logo */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] border border-blue-100 flex items-center justify-center shadow-2xs">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L4 9V21H20V9L12 3Z" fill="#1a73e8" fillOpacity="0.15" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 21V12H15V21" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-medium text-slate-900 tracking-tight font-sans">
                CSCSPV
              </span>
              <span className="text-xs text-slate-500 font-normal hidden sm:inline">
                Service Portal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal hidden lg:block">
              Support, Incidents & Enterprise Services
            </p>
          </div>
        </div>

        {/* Google-Style Pill Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl mx-4 hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tickets, assets, changes, knowledge base..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch(e.target.value);
              }}
              className="w-full bg-[#f1f3f4] hover:bg-[#e8eaed] focus:bg-white focus:shadow-md focus:ring-1 focus:ring-[#1a73e8] border border-transparent focus:border-slate-300 rounded-full pl-11 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </form>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onOpenCreateTicket}
            className="flex items-center space-x-1.5 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] text-white font-medium text-xs sm:text-sm rounded-full shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">New Request</span>
            <span className="sm:hidden">New</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {pendingApprovalsCount > 0 && (
                <span className="absolute 1 top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#d93025] text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800">Notifications</span>
                  <span className="text-[11px] text-[#1a73e8] font-medium cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  <div
                    onClick={() => {
                      onNavigate('approvals');
                      setShowNotifMenu(false);
                    }}
                    className="p-3 hover:bg-slate-50 cursor-pointer transition-colors flex gap-2.5 items-start"
                  >
                    <div className="p-1.5 rounded-full bg-amber-50 text-[#f9ab00] border border-amber-200 mt-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-medium text-slate-800">Production Access Request Pending</p>
                      <p className="text-slate-500 text-[11px]">Rahul Deshmukh requested DB access for State Audit</p>
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
                    <div className="p-1.5 rounded-full bg-blue-50 text-[#1a73e8] border border-blue-200 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <p className="font-medium text-slate-800">Ticket INC-2026-000101 Assigned</p>
                      <p className="text-slate-500 text-[11px]">Server disk alert assigned to Infrastructure Team</p>
                      <p className="text-[10px] text-slate-400 mt-1">25 mins ago</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Google-Style User Profile Circle */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white font-medium text-xs flex items-center justify-center ring-2 ring-blue-50 shadow-2xs">
                {userInitials}
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in">
                <div className="px-4 pb-3 border-b border-slate-100 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#1a73e8] text-white font-semibold text-sm flex items-center justify-center mx-auto mb-2 shadow-xs">
                    {userInitials}
                  </div>
                  <div className="font-semibold text-sm text-slate-800">{currentUser?.name || 'User'}</div>
                  <div className="text-xs text-slate-500">{currentUser?.email}</div>
                  <div className="mt-1 text-[11px] inline-block px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                    {currentUser?.role?.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="pt-2 px-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
