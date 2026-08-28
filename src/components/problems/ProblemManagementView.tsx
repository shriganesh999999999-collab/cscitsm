import React, { useState } from 'react';
import {
  AlertOctagon,
  HelpCircle,
  CheckCircle2,
  Plus,
  Flame,
  FileCheck,
  Shield,
  X,
  Lightbulb,
} from 'lucide-react';
import { ProblemRecord, User as UserType } from '../../types/itsm';

interface ProblemManagementViewProps {
  problems: ProblemRecord[];
  currentUser: UserType;
  onCreateProblem: (data: any) => Promise<void>;
}

export const ProblemManagementView: React.FC<ProblemManagementViewProps> = ({
  problems,
  currentUser,
  onCreateProblem,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [workaround, setWorkaround] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateProblem({
        title,
        description,
        rootCause,
        workaround,
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setRootCause('');
      setWorkaround('');
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
            <AlertOctagon className="w-4 h-4" />
            <span>Problem Management & KEDB</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Known Error Database & Root Cause Analysis (RCA)
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Identify underlying root causes of recurring incidents. Publish workarounds and Corrective & Preventive
            Actions (CAPA) to minimize downtime across CSC National Systems.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Problem Record</span>
        </button>
      </div>

      {/* Problem Records List */}
      <div className="space-y-4">
        {(problems || []).map((prb) => (
          <div
            key={prb.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-purple-300 transition-colors"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-purple-900 text-xs">{prb.problemNumber}</span>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-purple-100 text-purple-800">
                    STATUS: {prb.status.replace('_', ' ')}
                  </span>
                  {prb.isKnownError && (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      PUBLISHED KNOWN ERROR
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mt-1">{prb.title}</h3>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-semibold text-[11px] flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  {prb.linkedIncidentIds?.length || 0} Linked Incidents
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{prb.description}</p>

            {/* RCA & Workaround Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-1.5 font-bold text-purple-900 mb-1">
                  <FileCheck className="w-4 h-4 text-purple-700" />
                  <span>Root Cause Analysis (RCA)</span>
                </div>
                <p className="text-purple-950 text-xs leading-relaxed">
                  {prb.rootCause || 'Under active investigation by L3 Engineering.'}
                </p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200">
                <div className="flex items-center space-x-1.5 font-bold text-amber-900 mb-1">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>Approved Temporary Workaround</span>
                </div>
                <p className="text-amber-950 text-xs leading-relaxed">
                  {prb.workaround || 'No confirmed workaround yet.'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Problem Record Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95">
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Create Problem Record (RCA)</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Problem Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory leak in SMS Gateway Worker threads"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Problem Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Symptoms observed across repeated incidents..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Initial Root Cause Analysis</label>
                <textarea
                  rows={2}
                  placeholder="Technical findings..."
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Standard Workaround for L1/L2</label>
                <textarea
                  rows={2}
                  placeholder="Steps to restore service pending permanent fix..."
                  value={workaround}
                  onChange={(e) => setWorkaround(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-purple-600"
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
                  className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg"
                >
                  {isSubmitting ? 'Logging...' : 'Register Problem Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
