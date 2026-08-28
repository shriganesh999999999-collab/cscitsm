import React, { useState } from 'react';
import {
  CheckSquare,
  KeyRound,
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  FileText,
  Smartphone,
  Mail,
  ShieldCheck,
  Building2,
  Users,
  Send,
  Check,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AccessRequest, ChangeRequest, Ticket, User as UserType, AssignmentGroup } from '../../types/itsm';

interface ApprovalsPortalViewProps {
  accessRequests: AccessRequest[];
  changes: ChangeRequest[];
  tickets?: Ticket[];
  groups?: AssignmentGroup[];
  currentUser: UserType;
  onApproveAccess: (id: string, stage: number, comments?: string) => Promise<void>;
  onRejectAccess: (id: string, comments: string) => Promise<void>;
  onApproveTicketStep?: (ticketId: string, roleRequired: string, channelUsed: 'EMAIL' | 'WHATSAPP', comments?: string) => Promise<void>;
  onAssignOpsTeam?: (ticketId: string, assignedGroupId: string, assignedGroup: string, comments?: string) => Promise<void>;
}

export const ApprovalsPortalView: React.FC<ApprovalsPortalViewProps> = ({
  accessRequests = [],
  changes = [],
  tickets = [],
  groups = [],
  currentUser,
  onApproveAccess,
  onRejectAccess,
  onApproveTicketStep,
  onAssignOpsTeam,
}) => {
  const [activeTab, setActiveTab] = useState<'dual_approvals' | 'ops_queue' | 'access' | 'changes'>('dual_approvals');
  const [actionModal, setActionModal] = useState<{ id: string; action: 'approve' | 'reject'; stage: number } | null>(null);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedOpsGroup, setSelectedOpsGroup] = useState<Record<string, string>>({});

  // Filter service requests
  const dualApprovalTickets = (tickets || []).filter(
    (t) => t.status === 'AWAITING_APPROVAL' || t.routingState === 'AWAITING_DUAL_APPROVAL'
  );

  const opsQueueTickets = (tickets || []).filter(
    (t) => t.routingState === 'PENDING_OPS_ASSIGNMENT' || (t.status === 'PENDING_ASSIGNMENT' && t.approvals?.every(a => a.status === 'APPROVED'))
  );

  const pendingAccess = (accessRequests || []).filter((r) => r.status === 'PENDING_APPROVAL');
  const pendingChanges = (changes || []).filter((c) => c.status === 'REQUESTED_CAB' || c.status === 'CAB_APPROVED');

  const handleConfirmAccessAction = async () => {
    if (!actionModal) return;
    setIsSubmitting(true);
    try {
      if (actionModal.action === 'approve') {
        await onApproveAccess(actionModal.id, actionModal.stage, comments);
      } else {
        await onRejectAccess(actionModal.id, comments || 'Rejected by authorized manager');
      }
      setActionModal(null);
      setComments('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveDualStep = async (
    ticketId: string,
    roleRequired: string,
    channelUsed: 'EMAIL' | 'WHATSAPP'
  ) => {
    if (!onApproveTicketStep) return;
    setIsSubmitting(true);
    try {
      await onApproveTicketStep(ticketId, roleRequired, channelUsed, `Approved OK via ${channelUsed}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignToConcernTeam = async (ticketId: string) => {
    const groupId = selectedOpsGroup[ticketId];
    if (!groupId || !onAssignOpsTeam) return;
    const targetGroup = groups.find((g) => g.id === groupId);
    setIsSubmitting(true);
    try {
      await onAssignOpsTeam(ticketId, groupId, targetGroup?.name || 'Concern Team');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#133E6D] text-white p-6 rounded-3xl border border-[#1C5494] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Governance, Multi-Channel Approvals & Routing Hub</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Dual Approval (CISO & Infra Head) & Ops Manager Inbox
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Real-time tracking for WhatsApp/Email authorizations, CISO & Infra Head sign-offs, and Operations Manager team delegation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-xl font-bold text-xs">
            {dualApprovalTickets.length + opsQueueTickets.length + pendingAccess.length} Action Items Pending
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-2xl shadow-xs text-xs font-semibold overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('dual_approvals')}
          className={`py-3.5 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'dual_approvals'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>CISO & Infra Dual Approvals</span>
          {dualApprovalTickets.length > 0 && (
            <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {dualApprovalTickets.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ops_queue')}
          className={`py-3.5 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'ops_queue'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Operations Manager Queue (Approved SRs)</span>
          {opsQueueTickets.length > 0 && (
            <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
              {opsQueueTickets.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('access')}
          className={`py-3.5 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'access'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Privileged Access Requests</span>
          {pendingAccess.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingAccess.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('changes')}
          className={`py-3.5 px-3.5 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'changes'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GitPullRequest className="w-3.5 h-3.5" />
          <span>CAB Change Requests ({pendingChanges.length})</span>
        </button>
      </div>

      {/* Tab 1: Dual Approvals (CISO + Infra Head) */}
      {activeTab === 'dual_approvals' && (
        <div className="space-y-4">
          {dualApprovalTickets.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">No Pending Dual Approvals</h3>
              <p className="text-xs text-slate-500 mt-1">
                All Technology Service Requests (UAT Servers, Access, VPNs) have received required clearances.
              </p>
            </div>
          ) : (
            dualApprovalTickets.map((t) => (
              <div
                key={t.id}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-blue-900 text-xs">{t.ticketNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {t.categoryName || 'Infrastructure'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                          AWAITING CISO + INFRA OK
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{t.subject}</h3>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Created by: <strong>{t.requesterName}</strong>
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed font-mono whitespace-pre-wrap text-[11px]">
                  {t.description}
                </div>

                {/* Approvers Status & Simulation Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {(t.approvals || []).map((step) => (
                    <div
                      key={step.id}
                      className={`p-3.5 rounded-2xl border ${
                        step.status === 'APPROVED'
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{step.approverName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {step.roleRequired} • {step.approverPhone || step.approverEmail}
                          </p>
                        </div>
                        {step.status === 'APPROVED' ? (
                          <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> OK Approved ({step.channelUsed})
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Awaiting Response
                          </span>
                        )}
                      </div>

                      {step.status !== 'APPROVED' && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleApproveDualStep(t.id, step.roleRequired, 'WHATSAPP')}
                            disabled={isSubmitting}
                            className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[10px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Smartphone className="w-3 h-3" />
                            <span>Simulate WhatsApp "OK"</span>
                          </button>
                          <button
                            onClick={() => handleApproveDualStep(t.id, step.roleRequired, 'EMAIL')}
                            disabled={isSubmitting}
                            className="flex-1 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-[10px] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Mail className="w-3 h-3" />
                            <span>Simulate Email "OK"</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Operations Manager Queue */}
      {activeTab === 'ops_queue' && (
        <div className="space-y-4">
          {opsQueueTickets.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">Operations Queue is Clear!</h3>
              <p className="text-xs text-slate-500 mt-1">
                No tickets currently waiting for Operations Manager concern team assignment.
              </p>
            </div>
          ) : (
            opsQueueTickets.map((t) => (
              <div
                key={t.id}
                className="bg-white p-6 rounded-3xl border-2 border-blue-300 shadow-sm space-y-4 text-xs animate-in zoom-in-95"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-blue-900 text-xs">{t.ticketNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                        ✓ CISO & INFRA HEAD OK CLEARED
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{t.subject}</h3>
                  </div>

                  <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                    Operations Manager Action Required
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-slate-700 text-[11px] leading-relaxed">
                  {t.description}
                </div>

                {/* Operations Manager Team Assignment Action Box */}
                <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-700" />
                      <span>Assign Ticket to Technical Concern Team</span>
                    </p>
                    <p className="text-[11px] text-blue-700">
                      Select which operational group will execute the provisioning/access configuration.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={selectedOpsGroup[t.id] || (groups[0]?.id || '')}
                      onChange={(e) =>
                        setSelectedOpsGroup({ ...selectedOpsGroup, [t.id]: e.target.value })
                      }
                      className="p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-blue-600"
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleAssignToConcernTeam(t.id)}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Delegate Team</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Privileged Access */}
      {activeTab === 'access' && (
        <div className="space-y-4">
          {pendingAccess.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">All Clear!</h3>
              <p className="text-xs text-slate-500 mt-1">There are no pending privileged access requests awaiting your review.</p>
            </div>
          ) : (
            pendingAccess.map((req) => (
              <div
                key={req.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-blue-900 text-xs">{req.requestNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-rose-100 text-rose-800">
                          {req.environment}
                        </span>
                        <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.2 rounded font-mono">
                          {req.accessType}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">{req.targetResource}</h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActionModal({ id: req.id, action: 'reject', stage: 1 })}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs border border-rose-200 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setActionModal({ id: req.id, action: 'approve', stage: 1 })}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                    >
                      Approve Request
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">Business Justification:</span>
                  <p className="text-slate-600 mt-1">{req.justification}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: CAB Change Requests */}
      {activeTab === 'changes' && (
        <div className="space-y-4">
          {pendingChanges.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">No Pending CAB Approvals</h3>
              <p className="text-xs text-slate-500 mt-1">All infrastructure and application changes have been reviewed.</p>
            </div>
          ) : (
            pendingChanges.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-blue-900">{c.changeNumber}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                      {c.type} CHANGE
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    {c.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                <p className="text-slate-600">{c.description}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl text-xs animate-in zoom-in-95">
            <h3 className="font-bold text-sm text-slate-900">
              {actionModal.action === 'approve' ? 'Authorize Request' : 'Decline Request'}
            </h3>
            <p className="text-slate-600">Enter comments for the audit log record.</p>
            <textarea
              rows={3}
              placeholder="Authorization notes..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-xl outline-none focus:border-blue-600"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAccessAction}
                disabled={isSubmitting}
                className={`px-4 py-1.5 font-bold rounded-xl text-white ${
                  actionModal.action === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {actionModal.action === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
