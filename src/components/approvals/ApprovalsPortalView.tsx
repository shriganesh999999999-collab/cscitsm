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
} from 'lucide-react';
import { AccessRequest, ChangeRequest, User as UserType } from '../../types/itsm';

interface ApprovalsPortalViewProps {
  accessRequests: AccessRequest[];
  changes: ChangeRequest[];
  currentUser: UserType;
  onApproveAccess: (id: string, stage: number, comments?: string) => Promise<void>;
  onRejectAccess: (id: string, comments: string) => Promise<void>;
}

export const ApprovalsPortalView: React.FC<ApprovalsPortalViewProps> = ({
  accessRequests,
  changes,
  currentUser,
  onApproveAccess,
  onRejectAccess,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [actionModal, setActionModal] = useState<{ id: string; action: 'approve' | 'reject'; stage: number } | null>(null);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingAccess = (accessRequests || []).filter((r) => r.status === 'PENDING_APPROVAL');
  const pastAccess = (accessRequests || []).filter((r) => r.status !== 'PENDING_APPROVAL');

  const handleConfirmAction = async () => {
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

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#133E6D] text-white p-6 rounded-2xl border border-[#1C5494] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Governance & Authorization Hub</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Unified Management Approvals Inbox
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Single inbox for authorizing Production Access, CAB Change Requests, and High-Impact provisioning.
          </p>
        </div>
        <div className="bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3.5 py-1.5 rounded-xl font-bold text-xs">
          {pendingAccess.length} Action Items Pending
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl shadow-xs text-xs font-semibold">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Pending Action Required</span>
          {pendingAccess.length > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {pendingAccess.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-4 border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Approval Audit History ({pastAccess.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'pending' ? (
          pendingAccess.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">All Clear!</h3>
              <p className="text-xs text-slate-500 mt-1">There are no pending authorization requests awaiting your review.</p>
            </div>
          ) : (
            pendingAccess.map((req) => (
              <div
                key={req.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4"
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
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-xs border border-rose-200"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => setActionModal({ id: req.id, action: 'approve', stage: 1 })}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs"
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
          )
        ) : (
          pastAccess.map((req) => (
            <div key={req.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-mono font-bold text-blue-900">{req.requestNumber}</span>
                <h4 className="font-bold text-slate-800 mt-0.5">{req.targetResource}</h4>
                <p className="text-[11px] text-slate-500">Requester: {req.requesterName}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {req.status}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl text-xs animate-in zoom-in-95">
            <h3 className="font-bold text-sm text-slate-900">
              {actionModal.action === 'approve' ? 'Authorize Request' : 'Decline Request'}
            </h3>
            <p className="text-slate-600">
              Enter comments for the audit log record.
            </p>
            <textarea
              rows={3}
              placeholder="Authorization notes..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActionModal(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isSubmitting}
                className={`px-4 py-1.5 font-bold rounded-lg text-white ${
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
