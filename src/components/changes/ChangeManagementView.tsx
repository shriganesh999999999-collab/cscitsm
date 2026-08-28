import React, { useState } from 'react';
import {
  GitPullRequest,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Calendar,
  Shield,
  FileText,
  X,
} from 'lucide-react';
import { ChangeRequest, User as UserType } from '../../types/itsm';

interface ChangeManagementViewProps {
  changes: ChangeRequest[];
  currentUser: UserType;
  onCreateChange: (data: any) => Promise<void>;
}

export const ChangeManagementView: React.FC<ChangeManagementViewProps> = ({
  changes,
  currentUser,
  onCreateChange,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChange, setSelectedChange] = useState<ChangeRequest | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'STANDARD' | 'NORMAL' | 'EMERGENCY'>('NORMAL');
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [impactAnalysis, setImpactAnalysis] = useState('');
  const [implementationPlan, setImplementationPlan] = useState('');
  const [rollbackPlan, setRollbackPlan] = useState('');
  const [testPlan, setTestPlan] = useState('');
  const [plannedStart, setPlannedStart] = useState(new Date().toISOString().slice(0, 16));
  const [plannedEnd, setPlannedEnd] = useState(new Date(Date.now() + 7200000).toISOString().slice(0, 16));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateChange({
        title,
        description,
        type,
        riskLevel,
        impactAnalysis,
        implementationPlan,
        rollbackPlan,
        testPlan,
        plannedStart,
        plannedEnd,
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
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
            <GitPullRequest className="w-4 h-4" />
            <span>Change Advisory Board (CAB)</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            ITSM Change Management & Maintenance RFCs
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Controlled IT infrastructure release lifecycle. Every RFC requires an Impact Assessment, Rollback Plan,
            and CAB consensus prior to execution in NDC/SDC environments.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create RFC</span>
        </button>
      </div>

      {/* Changes List */}
      <div className="space-y-4">
        {(changes || []).map((chg) => (
          <div
            key={chg.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-blue-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-blue-900 text-xs">{chg.rfcNumber}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                    chg.type === 'EMERGENCY' ? 'bg-rose-100 text-rose-800' :
                    chg.type === 'NORMAL' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {chg.type} CHANGE
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${
                    chg.riskLevel === 'CRITICAL' ? 'bg-rose-600 text-white' :
                    chg.riskLevel === 'HIGH' ? 'bg-orange-600 text-white' :
                    chg.riskLevel === 'MEDIUM' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {chg.riskLevel} RISK
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{chg.title}</h3>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>CAB: {chg.cabApprovalStatus}</span>
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  STATUS: {chg.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{chg.description}</p>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-700 text-[11px] mb-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Implementation Plan
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">{chg.implementationPlan || 'Step-by-step procedures outlined in RFC document.'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="font-bold text-rose-800 text-[11px] mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Rollback & Backout Plan
                </p>
                <p className="text-slate-600 text-[11px] leading-relaxed">{chg.rollbackPlan || 'Automated snapshot restoration trigger.'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="font-bold text-slate-700 text-[11px] mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" /> Maintenance Window
                </p>
                <p className="text-slate-600 text-[11px]">
                  Start: <strong>{new Date(chg.plannedStart).toLocaleString()}</strong>
                  <br />
                  End: <strong>{new Date(chg.plannedEnd).toLocaleString()}</strong>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create RFC Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs max-h-[90vh] flex flex-col animate-in zoom-in-95">
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Submit RFC (Request For Change)</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">RFC Title / Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PostgreSQL 16 Kernel Upgrade & Reindexing on NDC-01"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Change Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  >
                    <option value="NORMAL">Normal Change (Standard CAB Approval)</option>
                    <option value="EMERGENCY">Emergency Change (ECAB Expedited)</option>
                    <option value="STANDARD">Standard Change (Pre-Approved Routine)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Assessed Risk Level</label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  >
                    <option value="CRITICAL">Critical Risk (Outage Likely)</option>
                    <option value="HIGH">High Risk (Service Degradation Possible)</option>
                    <option value="MEDIUM">Medium Risk (Failover Redundant)</option>
                    <option value="LOW">Low Risk (Zero Downtime)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Change Scope & Objective</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detailed description of why this change is necessary..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Implementation Plan</label>
                  <textarea
                    rows={3}
                    placeholder="Step 1: Backup DB, Step 2: Apply patch..."
                    value={implementationPlan}
                    onChange={(e) => setImplementationPlan(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Rollback Plan</label>
                  <textarea
                    rows={3}
                    placeholder="Step 1: Stop service, Step 2: Revert snapshot..."
                    value={rollbackPlan}
                    onChange={(e) => setRollbackPlan(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Planned Maintenance Start</label>
                  <input
                    type="datetime-local"
                    value={plannedStart}
                    onChange={(e) => setPlannedStart(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Planned Maintenance End</label>
                  <input
                    type="datetime-local"
                    value={plannedEnd}
                    onChange={(e) => setPlannedEnd(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
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
                  {isSubmitting ? 'Submitting...' : 'Submit RFC for CAB Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
