import React, { useState } from 'react';
import {
  Settings,
  Users,
  Layers,
  Clock,
  Shield,
  Bell,
  RotateCcw,
  Plus,
  CheckCircle2,
  Lock,
  Mail,
  Smartphone,
  Server,
  X,
} from 'lucide-react';
import { User, UserRole } from '../../types/itsm';

interface AdminPortalViewProps {
  users: User[];
  currentUser: User;
  onResetDemo: () => Promise<void>;
  onCreateUser: (data: any) => Promise<void>;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  users,
  currentUser,
  onResetDemo,
  onCreateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'sla' | 'matrix' | 'notifications' | 'reset'>('users');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('SERVICE_DESK');
  const [newDepartment, setNewDepartment] = useState('Central Service Desk');
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    setIsSubmittingUser(true);
    try {
      await onCreateUser({
        name: newName,
        email: newEmail,
        role: newRole,
        departmentName: newDepartment,
      });
      setShowAddUserModal(false);
      setNewName('');
      setNewEmail('');
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleExecuteReset = async () => {
    setIsResetting(true);
    try {
      await onResetDemo();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } finally {
      setIsResetting(false);
    }
  };

  const slaPolicies = [
    { priority: 'CRITICAL (P1)', response: '15 Minutes', resolution: '2 Hours', escalation: 'Auto-escalate to L3 after 30 mins' },
    { priority: 'HIGH (P2)', response: '30 Minutes', resolution: '4 Hours', escalation: 'Auto-escalate to L2 after 60 mins' },
    { priority: 'MEDIUM (P3)', response: '60 Minutes', resolution: '8 Hours', escalation: 'Auto-escalate to L2 after 4 hours' },
    { priority: 'LOW (P4)', response: '120 Minutes', resolution: '24 Hours', escalation: 'Queue audit after 12 hours' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#133E6D] text-white p-6 rounded-2xl border border-[#1C5494] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Master System Administration</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            ITSM Configuration, RBAC & Policy Rules
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Configure User Roles, Dynamic Priority Calculation Matrices, SLA Targets, and Automated Notification Gateways.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'users' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Users & RBAC ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('sla')}
          className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'sla' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>SLA Targets</span>
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'matrix' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Priority Matrix</span>
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'notifications' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notification Gateways</span>
        </button>
        <button
          onClick={() => setActiveTab('reset')}
          className={`py-3 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'reset' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Reset Demo Seed</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="space-y-4">
        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">User Accounts & Access Control (RBAC)</h3>
                <p className="text-[11px] text-slate-500">10 distinct enterprise roles configured across departments</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Staff Member
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase">
                    <th className="py-2.5 px-4">User</th>
                    <th className="py-2.5 px-4">Email</th>
                    <th className="py-2.5 px-4">Role</th>
                    <th className="py-2.5 px-4">Department</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(users || []).map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">{u.name}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{u.departmentName || 'CSC Ops'}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          ACTIVE
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SLA TARGETS TAB */}
        {activeTab === 'sla' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-slate-900">SLA Response & Resolution Targets</h3>
              <p className="text-[11px] text-slate-500">Government service delivery benchmark guidelines</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase">
                    <th className="py-2.5 px-4">Priority Level</th>
                    <th className="py-2.5 px-4">Max Response Time</th>
                    <th className="py-2.5 px-4">Max Resolution Target</th>
                    <th className="py-2.5 px-4">Automated Escalation Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {slaPolicies.map((pol, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{pol.priority}</td>
                      <td className="py-3 px-4 font-semibold text-blue-700">{pol.response}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{pol.resolution}</td>
                      <td className="py-3 px-4 text-slate-600">{pol.escalation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MATRIX TAB */}
        {activeTab === 'matrix' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-slate-900">Impact &times; Urgency Calculation Matrix</h3>
              <p className="text-[11px] text-slate-500">Determines ticket priority upon creation</p>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">Impact \ Urgency</div>
              <div className="p-2 bg-rose-100 text-rose-800 rounded-lg">Critical Urgency</div>
              <div className="p-2 bg-orange-100 text-orange-800 rounded-lg">High Urgency</div>
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">Medium Urgency</div>
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">Low Urgency</div>

              <div className="p-2 bg-rose-100 text-rose-800 rounded-lg text-left">Critical Impact</div>
              <div className="p-2 bg-rose-600 text-white rounded-lg font-bold">P1 (Critical)</div>
              <div className="p-2 bg-orange-500 text-white rounded-lg font-bold">P2 (High)</div>
              <div className="p-2 bg-orange-500 text-white rounded-lg font-bold">P2 (High)</div>
              <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold">P3 (Medium)</div>

              <div className="p-2 bg-orange-100 text-orange-800 rounded-lg text-left">High Impact</div>
              <div className="p-2 bg-orange-500 text-white rounded-lg font-bold">P2 (High)</div>
              <div className="p-2 bg-orange-500 text-white rounded-lg font-bold">P2 (High)</div>
              <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold">P3 (Medium)</div>
              <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold">P3 (Medium)</div>

              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg text-left">Medium Impact</div>
              <div className="p-2 bg-orange-500 text-white rounded-lg font-bold">P2 (High)</div>
              <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold">P3 (Medium)</div>
              <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold">P3 (Medium)</div>
              <div className="p-2 bg-emerald-600 text-white rounded-lg font-bold">P4 (Low)</div>

              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg text-left">Low Impact</div>
              <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold">P3 (Medium)</div>
              <div className="p-2 bg-amber-500 text-slate-950 rounded-lg font-bold">P3 (Medium)</div>
              <div className="p-2 bg-emerald-600 text-white rounded-lg font-bold">P4 (Low)</div>
              <div className="p-2 bg-emerald-600 text-white rounded-lg font-bold">P4 (Low)</div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>SMTP Email Template Config</span>
              </div>
              <p className="text-[11px] text-slate-500">Variables available: {'{{ticket_number}}, {{subject}}, {{requester_name}}, {{sla_target}}'}</p>
              <textarea
                rows={4}
                readOnly
                value="Dear {{requester_name}},\n\nYour CSC ITSM Ticket #{{ticket_number}} regarding '{{subject}}' has been logged. Expected resolution within {{sla_target}}.\n\nCSC e-Governance IT Service Desk"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
              />
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">SMTP GATEWAY: ACTIVE (relay.csc.gov.in)</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 font-bold text-slate-900">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Notification Gateway</span>
              </div>
              <p className="text-[11px] text-slate-500">Variables available: {'{{ticket_number}}, {{status}}, {{tech_name}}'}</p>
              <textarea
                rows={4}
                readOnly
                value="*CSC ITSM Update*: Ticket {{ticket_number}} status is now {{status}}. Assigned Engineer: {{tech_name}}."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
              />
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">WHATSAPP CLOUD API: CONNECTED</span>
            </div>
          </div>
        )}

        {/* RESET TAB */}
        {activeTab === 'reset' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Demo Data Management</h3>
            <p className="text-slate-600 leading-relaxed max-w-xl">
              Reset the in-memory repository to freshly seeded enterprise data (tickets across all priorities,
              10 preconfigured user personas, access requests, CAB changes, problem records, and CMDB assets).
            </p>

            {resetSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Demo database has been successfully reset!</span>
              </div>
            )}

            <div>
              <button
                onClick={handleExecuteReset}
                disabled={isResetting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                <span>{isResetting ? 'Resetting Repository...' : 'Reset to Default Seed Data'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95">
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Add IT Staff / Employee</h3>
              <button onClick={() => setShowAddUserModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-5 space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Singh"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="vikram@csc.gov.in"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Assigned Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                >
                  <option value="SERVICE_DESK">SERVICE_DESK (L1 Support)</option>
                  <option value="L2_ENGINEER">L2_ENGINEER (Infrastructure)</option>
                  <option value="L3_SPECIALIST">L3_SPECIALIST (Cloud & SecOps)</option>
                  <option value="IT_MANAGER">IT_MANAGER (Operations Lead)</option>
                  <option value="EMPLOYEE">EMPLOYEE (General Requester)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Department</label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-4 py-1.5 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800"
                >
                  {isSubmittingUser ? 'Saving...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
