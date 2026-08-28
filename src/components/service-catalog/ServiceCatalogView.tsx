import React, { useState, useMemo } from 'react';
import {
  Search,
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
  Smartphone,
  Send,
  MessageSquare,
  Users,
  Building2,
  ShieldAlert,
  ArrowUpRight,
  Check,
  Cpu,
  Lock,
  ChevronRight,
  Info,
} from 'lucide-react';
import { ServiceCatalogItem, User as UserType, Department } from '../../types/itsm';

interface ServiceCatalogViewProps {
  catalogItems: ServiceCatalogItem[];
  departments?: Department[];
  currentUser: UserType;
  onRequestItem: (data: {
    subject: string;
    description: string;
    type: 'SERVICE_REQUEST';
    categoryName: string;
    departmentId?: string;
  }) => Promise<any>;
  onOpenAccessRequests: () => void;
  onViewTicket?: (ticketId: string) => void;
}

export const ServiceCatalogView: React.FC<ServiceCatalogViewProps> = ({
  catalogItems = [],
  departments = [],
  currentUser,
  onRequestItem,
  onOpenAccessRequests,
  onViewTicket,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<ServiceCatalogItem | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    currentUser.departmentId || departments.find((d) => d.code === 'TECH')?.id || 'dept-tech'
  );
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<any | null>(null);
  const [activeSimulation, setActiveSimulation] = useState<{
    cisoApproved: boolean;
    infraApproved: boolean;
    opsAssigned: boolean;
    assignedGroup: string;
    channelUsed: 'WHATSAPP' | 'EMAIL';
  }>({
    cisoApproved: false,
    infraApproved: false,
    opsAssigned: false,
    assignedGroup: '',
    channelUsed: 'WHATSAPP',
  });

  const activeDepartment = useMemo(() => {
    return (
      departments.find((d) => d.id === selectedDeptId) ||
      departments.find((d) => d.code === 'TECH') || {
        id: 'dept-tech',
        name: 'Technology & Digital Infrastructure',
        code: 'TECH',
        cisoName: 'Dr. Amitav Sen (CISO)',
        cisoEmail: 'ciso@csc.gov.in',
        cisoPhone: '+91 98101 23456',
        infraHeadName: 'Vikram Malhotra (Infra Head)',
        infraHeadEmail: 'infra.head@csc.gov.in',
        infraHeadPhone: '+91 98112 34567',
        opsManagerName: 'Rajesh Kumar (Operations Manager)',
        opsManagerEmail: 'ops.manager@csc.gov.in',
        requiresDualApproval: true,
      }
    );
  }, [departments, selectedDeptId]);

  const quickPillItems = [
    {
      id: 'pill-uat-srv',
      title: 'UAT Server Provision',
      code: 'SC-UAT-SRV',
      category: 'Cloud Infrastructure & Servers',
      icon: Server,
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      description: 'Deploy dedicated UAT application/database VM with dual CISO + Infra Head clearance.',
    },
    {
      id: 'pill-uat-acc',
      title: 'UAT Access',
      code: 'SC-UAT-ACC',
      category: 'Identity & Access Management',
      icon: KeyRound,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
      description: 'Staging & UAT environment security credentials, DB read/write, & API sandbox keys.',
    },
    {
      id: 'pill-vpn',
      title: 'VPN Access',
      code: 'SC-VPN-01',
      category: 'Network & Security',
      icon: ShieldCheck,
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      description: 'Secure IPsec/SSL VPN remote gateway access with 2FA token activation.',
    },
    {
      id: 'pill-email',
      title: 'Email ID Creation',
      code: 'SC-EMAIL-01',
      category: 'Identity & Access Management',
      icon: Mail,
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
      description: 'Official CSC government mailbox (@csc.gov.in) with Microsoft 365 license.',
    },
    {
      id: 'pill-vm',
      title: 'Cloud VM / Server',
      code: 'SC-VM-01',
      category: 'Cloud Infrastructure & Servers',
      icon: Cpu,
      color: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100',
      description: 'High-compute Linux/Windows instance in CSC NDC with SSD storage.',
    },
    {
      id: 'pill-laptop',
      title: 'Laptop / Hardware',
      code: 'SC-HW-01',
      category: 'End User Computing',
      icon: Laptop,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
      description: 'Standard enterprise laptop, dual monitor, or peripheral workstation kit.',
    },
  ];

  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return catalogItems;
    const q = searchQuery.toLowerCase();
    return (catalogItems || []).filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
  }, [catalogItems, searchQuery]);

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

  const handleOpenItem = (item: ServiceCatalogItem | any) => {
    if (item.code === 'SC-PROD-ACC') {
      onOpenAccessRequests();
      return;
    }
    const fullItem = (catalogItems || []).find((c) => c.code === item.code) || item;
    setSelectedItem(fullItem);
    setFormValues({});
    setCreatedTicket(null);
    setActiveSimulation({
      cisoApproved: false,
      infraApproved: false,
      opsAssigned: false,
      assignedGroup: '',
      channelUsed: 'WHATSAPP',
    });
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      const details = Object.entries(formValues)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');

      const res = await onRequestItem({
        subject: `SR: ${selectedItem.title} - [${activeDepartment.name}]`,
        description: `Service Catalog Request [${selectedItem.code}]\n\nService: ${selectedItem.title}\nDepartment: ${activeDepartment.name} (${activeDepartment.code})\n\nParameters Provided:\n${details || 'Standard defaults selected.'}\n\nAutomated Workflow Notice:\nApproval chain triggered: 1. CISO (${activeDepartment.cisoName || 'Dr. Amitav Sen'}) + Infra Head (${activeDepartment.infraHeadName || 'Vikram Malhotra'}) via Email & WhatsApp. 2. Operations Manager (${activeDepartment.opsManagerName || 'Rajesh Kumar'}) assignment to concern team upon OK confirmation.`,
        type: 'SERVICE_REQUEST',
        categoryName: selectedItem.category,
        departmentId: activeDepartment.id,
      });

      setCreatedTicket(res || {
        id: `sr-${Date.now()}`,
        ticketNumber: `SR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        subject: `SR: ${selectedItem.title}`,
        status: 'AWAITING_APPROVAL',
        routingState: 'AWAITING_DUAL_APPROVAL',
        approvals: [
          {
            id: 'appr-ciso',
            roleRequired: 'CISO',
            approverName: activeDepartment.cisoName || 'Dr. Amitav Sen (CISO)',
            approverEmail: activeDepartment.cisoEmail || 'ciso@csc.gov.in',
            approverPhone: activeDepartment.cisoPhone || '+91 98101 23456',
            status: 'PENDING',
          },
          {
            id: 'appr-infra',
            roleRequired: 'INFRA_HEAD',
            approverName: activeDepartment.infraHeadName || 'Vikram Malhotra (Infra Head)',
            approverEmail: activeDepartment.infraHeadEmail || 'infra.head@csc.gov.in',
            approverPhone: activeDepartment.infraHeadPhone || '+91 98112 34567',
            status: 'PENDING',
          },
        ],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateApproval = (role: 'CISO' | 'INFRA') => {
    setActiveSimulation((prev) => {
      const next = {
        ...prev,
        cisoApproved: role === 'CISO' ? true : prev.cisoApproved,
        infraApproved: role === 'INFRA' ? true : prev.infraApproved,
      };
      return next;
    });
  };

  const handleSimulateOpsAssignment = (groupName: string) => {
    setActiveSimulation((prev) => ({
      ...prev,
      opsAssigned: true,
      assignedGroup: groupName,
    }));
  };

  return (
    <div className="min-h-full pb-16 space-y-8">
      {/* 1. GOOGLE-STYLE SIMPLE HERO SEARCH INTERFACE */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs flex flex-col items-center text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>CSC e-Governance One-Stop Service Portal</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-2">
          What can we help you with today?
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mb-8">
          Simple, unified request flow for server provisioning, environment access, VPN tokens, and government mailboxes.
        </p>

        {/* Clean Google-like Search Bar */}
        <div className="w-full max-w-2xl relative mb-6">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services (e.g., UAT Server, UAT Access, VPN, Email ID, Cloud VM)..."
              className="w-full pl-12 pr-12 py-3.5 sm:py-4 bg-white rounded-2xl border border-slate-300 text-slate-900 text-sm placeholder-slate-400 shadow-xs hover:border-blue-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Fast Action 1-Click Request Pills */}
        <div className="w-full">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Popular Quick Requests
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {quickPillItems.map((pill) => {
              const Icon = pill.icon;
              return (
                <button
                  key={pill.id}
                  onClick={() => handleOpenItem(pill)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs hover:scale-102 active:scale-98 ${pill.color}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{pill.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. DUAL APPROVAL & OPERATIONS ROUTING WORKFLOW EXPLANATION CARD */}
      <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#0B2545] to-[#133E6D] text-white rounded-3xl p-6 sm:p-8 border border-blue-900/60 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Automated High-Security Dual Approval & Ops Routing
              </h2>
              <p className="text-xs text-blue-200">
                Department-based workflow with real-time Email & WhatsApp authorization triggers
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            Active for: Technology & Infrastructure
          </span>
        </div>

        {/* 3-Step Flow Visual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/30 text-blue-200">
                  STEP 1
                </span>
                <div className="flex items-center gap-1 text-[10px] text-amber-300">
                  <Smartphone className="w-3 h-3" />
                  <span>Email + WhatsApp</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Dual Approval Dispatch</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Once SR is generated for <strong>Technology</strong>, automated alerts send to <strong>CISO</strong> ({activeDepartment.cisoName || 'Dr. Amitav Sen'}) and <strong>Infra Head</strong> ({activeDepartment.infraHeadName || 'Vikram Malhotra'}).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 text-[11px] text-emerald-300 font-mono flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>CISO & Infra Head "OK"</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/30 text-purple-200">
                  STEP 2
                </span>
                <span className="text-[10px] text-purple-200 font-medium">Auto-State Transition</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Operations Routing</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                As soon as both approvers put <strong>"OK"</strong> via WhatsApp or Email, the system automatically routes the ticket to <strong>Operations Manager</strong> ({activeDepartment.opsManagerName || 'Rajesh Kumar'}).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 text-[11px] text-purple-300 font-mono flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Auto-delivered to Ops Queue</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-200">
                  STEP 3
                </span>
                <span className="text-[10px] text-emerald-200 font-medium">SLA Execution</span>
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Concern Team Assignment</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Operations Manager reviews the cleared request and delegates work to the <strong>Concern Team</strong> (Infra, DBA, Network NOC, or Security).
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-white/10 text-[11px] text-amber-300 font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Fulfilled within SLA target</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FULL CATALOG GRID (SEARCHABLE) */}
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>Complete Service Catalog Directory</span>
            <span className="text-xs font-normal text-slate-500">
              ({filteredCatalog.length} available services)
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCatalog.map((item) => {
            const Icon = getIcon(item.iconName);
            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {item.code}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Delivery: <strong>{item.estimatedDelivery}</strong>
                    </span>
                    {item.requiresApproval && (
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold text-[10px] border border-blue-200">
                        Dual Approval
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-2">
                  <button
                    onClick={() => handleOpenItem(item)}
                    className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Request Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DYNAMIC REQUEST CREATION & INTERACTIVE SIMULATION MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 my-8 text-xs">
            {/* Modal Header */}
            <div className="bg-[#0B2545] text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-white/10 text-white">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{selectedItem.title}</h3>
                  <p className="text-[11px] text-slate-300">
                    {selectedItem.code} • {selectedItem.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              {createdTicket ? (
                /* LIVE REAL-TIME APPROVAL & OPERATIONS ROUTING TRACKER */
                <div className="space-y-6">
                  <div className="text-center py-2 space-y-1">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <span className="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                      {createdTicket.ticketNumber}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">
                      Service Request Generated Successfully
                    </h4>
                    <p className="text-slate-500 max-w-md mx-auto text-xs">
                      Approval alerts dispatched simultaneously to CISO & Infra Head via WhatsApp and Email.
                    </p>
                  </div>

                  {/* Visual Live Tracker Box */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        Live Multi-Channel Approval Simulation
                      </span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                        Interactive Test Panel
                      </span>
                    </div>

                    {/* Stage 1: CISO & Infra Head Approval */}
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-bold text-slate-700">
                        1. Dual Approvers (Putting "OK" via WhatsApp / Email):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* CISO Card */}
                        <div
                          className={`p-3 rounded-xl border transition-all ${
                            activeSimulation.cisoApproved
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-slate-900 text-xs">
                                {activeDepartment.cisoName || 'Dr. Amitav Sen'}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                CISO • {activeDepartment.cisoPhone || '+91 98101 23456'}
                              </p>
                            </div>
                            {activeSimulation.cisoApproved ? (
                              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> OK Approved
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                Awaiting OK
                              </span>
                            )}
                          </div>
                          {!activeSimulation.cisoApproved && (
                            <div className="mt-2.5 flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSimulateApproval('CISO')}
                                className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp OK</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSimulateApproval('CISO')}
                                className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Mail className="w-3 h-3" />
                                <span>Email OK</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Infra Head Card */}
                        <div
                          className={`p-3 rounded-xl border transition-all ${
                            activeSimulation.infraApproved
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-slate-900 text-xs">
                                {activeDepartment.infraHeadName || 'Vikram Malhotra'}
                              </p>
                              <p className="text-[10px] text-slate-500">
                                Infra Head • {activeDepartment.infraHeadPhone || '+91 98112 34567'}
                              </p>
                            </div>
                            {activeSimulation.infraApproved ? (
                              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <Check className="w-3 h-3" /> OK Approved
                              </span>
                            ) : (
                              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                Awaiting OK
                              </span>
                            )}
                          </div>
                          {!activeSimulation.infraApproved && (
                            <div className="mt-2.5 flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSimulateApproval('INFRA')}
                                className="flex-1 py-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>WhatsApp OK</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSimulateApproval('INFRA')}
                                className="flex-1 py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Mail className="w-3 h-3" />
                                <span>Email OK</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stage 2 & 3: Auto-Routing to Operations Manager */}
                    <div
                      className={`p-4 rounded-xl border transition-all ${
                        activeSimulation.cisoApproved && activeSimulation.infraApproved
                          ? 'bg-blue-50/80 border-blue-200'
                          : 'bg-slate-100/60 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-blue-700" />
                          2. Operations Manager Queue ({activeDepartment.opsManagerName || 'Rajesh Kumar'})
                        </span>
                        {activeSimulation.cisoApproved && activeSimulation.infraApproved ? (
                          <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">
                            Ready for Assignment
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Locked (Requires Both OKs)
                          </span>
                        )}
                      </div>

                      {activeSimulation.cisoApproved && activeSimulation.infraApproved && (
                        <div className="space-y-3 pt-2">
                          <p className="text-[11px] text-slate-600">
                            🎉 Both CISO and Infra Head approvals verified! Operations Manager can now assign this ticket to the concern technical team:
                          </p>

                          {activeSimulation.opsAssigned ? (
                            <div className="p-3 bg-emerald-100/70 text-emerald-900 rounded-xl border border-emerald-300 flex items-center justify-between font-semibold">
                              <span>
                                Assigned to Concern Team: <strong>{activeSimulation.assignedGroup}</strong>
                              </span>
                              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
                                IN EXECUTION
                              </span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {[
                                'Cloud Infrastructure & DC',
                                'Database Administration (DBA)',
                                'Network NOC Team',
                                'Cyber Security (CSOC)',
                              ].map((grp) => (
                                <button
                                  key={grp}
                                  type="button"
                                  onClick={() => handleSimulateOpsAssignment(grp)}
                                  className="p-2 bg-white hover:bg-blue-600 hover:text-white text-slate-700 border border-slate-300 hover:border-blue-600 rounded-xl font-bold text-[10px] transition-all cursor-pointer text-center"
                                >
                                  Assign to {grp.split(' ')[0]}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItem(null);
                        if (onViewTicket && createdTicket?.id) {
                          onViewTicket(createdTicket.id);
                        }
                      }}
                      className="px-4 py-2 bg-blue-700 text-white font-bold rounded-xl text-xs hover:bg-blue-800 cursor-pointer shadow-xs"
                    >
                      Close & View Tickets Queue
                    </button>
                  </div>
                </div>
              ) : (
                /* SERVICE REQUEST FORM */
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  {/* Department Selector with Clear Technology Badge */}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Select Requesting Department <span className="text-red-500">*</span></span>
                    </label>
                    <select
                      value={selectedDeptId}
                      onChange={(e) => setSelectedDeptId(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all"
                    >
                      {(departments || []).map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name} ({dept.code}) {dept.requiresDualApproval || dept.code === 'TECH' ? '★ (CISO + Infra Head Clearance)' : ''}
                        </option>
                      ))}
                    </select>

                    {/* Department Workflow Notice Banner */}
                    <div className="mt-2.5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Department Approval Rule:</strong> When submitting for{' '}
                        <strong>{activeDepartment.name}</strong>, authorization alerts are automatically dispatched to{' '}
                        <strong>CISO</strong> ({activeDepartment.cisoName || 'Dr. Amitav Sen'} • {activeDepartment.cisoPhone || '+91 98101 23456'}) and{' '}
                        <strong>Infra Head</strong> ({activeDepartment.infraHeadName || 'Vikram Malhotra'} • {activeDepartment.infraHeadPhone || '+91 98112 34567'}) on WhatsApp and Email. Once they reply <strong>OK</strong>, the ticket automatically reaches{' '}
                        <strong>Operations Manager</strong> ({activeDepartment.opsManagerName || 'Rajesh Kumar'}).
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Catalog Fields */}
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
                          className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600"
                        >
                          <option value="">Select option...</option>
                          {(field.options || []).map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          required={field.required}
                          rows={3}
                          placeholder={field.placeholder || 'Provide business justification or specifications...'}
                          value={formValues[field.id] || ''}
                          onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                          className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600"
                        />
                      ) : (
                        <input
                          type="text"
                          required={field.required}
                          placeholder={field.placeholder || ''}
                          value={formValues[field.id] || ''}
                          onChange={(e) => setFormValues({ ...formValues, [field.id]: e.target.value })}
                          className="w-full p-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:border-blue-600"
                        />
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                      {isSubmitting ? (
                        <span>Dispatching...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Generate Service Request</span>
                        </>
                      )}
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
