import React, { useState } from 'react';
import {
  X,
  Flame,
  Layers,
  Shield,
  Clock,
  Sparkles,
  Paperclip,
  CheckCircle2,
  HardDrive,
  Building2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import {
  Category,
  Asset,
  Impact,
  Urgency,
  Priority,
  Ticket,
  User as UserType,
} from '../../types/itsm';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  assets: Asset[];
  currentUser: UserType;
  onSubmit: (data: {
    subject: string;
    description: string;
    type?: 'INCIDENT' | 'SERVICE_REQUEST';
    impact?: Impact;
    urgency?: Urgency;
    categoryName?: string;
    subcategoryName?: string;
    assetId?: string;
  }) => Promise<Ticket>;
  onSelectCreatedTicket?: (ticket: Ticket) => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  categories,
  assets,
  currentUser,
  onSubmit,
  onSelectCreatedTicket,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<number>(1);
  const [ticketType, setTicketType] = useState<'INCIDENT' | 'SERVICE_REQUEST'>('INCIDENT');
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.name || 'Network');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [impact, setImpact] = useState<Impact>('MEDIUM');
  const [urgency, setUrgency] = useState<Urgency>('MEDIUM');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);

  // Dynamic Priority calculation
  const calculateComputedPriority = (imp: Impact, urg: Urgency): Priority => {
    if (imp === 'CRITICAL' && urg === 'CRITICAL') return 'CRITICAL';
    if (imp === 'CRITICAL' || urg === 'CRITICAL' || (imp === 'HIGH' && urg === 'HIGH')) return 'HIGH';
    if (imp === 'LOW' && urg === 'LOW') return 'LOW';
    return 'MEDIUM';
  };

  const computedPriority = calculateComputedPriority(impact, urgency);
  const activeCategoryObj = (categories || []).find((c) => c.name === selectedCategory);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const ticket = await onSubmit({
        subject,
        description,
        type: ticketType,
        impact,
        urgency,
        categoryName: selectedCategory,
        subcategoryName: selectedSubcategory || activeCategoryObj?.subcategories?.[0] || 'General',
        assetId: selectedAssetId || undefined,
      });
      setCreatedTicket(ticket);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setCreatedTicket(null);
    setSubject('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#0B2545] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#1C5494]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Raise IT Ticket / Service Request
              </h2>
              <p className="text-xs text-slate-300">
                CSC e-Governance Services India Ltd. Service Desk
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        {!createdTicket && (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                1
              </span>
              <span className={step === 1 ? 'font-bold text-slate-900' : ''}>Type & Category</span>
            </div>
            <div className="w-8 h-0.5 bg-slate-300" />
            <div className="flex items-center space-x-2">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                2
              </span>
              <span className={step === 2 ? 'font-bold text-slate-900' : ''}>Impact & Details</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar text-xs">
          {createdTicket ? (
            /* Success Confirmation Screen */
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-700">
                  Ticket Generated Successfully
                </span>
                <h3 className="text-xl font-mono font-extrabold text-blue-900 mt-1">
                  {createdTicket.ticketNumber}
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-2">
                  Your request has been logged into CSC ITSM and dispatched to{' '}
                  <strong className="text-slate-800">{createdTicket.assignmentGroupName || 'Service Desk'}</strong>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Calculated Priority:</span>
                  <span className="font-bold text-slate-900">{createdTicket.priority}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Expected SLA Deadline:</span>
                  <span className="font-mono text-slate-800">{new Date(createdTicket.resolutionDueDate || '').toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Initial Status:</span>
                  <span className="font-semibold text-blue-700">{createdTicket.status}</span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleResetAndClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg"
                >
                  Close
                </button>
                {onSelectCreatedTicket && (
                  <button
                    onClick={() => {
                      onSelectCreatedTicket(createdTicket);
                      handleResetAndClose();
                    }}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-sm"
                  >
                    View Ticket Details
                  </button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* STEP 1: Type and Category */}
              {step === 1 && (
                <div className="space-y-4">
                  {/* Ticket Type Cards */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-2">Select Ticket Nature</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        onClick={() => setTicketType('INCIDENT')}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          ticketType === 'INCIDENT'
                            ? 'border-rose-600 bg-rose-50/50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Flame className={`w-4 h-4 ${ticketType === 'INCIDENT' ? 'text-rose-600' : 'text-slate-500'}`} />
                          <span className="font-bold text-slate-900 text-xs">Incident / Outage</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Service disruption, bug, system crash, or degradation.
                        </p>
                      </div>

                      <div
                        onClick={() => setTicketType('SERVICE_REQUEST')}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          ticketType === 'SERVICE_REQUEST'
                            ? 'border-blue-600 bg-blue-50/50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Layers className={`w-4 h-4 ${ticketType === 'SERVICE_REQUEST' ? 'text-blue-600' : 'text-slate-500'}`} />
                          <span className="font-bold text-slate-900 text-xs">Service Request</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Standard hardware, VPN, software, or account allocation.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Category & Subcategory */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Service Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          const cat = (categories || []).find((c) => c.name === e.target.value);
                          if (cat && cat.subcategories && cat.subcategories.length > 0) {
                            setSelectedSubcategory(cat.subcategories[0]);
                          }
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-blue-600"
                      >
                        {(categories || []).map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Subcategory</label>
                      <select
                        value={selectedSubcategory}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-blue-600"
                      >
                        {(activeCategoryObj?.subcategories || []).map((sub, idx) => (
                          <option key={idx} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Optional Asset Link */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Related Asset / CI from CMDB (Optional)
                    </label>
                    <select
                      value={selectedAssetId}
                      onChange={(e) => setSelectedAssetId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium outline-none focus:border-blue-600"
                    >
                      <option value="">No specific asset (General Request)</option>
                      {(assets || []).map((ast) => (
                        <option key={ast.id} value={ast.id}>
                          {ast.assetTag} - {ast.name} ({ast.type} - {ast.ipAddress || 'No IP'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2: Priority Matrix & Subject/Description */}
              {step === 2 && (
                <div className="space-y-4">
                  {/* Priority Matrix Impact + Urgency Calculator */}
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-800 text-xs">Priority Matrix Calculation</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        computedPriority === 'CRITICAL' ? 'bg-rose-600 text-white' :
                        computedPriority === 'HIGH' ? 'bg-orange-600 text-white' :
                        computedPriority === 'MEDIUM' ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                      }`}>
                        CALCULATED PRIORITY: {computedPriority}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Business Impact</label>
                        <select
                          value={impact}
                          onChange={(e) => setImpact(e.target.value as Impact)}
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600"
                        >
                          <option value="CRITICAL">Critical (Multiple Data Centres / States)</option>
                          <option value="HIGH">High (Single Portal / Critical Subnet)</option>
                          <option value="MEDIUM">Medium (Moderate Office Impact)</option>
                          <option value="LOW">Low (Single User / Cosmetic)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Service Urgency</label>
                        <select
                          value={urgency}
                          onChange={(e) => setUrgency(e.target.value as Urgency)}
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600"
                        >
                          <option value="CRITICAL">Critical (Immediate Outage)</option>
                          <option value="HIGH">High (Workaround Available)</option>
                          <option value="MEDIUM">Medium (Next Maintenance Window)</option>
                          <option value="LOW">Low (Inquiry / Scheduled)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Ticket Subject / Summary <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. High latency on Digital Seva Payment Gateway API"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">
                      Detailed Technical Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Include error codes, steps to reproduce, affected server IP, or justification..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                ) : (
                  <div />
                )}

                {step === 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg flex items-center gap-1.5"
                  >
                    Next Step <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !subject.trim() || !description.trim()}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isSubmitting ? 'Logging Ticket...' : 'Submit Ticket'}</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
