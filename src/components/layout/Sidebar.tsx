import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  UserCheck,
  LifeBuoy,
  Flame,
  KeyRound,
  GitPullRequest,
  AlertOctagon,
  HardDrive,
  BookOpen,
  CheckSquare,
  BarChart3,
  Settings,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { User } from '../../types/itsm';

export interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  currentUser: User;
  pendingApprovalsCount?: number;
  openTicketsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  currentUser,
  pendingApprovalsCount = 0,
  openTicketsCount = 0,
}) => {
  const isEmployee = currentUser.role === 'EMPLOYEE';
  const isAuditor = currentUser.role === 'AUDITOR';
  const isAdmin = currentUser.role === 'ADMIN';

  const menuSections = [
    {
      title: 'CORE WORKFLOW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tickets', label: 'All Tickets', icon: Inbox, badge: openTicketsCount },
        { id: 'my-tickets', label: 'My Queue & Tickets', icon: UserCheck },
        { id: 'catalog', label: 'Service Catalog', icon: Layers },
        { id: 'incidents', label: 'Incident Records', icon: Flame },
      ],
    },
    {
      title: 'ENTERPRISE GOVERNANCE',
      items: [
        { id: 'access-requests', label: 'Production / UAT Access', icon: KeyRound },
        { id: 'changes', label: 'Change Management (CAB)', icon: GitPullRequest },
        { id: 'problems', label: 'Problem Management (RCA)', icon: AlertOctagon },
        { id: 'assets', label: 'Asset Inventory (CMDB)', icon: HardDrive },
        { id: 'kb', label: 'Knowledge Base (SOP)', icon: BookOpen },
        { id: 'approvals', label: 'Approvals Inbox', icon: CheckSquare, badge: pendingApprovalsCount, badgeColor: 'bg-amber-500 text-slate-950 font-bold' },
      ],
    },
    {
      title: 'ANALYTICS & COMPLIANCE',
      items: [
        { id: 'reports', label: 'SLA & Reports', icon: BarChart3 },
        { id: 'audit-logs', label: 'Audit Logs (ISO 27001)', icon: ShieldCheck },
        { id: 'admin', label: 'Administration Portal', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#06182C] text-slate-300 border-r border-[#133E6D] flex flex-col justify-between shrink-0 select-none">
      <div className="py-4 overflow-y-auto flex-1 custom-scrollbar">
        {menuSections.map((sec, idx) => (
          <div key={idx} className="mb-6 px-3">
            <h3 className="px-3 mb-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              {sec.title}
            </h3>
            <div className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-700 to-blue-800 text-white shadow-sm font-semibold'
                        : 'text-slate-300 hover:bg-[#0B2545] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                          item.badgeColor || 'bg-[#1C5494] text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer: System Status */}
      <div className="p-3 bg-[#04101E] border-t border-[#133E6D] text-[11px] text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-300">CSC ITSM Engine</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            v1.0 Ready
          </span>
        </div>
        <p className="text-[10px] text-slate-400">
          User Role: <span className="text-amber-400 font-semibold">{currentUser.role}</span>
        </p>
      </div>
    </aside>
  );
};
