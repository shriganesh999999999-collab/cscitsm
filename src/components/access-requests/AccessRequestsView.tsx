import React, { useState } from 'react';
import {
  KeyRound,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Server,
  User,
  Calendar,
  X,
} from 'lucide-react';
import { AccessRequest, User as UserType } from '../../types/itsm';

interface AccessRequestsViewProps {
  accessRequests: AccessRequest[];
  currentUser: UserType;
  onCreateAccessRequest: (data: any) => Promise<void>;
  onApproveRequest: (id: string, stageNumber: number, comments?: string) => Promise<void>;
  onRejectRequest: (id: string, comments: string) => Promise<void>;
}

export const AccessRequestsView: React.FC<AccessRequestsViewProps> = ({
  accessRequests,
  currentUser,
  onCreateAccessRequest,
  onApproveRequest,
  onRejectRequest,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState<{ id: string; action: 'approve' | 'reject'; stage: number } | null>(null);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Request Form State
  const [environment, setEnvironment] = useState<'PRODUCTION' | 'UAT' | 'DR' | 'STAGING'>('PRODUCTION');
  const [accessType, setAccessType] = useState<string>('READ_WRITE');
  const [targetResource, setTargetResource] = useState<string>('CSC-NDC-PG-PROD-01 (PostgreSQL Cluster)');
  const [justification, setJustification] = useState<string>('');
  const [validFrom, setValidFrom] = useState<string>(new Date().toISOString().slice(0, 16));
  const [validTo, setValidTo] = useState<string>(new Date(Date.now() + 86400000).toISOString().slice(0, 16));

  const isManagerOrAdmin = ['IT_MANAGER', 'L3_SPECIALIST', 'CHANGE_MANAGER', 'ADMIN'].includes(currentUser.role);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justification.trim() || !targetResource.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateAccessRequest({
        environment,
        accessType,
        targetResource,
        justification,
        validFrom,
        validTo,
      });
      setShowCreateModal(false);
      setJustification('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!showActionModal) return;
    setIsSubmitting(true);
    try {
      if (showActionModal.action === 'approve') {
        await onApproveRequest(showActionModal.id, showActionModal.stage, comments);
      } else {
        await onRejectRequest(showActionModal.id, comments || 'Rejected by approver');
      }
      setShowActionModal(null);
      setComments('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 mr-1" /> APPROVED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3 mr-1" /> REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3 h-3 mr-1 text-amber-600 animate-spin" /> PENDING APPROVAL
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#133E6D] text-white p-6 rounded-2xl border border-[#1C5494] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <KeyRound className="w-4 h-4" />
            <span>Privileged Access Governance</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Production & UAT Elevated Access Management
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            ISO 27001 & Cyber Security Operations Centre (CSOC) mandated access controls for NDC & SDC infrastructure.
            All granted access grants are strictly time-bound and cryptographically logged.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Request Elevated Access</span>
        </button>
      </div>

      {/* Access Requests Grid */}
      <div className="space-y-4">
        {(accessRequests || []).map((req) => {
          return (
            <div
              key={req.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                    <Server className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-blue-900 text-xs">{req.requestNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                        req.environment === 'PRODUCTION' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {req.environment}
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.2 rounded font-mono">
                        {req.accessType}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{req.targetResource}</h3>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {getStatusBadge(req.status)}
                </div>
              </div>

              {/* Justification & Validity */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="md:col-span-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Business Justification & Scope
                  </p>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {req.justification}
                  </p>
                </div>

                <div className="space-y-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Validity Window
                  </p>
                  <div className="space-y-1 text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>From: <strong>{new Date(req.validFrom).toLocaleString()}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-rose-600" />
                      <span>To: <strong>{new Date(req.validTo).toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Stage Approval Chain Tracker */}
              <div className="pt-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Multi-Stage Verification Chain
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(req.approvalChain || []).map((stg) => (
                    <div
                      key={stg.stageNumber}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        stg.status === 'APPROVED'
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : stg.status === 'REJECTED'
                          ? 'bg-rose-50/70 border-rose-200'
                          : 'bg-amber-50/70 border-amber-200'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          Stage {stg.stageNumber}: {stg.roleRequired.replace('_', ' ')}
                        </span>
                        <p className="font-bold text-slate-800">{stg.approverName || 'Pending Assignment'}</p>
                        {stg.comments && <p className="text-[11px] text-slate-600 italic mt-0.5">"{stg.comments}"</p>}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        stg.status === 'APPROVED' ? 'bg-emerald-600 text-white' :
                        stg.status === 'REJECTED' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-slate-950'
                      }`}>
                        {stg.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons for Approver Role */}
              {req.status === 'PENDING_APPROVAL' && isManagerOrAdmin && (
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setShowActionModal({ id: req.id, action: 'reject', stage: 1 })}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg text-xs border border-rose-200"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => setShowActionModal({ id: req.id, action: 'approve', stage: 1 })}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs"
                  >
                    Approve Stage 1 / Elevate Access
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Access Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95">
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Request Elevated Server / DB Access</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Target Environment</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  >
                    <option value="PRODUCTION">Production (NDC Core)</option>
                    <option value="UAT">UAT / Testing</option>
                    <option value="DR">Disaster Recovery (SDC)</option>
                    <option value="STAGING">Staging Environment</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Access Level</label>
                  <select
                    value={accessType}
                    onChange={(e) => setAccessType(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  >
                    <option value="READ_ONLY">Read-Only / Auditor</option>
                    <option value="READ_WRITE">Read-Write Operator</option>
                    <option value="ADMIN_ROOT">Administrator / Sudo Root</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Target Server / DB Cluster</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CSC-NDC-PG-PROD-01 (10.140.20.15)"
                  value={targetResource}
                  onChange={(e) => setTargetResource(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Valid From</label>
                  <input
                    type="datetime-local"
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Valid To</label>
                  <input
                    type="datetime-local"
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Business Justification</label>
                <textarea
                  required
                  rows={3}
                  placeholder="State project code, ticket reference, or reason for emergency access..."
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
                >
                  {isSubmitting ? 'Logging...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Approve / Reject Dialog */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl text-xs animate-in zoom-in-95">
            <h3 className="font-bold text-sm text-slate-900">
              {showActionModal.action === 'approve' ? 'Approve Access Request' : 'Reject Access Request'}
            </h3>
            <p className="text-slate-600">
              Please enter mandatory verification comments for ISO 27001 audit compliance.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Identity verified via employee ID and approved for 24h window..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowActionModal(null)}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={isSubmitting}
                className={`px-4 py-1.5 font-bold rounded-lg text-white ${
                  showActionModal.action === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {showActionModal.action === 'approve' ? 'Approval' : 'Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
