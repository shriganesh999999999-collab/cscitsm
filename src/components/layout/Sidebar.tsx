import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  UserCheck,
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
  Plus,
} from 'lucide-react';
import { User } from '../../types/itsm';

export interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  currentUser: User;
  pendingApprovalsCount?: number;
  openTicketsCount?: number;
  onOpenCreateTicket?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  currentUser,
  pendingApprovalsCount = 0,
  openTicketsCount = 0,
  onOpenCreateTicket,
}) => {
  const menuSections = [
    {
      title: 'CORE WORKFLOW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tickets', label: 'All Tickets', icon: Inbox, badge: openTicketsCount },
        { id: 'my-tickets', label: 'My Queue & Assigned', icon: UserCheck },
        { id: 'catalog', label: 'Service Catalog', icon: Layers },
        { id: 'incidents', label: 'Incident Records', icon: Flame },
      ],
    },
    {
      title: 'GOVERNANCE & ASSETS',
      items: [
        { id: 'access-requests', label: 'Production / UAT Access', icon: KeyRound },
        { id: 'changes', label: 'Change Management (CAB)', icon: GitPullRequest },
        { id: 'problems', label: 'Problem Management (RCA)', icon: AlertOctagon },
        { id: 'assets', label: 'Asset Inventory (CMDB)', icon: HardDrive },
        { id: 'kb', label: 'Knowledge Base (SOP)', icon: BookOpen },
        { id: 'approvals', label: 'Approvals Inbox', icon: CheckSquare, badge: pendingApprovalsCount, badgeColor: 'bg-[#ea4335] text-white font-medium' },
      ],
    },
    {
      title: 'ANALYTICS & COMPLIANCE',
      items: [
        { id: 'reports', label: 'SLA & Reports', icon: BarChart3 },
        { id: 'audit-logs', label: 'Audit Logs (ISO 27001)', icon: ShieldCheck },
        { id: 'admin', label: 'Administration', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white text-slate-700 border-r border-slate-200 flex flex-col justify-between shrink-0 select-none py-3">
      <div className="overflow-y-auto flex-1 custom-scrollbar px-2">
        {/* Google-Style Compose Button */}
        {onOpenCreateTicket && (
          <div className="px-2 mb-4">
            <button
              onClick={onOpenCreateTicket}
              className="w-full flex items-center justify-center space-x-2.5 py-3 px-4 rounded-2xl bg-[#c2e7ff] hover:bg-[#b3defa] active:bg-[#a0d2f8] text-[#001d35] font-medium text-sm shadow-xs hover:shadow transition-all group"
            >
              <Plus className="w-5 h-5 text-[#001d35] group-hover:rotate-90 transition-transform duration-200" />
              <span>Create Ticket</span>
            </button>
          </div>
        )}

        {menuSections.map((sec, idx) => (
          <div key={idx} className="mb-5">
            <h3 className="px-4 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
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
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium rounded-full transition-all ${
                      isActive
                        ? 'bg-[#e8f0fe] text-[#1a73e8] font-semibold'
                        : 'text-slate-600 hover:bg-[#f1f3f4] hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1a73e8]' : 'text-slate-500'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          item.badgeColor || 'bg-[#1a73e8] text-white'
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

      {/* Google-Style Sidebar Footer */}
      <div className="px-4 py-3 mx-2 bg-[#f8fafd] rounded-2xl border border-slate-200/80 text-[11px] text-slate-500">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-slate-700">CSCSPV Service</span>
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Operational
          </span>
        </div>
        <p className="text-[10px] text-slate-500 truncate">
          Role: <span className="text-slate-800 font-medium">{currentUser.role.replace(/_/g, ' ')}</span>
        </p>
      </div>
    </aside>
  );
};
