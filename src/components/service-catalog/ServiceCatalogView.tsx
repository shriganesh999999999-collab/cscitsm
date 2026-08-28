import React, { useState } from 'react';
import {
  Laptop,
  ShieldCheck,
  KeyRound,
  Mail,
  Server,
  Layers,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { ServiceCatalogItem, User as UserType } from '../../types/itsm';

interface ServiceCatalogViewProps {
  catalogItems: ServiceCatalogItem[];
  currentUser: UserType;
  onRequestItem: (data: {
    subject: string;
    description: string;
    type: 'SERVICE_REQUEST';
    categoryName: string;
  }) => Promise<void>;
  onOpenAccessRequests: () => void;
}

export const ServiceCatalogView: React.FC<ServiceCatalogViewProps> = ({
  catalogItems,
  currentUser,
  onRequestItem,
  onOpenAccessRequests,
}) => {
  const [selectedItem, setSelectedItem] = useState<ServiceCatalogItem | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop':
        return Laptop;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'KeyRound':
        return KeyRound;
      case 'Mail':
        return Mail;
      case 'Server':
        return Server;
      default:
        return Layers;
    }
  };

  const handleOpenRequest = (item: ServiceCatalogItem) => {
    if (item.code === 'SC-PROD-ACC') {
      onOpenAccessRequests();
      return;
    }
    setSelectedItem(item);
    setFormValues({});
    setIsSuccess(false);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      const details = Object.entries(formValues)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');

      await onRequestItem({
        subject: `Service Request: ${selectedItem.title}`,
        description: `Service Catalog Request [${selectedItem.code}]\n\n${selectedItem.description}\n\nSubmitted Parameters:\n${details}`,
        type: 'SERVICE_REQUEST',
        categoryName: selectedItem.category,
      });

      setIsSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#133E6D] text-white p-6 rounded-2xl border border-[#1C5494] shadow-xs">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Layers className="w-4 h-4" />
          <span>CSC Enterprise Service Catalog</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">
          IT Services & Resource Provisioning
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Order standardized hardware, VPN access tokens, official mailboxes, or cloud computing resources.
          All catalog requests follow predefined SLA benchmarks and multi-tier approval chains.
        </p>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {catalogItems.map((item) => {
          const Icon = getIcon(item.iconName);
          return (
            <div
              key={item.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                    {item.code}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Delivery: <strong>{item.estimatedDelivery}</strong>
                  </span>
                  {item.requiresApproval && (
                    <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-semibold text-[10px] border border-amber-200">
                      Approval Req.
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-2">
                <button
                  onClick={() => handleOpenRequest(item)}
                  className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Request Service</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Request Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 text-xs">
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{selectedItem.title}</h3>
                <p className="text-[11px] text-slate-300">{selectedItem.code} • {selectedItem.category}</p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {isSuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900">Service Request Dispatched</h4>
                  <p className="text-slate-600 max-w-sm mx-auto">
                    Your request for <strong>{selectedItem.title}</strong> has been logged. Automated approval tasks have been created.
                  </p>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 bg-blue-700 text-white font-semibold rounded-lg text-xs hover:bg-blue-800"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  {(selectedItem.fields || []).map((field) => (
                    <div key={field.id}>
                      <label className="font-bold text-slate-800 block mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>

                      {field.type === 'select' ? (
                        <select
                          required={field.required}
                          value={formValues[field.id] || ''}
                          onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600"
                        >
                          <option value="">Select option...</option>
                          {(field.options || []).map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          required={field.required}
                          rows={3}
                          placeholder={field.placeholder || 'Provide details...'}
                          value={formValues[field.id] || ''}
                          onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600"
                        />
                      ) : (
                        <input
                          type="text"
                          required={field.required}
                          placeholder={field.placeholder || ''}
                          value={formValues[field.id] || ''}
                          onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                          className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600"
                        />
                      )}
                    </div>
                  ))}

                  {selectedItem.approvalStages && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="font-bold text-amber-900 text-[11px] mb-1">Configured Approval Routing:</p>
                      <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5">
                        {(selectedItem.approvalStages || []).map((stg, i) => (
                          <li key={i}>{stg}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-1.5 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
