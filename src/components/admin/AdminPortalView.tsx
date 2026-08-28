import React, { useState, useEffect } from 'react';
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
  Edit2,
  Trash2,
  Building2,
  Save,
  Check,
  Search,
  Filter,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import {
  User,
  UserRole,
  Department,
  ServiceCatalogItem,
  AssignmentGroup,
  Priority,
  SLADefinition,
  NotificationTemplate,
} from '../../types/itsm';
import { api } from '../../services/api';

interface AdminPortalViewProps {
  users: User[];
  currentUser: User;
  departments?: Department[];
  catalogItems?: ServiceCatalogItem[];
  groups?: AssignmentGroup[];
  onResetDemo: () => Promise<void>;
  onCreateUser: (data: any) => Promise<void>;
  onRefreshData?: () => Promise<void>;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  users = [],
  currentUser,
  departments: initialDepartments = [],
  catalogItems: initialCatalog = [],
  groups: initialGroups = [],
  onResetDemo,
  onCreateUser,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<
    'departments' | 'catalog' | 'users' | 'groups' | 'sla' | 'notifications' | 'reset'
  >('departments');

  // Master States
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [catalog, setCatalog] = useState<ServiceCatalogItem[]>(initialCatalog);
  const [groupsList, setGroupsList] = useState<AssignmentGroup[]>(initialGroups);
  const [userList, setUserList] = useState<User[]>(users);
  const [slaList, setSlaList] = useState<Record<string, SLADefinition>>({});
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals & Edit States
  const [deptModal, setDeptModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data: Partial<Department> } | null>(null);
  const [catalogModal, setCatalogModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data: Partial<ServiceCatalogItem> } | null>(null);
  const [userModal, setUserModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data: Partial<User> } | null>(null);
  const [groupModal, setGroupModal] = useState<{ isOpen: boolean; mode: 'add' | 'edit'; data: Partial<AssignmentGroup> } | null>(null);
  const [slaEditPriority, setSlaEditPriority] = useState<Priority | null>(null);
  const [slaEditValues, setSlaEditValues] = useState<{ responseMinutes: number; resolveMinutes: number }>({ responseMinutes: 30, resolveMinutes: 240 });
  const [editTemplate, setEditTemplate] = useState<NotificationTemplate | null>(null);

  // Load config on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const [configRes, deptRes, catRes, grpRes, usrRes] = await Promise.all([
          api.getAdminConfig(),
          api.getDepartments(),
          api.getServiceCatalog(),
          api.getGroups(),
          api.getAdminUsers(),
        ]);
        if (deptRes?.departments) setDepartments(deptRes.departments);
        if (catRes?.items) setCatalog(catRes.items);
        if (grpRes?.groups) setGroupsList(grpRes.groups);
        if (usrRes?.users) setUserList(usrRes.users);
        if (configRes?.slaDefinitions) setSlaList(configRes.slaDefinitions);
        if (configRes?.notificationTemplates) setTemplates(configRes.notificationTemplates);
      } catch (e) {
        console.error('Failed to load admin config:', e);
      }
    };
    loadConfig();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleRefresh = async () => {
    try {
      const [deptRes, catRes, grpRes, usrRes] = await Promise.all([
        api.getDepartments(),
        api.getServiceCatalog(),
        api.getGroups(),
        api.getAdminUsers(),
      ]);
      if (deptRes?.departments) setDepartments(deptRes.departments);
      if (catRes?.items) setCatalog(catRes.items);
      if (grpRes?.groups) setGroupsList(grpRes.groups);
      if (usrRes?.users) setUserList(usrRes.users);
      if (onRefreshData) await onRefreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // --- 1. Department CRUD ---
  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptModal?.data.name || !deptModal?.data.code) return;
    try {
      if (deptModal.mode === 'add') {
        const res = await api.createDepartment(deptModal.data);
        if (res.department) {
          setDepartments((prev) => [...prev, res.department]);
          showNotification(`Department "${res.department.name}" created successfully!`);
        }
      } else if (deptModal.data.id) {
        const res = await api.updateDepartment(deptModal.data.id, deptModal.data);
        if (res.department) {
          setDepartments((prev) => prev.map((d) => (d.id === res.department.id ? res.department : d)));
          showNotification(`Department "${res.department.name}" updated successfully!`);
        }
      }
      setDeptModal(null);
      await handleRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save department', 'error');
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete department "${name}"?`)) return;
    try {
      await api.deleteDepartment(id);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      showNotification(`Department "${name}" deleted.`);
      await handleRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete department', 'error');
    }
  };

  // --- 2. Service Catalog CRUD ---
  const handleSaveCatalogItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catalogModal?.data.title || !catalogModal?.data.category) return;
    try {
      if (catalogModal.mode === 'add') {
        const res = await api.createServiceCatalogItem(catalogModal.data);
        if (res.item) {
          setCatalog((prev) => [...prev, res.item]);
          showNotification(`Service item "${res.item.title}" created successfully!`);
        }
      } else if (catalogModal.data.id) {
        const res = await api.updateServiceCatalogItem(catalogModal.data.id, catalogModal.data);
        if (res.item) {
          setCatalog((prev) => prev.map((c) => (c.id === res.item.id ? res.item : c)));
          showNotification(`Service item "${res.item.title}" updated successfully!`);
        }
      }
      setCatalogModal(null);
      await handleRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save service item', 'error');
    }
  };

  const handleDeleteCatalogItem = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}" from the Service Catalog?`)) return;
    try {
      await api.deleteServiceCatalogItem(id);
      setCatalog((prev) => prev.filter((c) => c.id !== id));
      showNotification(`Catalog item "${title}" deleted.`);
      await handleRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete catalog item', 'error');
    }
  };

  // --- 3. Users CRUD ---
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userModal?.data.name || !userModal?.data.email) return;
    try {
      if (userModal.mode === 'add') {
        const res = await api.createAdminUser(userModal.data);
        if (res.user) {
          setUserList((prev) => [...prev, res.user]);
          showNotification(`User "${res.user.name}" created successfully!`);
        }
      } else if (userModal.data.id) {
        const res = await api.updateAdminUser(userModal.data.id, userModal.data);
        if (res.user) {
          setUserList((prev) => prev.map((u) => (u.id === res.user.id ? res.user : u)));
          showNotification(`User "${res.user.name}" updated successfully!`);
        }
      }
      setUserModal(null);
      await handleRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save user', 'error');
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete user "${name}"?`)) return;
    try {
      await api.deleteAdminUser(id);
      setUserList((prev) => prev.filter((u) => u.id !== id));
      showNotification(`User "${name}" removed from directory.`);
      await handleRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete user', 'error');
    }
  };

  // --- 4. Assignment Groups CRUD ---
  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupModal?.data.name) return;
    try {
      if (groupModal.mode === 'add') {
        const res = await api.createGroup(groupModal.data);
        if (res.group) {
          setGroupsList((prev) => [...prev, res.group]);
          showNotification(`Group "${res.group.name}" created successfully!`);
        }
      } else if (groupModal.data.id) {
        const res = await api.updateGroup(groupModal.data.id, groupModal.data);
        if (res.group) {
          setGroupsList((prev) => prev.map((g) => (g.id === res.group.id ? res.group : g)));
          showNotification(`Group "${res.group.name}" updated successfully!`);
        }
      }
      setGroupModal(null);
      await handleRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Failed to save group', 'error');
    }
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete group "${name}"?`)) return;
    try {
      await api.deleteGroup(id);
      setGroupsList((prev) => prev.filter((g) => g.id !== id));
      showNotification(`Group "${name}" deleted.`);
      await handleRefresh();
    } catch (err: any) {
      showNotification(err.message || 'Failed to delete group', 'error');
    }
  };

  // --- 5. SLA Updates ---
  const handleSaveSLA = async (priority: Priority) => {
    try {
      const res = await api.updateSLA(priority, slaEditValues);
      if (res.sla) {
        setSlaList((prev) => ({ ...prev, [priority]: res.sla }));
        showNotification(`SLA for ${priority} updated!`);
      }
      setSlaEditPriority(null);
    } catch (err: any) {
      showNotification(err.message || 'Failed to update SLA', 'error');
    }
  };

  // --- 6. Notification Templates ---
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTemplate) return;
    try {
      const res = await api.updateNotificationTemplate(editTemplate.id, editTemplate);
      if (res.template) {
        setTemplates((prev) => prev.map((t) => (t.id === res.template.id ? res.template : t)));
        showNotification(`Template "${res.template.event}" updated!`);
      }
      setEditTemplate(null);
    } catch (err: any) {
      showNotification(err.message || 'Failed to update template', 'error');
    }
  };

  // --- Reset Demo ---
  const handleExecuteReset = async () => {
    setIsResetting(true);
    try {
      await onResetDemo();
      setResetSuccess(true);
      await handleRefresh();
      setTimeout(() => setResetSuccess(false), 3000);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#133E6D] text-white p-6 rounded-3xl border border-[#1C5494] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Master Administration & Configuration Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Enterprise ITSM Governance & Master Settings
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Full CRUD (Add, Edit, Update, Delete) for Departments, CISO & Infra Approver contacts, Service Catalog, Staff Users, Assignment Groups, SLA Targets, and Messaging Gateways.
          </p>
        </div>
      </div>

      {/* Global Status Toast */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-2xl shadow-xs text-xs font-semibold overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('departments')}
          className={`py-3.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'departments'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Departments & Approvers ({departments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`py-3.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'catalog'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Service Catalog ({catalog.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-3.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Staff & RBAC ({userList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`py-3.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'groups'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Concern Teams ({groupsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sla')}
          className={`py-3.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'sla'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>SLA Policies</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-3.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'notifications'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Templates & Gateways</span>
        </button>

        <button
          onClick={() => setActiveTab('reset')}
          className={`py-3.5 px-3.5 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'reset'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
          <span>Reset Demo Data</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DEPARTMENTS & APPROVERS CRUD                       */}
      {/* ======================================================== */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden text-xs space-y-4">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Department Directory & Approval Routing Rules
              </h3>
              <p className="text-[11px] text-slate-500">
                Configure CISO, Infra Head, and Operations Manager contact details & dual-approval triggers.
              </p>
            </div>
            <button
              onClick={() =>
                setDeptModal({
                  isOpen: true,
                  mode: 'add',
                  data: {
                    requiresDualApproval: true,
                    approvalChannels: ['EMAIL', 'WHATSAPP'],
                    cisoName: 'Dr. Amitav Sen (CISO)',
                    cisoEmail: 'ciso@csc.gov.in',
                    cisoPhone: '+91 98101 23456',
                    infraHeadName: 'Vikram Malhotra (Infra Head)',
                    infraHeadEmail: 'infra.head@csc.gov.in',
                    infraHeadPhone: '+91 98112 34567',
                    opsManagerName: 'Rajesh Kumar (Operations Manager)',
                    opsManagerEmail: 'ops.manager@csc.gov.in',
                  },
                })
              }
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Department</span>
            </button>
          </div>

          <div className="overflow-x-auto p-5 pt-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase">
                  <th className="py-3 px-3">Department & Code</th>
                  <th className="py-3 px-3">CISO (WhatsApp / Email)</th>
                  <th className="py-3 px-3">Infra Head</th>
                  <th className="py-3 px-3">Operations Manager</th>
                  <th className="py-3 px-3 text-center">Dual Approval</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departments.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{d.name}</p>
                      <span className="font-mono text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {d.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-800">{d.cisoName || '—'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{d.cisoEmail}</p>
                      <p className="text-[10px] text-emerald-700 font-mono">{d.cisoPhone}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-800">{d.infraHeadName || '—'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{d.infraHeadEmail}</p>
                      <p className="text-[10px] text-emerald-700 font-mono">{d.infraHeadPhone}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-semibold text-slate-800">{d.opsManagerName || '—'}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{d.opsManagerEmail}</p>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {d.requiresDualApproval || d.code === 'TECH' ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                          ENABLED (CISO + Infra)
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">Standard</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDeptModal({ isOpen: true, mode: 'edit', data: { ...d } })}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 cursor-pointer"
                          title="Edit Department"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDepartment(d.id, d.name)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 cursor-pointer"
                          title="Delete Department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SERVICE CATALOG CRUD                              */}
      {/* ======================================================== */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden text-xs space-y-4">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Service Catalog Item Definitions</h3>
              <p className="text-[11px] text-slate-500">
                Manage IT service offerings (UAT Server, UAT Access, VPN, Mailbox, VM) and their SLA delivery targets.
              </p>
            </div>
            <button
              onClick={() =>
                setCatalogModal({
                  isOpen: true,
                  mode: 'add',
                  data: {
                    category: 'Cloud Infrastructure & Servers',
                    defaultPriority: 'MEDIUM',
                    estimatedDelivery: '1 Business Day',
                    requiresApproval: true,
                    approvalStages: ['CISO Approval', 'Infra Head Approval', 'Operations Assignment'],
                  },
                })
              }
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Catalog Item</span>
            </button>
          </div>

          <div className="overflow-x-auto p-5 pt-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase">
                  <th className="py-3 px-3">Service Code & Title</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Delivery SLA</th>
                  <th className="py-3 px-3">Approval Chain</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {catalog.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <span className="font-mono text-[10px] text-slate-500">{item.code}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">{item.category}</td>
                    <td className="py-3.5 px-3 font-semibold text-blue-700">{item.estimatedDelivery}</td>
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {(item.approvalStages || []).map((stg, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-mono"
                          >
                            {i + 1}. {stg}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setCatalogModal({ isOpen: true, mode: 'edit', data: { ...item } })}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 cursor-pointer"
                          title="Edit Service Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCatalogItem(item.id, item.title)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 cursor-pointer"
                          title="Delete Service Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: USERS & RBAC CRUD                                 */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden text-xs space-y-4">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">User Accounts & Role-Based Access Control</h3>
              <p className="text-[11px] text-slate-500">
                Directory of personnel, technicians, security officers, and administrators.
              </p>
            </div>
            <button
              onClick={() =>
                setUserModal({
                  isOpen: true,
                  mode: 'add',
                  data: { role: 'SERVICE_DESK', departmentName: 'Technology & Digital Infrastructure', isActive: true },
                })
              }
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Staff User</span>
            </button>
          </div>

          <div className="overflow-x-auto p-5 pt-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase">
                  <th className="py-3 px-3">Name & Code</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{u.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{u.email}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700">{u.departmentName || 'CSC HQ'}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{u.phone || '—'}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setUserModal({ isOpen: true, mode: 'edit', data: { ...u } })}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CONCERN TEAMS (ASSIGNMENT GROUPS) CRUD            */}
      {/* ======================================================== */}
      {activeTab === 'groups' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden text-xs space-y-4">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Technical Concern Teams & Assignment Pools</h3>
              <p className="text-[11px] text-slate-500">
                Groups where Operations Manager routes tickets after CISO & Infra Head approvals.
              </p>
            </div>
            <button
              onClick={() =>
                setGroupModal({
                  isOpen: true,
                  mode: 'add',
                  data: { memberIds: [] },
                })
              }
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Concern Team</span>
            </button>
          </div>

          <div className="overflow-x-auto p-5 pt-0">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase">
                  <th className="py-3 px-3">Team Name</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Group Email</th>
                  <th className="py-3 px-3">Members Count</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {groupsList.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-bold text-slate-900">{g.name}</td>
                    <td className="py-3.5 px-3 text-slate-600">{g.description || '—'}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-600">{g.email || '—'}</td>
                    <td className="py-3.5 px-3 font-bold text-blue-700">
                      {(g.memberIds || []).length} Engineers
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setGroupModal({ isOpen: true, mode: 'edit', data: { ...g } })}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(g.id, g.name)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: SLA POLICIES CRUD                                 */}
      {/* ======================================================== */}
      {activeTab === 'sla' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-900">SLA Response & Resolution Benchmark Targets</h3>
            <p className="text-[11px] text-slate-500">
              Government service delivery target metrics per priority level. Click Edit on any row to update timers.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase">
                  <th className="py-3 px-3">Priority Level</th>
                  <th className="py-3 px-3">Response SLA Target</th>
                  <th className="py-3 px-3">Resolution SLA Target</th>
                  <th className="py-3 px-3">Auto-Escalation Threshold</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as Priority[]).map((p) => {
                  const def = slaList[p] || {
                    priority: p,
                    responseMinutes: p === 'CRITICAL' ? 15 : p === 'HIGH' ? 30 : p === 'MEDIUM' ? 60 : 120,
                    resolveMinutes: p === 'CRITICAL' ? 120 : p === 'HIGH' ? 240 : p === 'MEDIUM' ? 480 : 1440,
                    escalateAfterMinutes: p === 'CRITICAL' ? 30 : 60,
                  };
                  const isEditing = slaEditPriority === p;

                  return (
                    <tr key={p} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-3 font-bold text-slate-900">{p}</td>
                      <td className="py-3.5 px-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={slaEditValues.responseMinutes}
                              onChange={(e) =>
                                setSlaEditValues({ ...slaEditValues, responseMinutes: Number(e.target.value) })
                              }
                              className="w-20 p-1 border rounded text-xs font-mono"
                            />
                            <span>mins</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-blue-700">{def.responseMinutes} Minutes</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={slaEditValues.resolveMinutes}
                              onChange={(e) =>
                                setSlaEditValues({ ...slaEditValues, resolveMinutes: Number(e.target.value) })
                              }
                              className="w-20 p-1 border rounded text-xs font-mono"
                            />
                            <span>mins ({Math.round(slaEditValues.resolveMinutes / 60)} hrs)</span>
                          </div>
                        ) : (
                          <span className="font-bold text-slate-800">
                            {def.resolveMinutes} Minutes ({Math.round(def.resolveMinutes / 60)} Hours)
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">
                        {def.escalateAfterMinutes ? `Auto-escalates after ${def.escalateAfterMinutes}m` : 'Standard Queue'}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveSLA(p)}
                              className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="w-3 h-3" /> Save
                            </button>
                            <button
                              onClick={() => setSlaEditPriority(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSlaEditPriority(p);
                              setSlaEditValues({
                                responseMinutes: def.responseMinutes,
                                resolveMinutes: def.resolveMinutes,
                              });
                            }}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: NOTIFICATIONS & TEMPLATES CRUD                    */}
      {/* ======================================================== */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6 text-xs">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Email & WhatsApp Notification Templates</h3>
            <p className="text-[11px] text-slate-500">
              Customize message copy, subject lines, and auto-dispatch rules for tickets and approvals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => (
              <div key={tpl.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    {tpl.channel === 'WHATSAPP' ? (
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Mail className="w-4 h-4 text-blue-600" />
                    )}
                    <span>{tpl.event}</span>
                  </span>
                  <button
                    onClick={() => setEditTemplate({ ...tpl })}
                    className="p-1 rounded bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {tpl.subject && (
                  <p className="text-[11px] font-semibold text-slate-800">
                    Subject: <span className="font-mono text-blue-800">{tpl.subject}</span>
                  </p>
                )}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-700 whitespace-pre-wrap">
                  {tpl.body}
                </div>
              </div>
            ))}
          </div>

          {/* Edit Template Modal */}
          {editTemplate && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
                <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
                  <h3 className="font-bold text-sm">Edit Template: {editTemplate.event}</h3>
                  <button onClick={() => setEditTemplate(null)} className="text-slate-300 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleSaveTemplate} className="p-5 space-y-3">
                  {editTemplate.subject !== undefined && (
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Subject Line</label>
                      <input
                        type="text"
                        value={editTemplate.subject || ''}
                        onChange={(e) => setEditTemplate({ ...editTemplate, subject: e.target.value })}
                        className="w-full p-2 border rounded-lg font-mono text-xs"
                      />
                    </div>
                  )}
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Message Body</label>
                    <textarea
                      rows={5}
                      value={editTemplate.body}
                      onChange={(e) => setEditTemplate({ ...editTemplate, body: e.target.value })}
                      className="w-full p-2 border rounded-lg font-mono text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button
                      type="button"
                      onClick={() => setEditTemplate(null)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800"
                    >
                      Save Template
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: RESET DEMO DATA                                   */}
      {/* ======================================================== */}
      {activeTab === 'reset' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Demo Master Data Management</h3>
          <p className="text-slate-600 leading-relaxed max-w-xl">
            Reset the in-memory repository to freshly seeded enterprise data with Technology department CISO & Infra Head contacts (+91 98101 23456, +91 98112 34567), Operations Manager routing, catalog items, and staff personas.
          </p>

          {resetSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Demo database has been successfully reset with official records!</span>
            </div>
          )}

          <div>
            <button
              onClick={handleExecuteReset}
              disabled={isResetting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              <span>{isResetting ? 'Resetting Repository...' : 'Reset to Default Seed Data'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: DEPARTMENT ADD / EDIT                             */}
      {/* ======================================================== */}
      {deptModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95 my-8">
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {deptModal.mode === 'add' ? 'Add New Department' : `Edit Department: ${deptModal.data.name}`}
              </h3>
              <button
                onClick={() => setDeptModal(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Technology & Digital Infra"
                    value={deptModal.data.name || ''}
                    onChange={(e) => setDeptModal({ ...deptModal, data: { ...deptModal.data, name: e.target.value } })}
                    className="w-full p-2.5 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TECH"
                    value={deptModal.data.code || ''}
                    onChange={(e) => setDeptModal({ ...deptModal, data: { ...deptModal.data, code: e.target.value.toUpperCase() } })}
                    className="w-full p-2.5 border rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* CISO Configuration */}
              <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-2">
                <p className="font-bold text-blue-900 text-xs">CISO (Chief Information Security Officer) Contact</p>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="CISO Name"
                    value={deptModal.data.cisoName || ''}
                    onChange={(e) => setDeptModal({ ...deptModal, data: { ...deptModal.data, cisoName: e.target.value } })}
                    className="p-2 border rounded-lg bg-white"
                  />
                  <input
                    type="email"
                    placeholder="ciso@csc.gov.in"
                    value={deptModal.data.cisoEmail || ''}
                    onChange={(e) => setDeptModal({ ...deptModal, data: { ...deptModal.data, cisoEmail: e.target.value } })}
                    className="p-2 border rounded-lg bg-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp/Phone (+91...)"
                    value={deptModal.data.cisoPhone || ''}
                    onChange={(e) => setDeptModal({ ...deptModal, data: { ...deptModal.data, cisoPhone: e.target.value } })}
                    className="p-2 border rounded-lg bg-white font-mono"
                  />
                </div>
              </div>

              {/* Infra Head Configuration */}
              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-2">
                <p className="font-bold text-purple-900 text-xs">Infra Head Contact</p>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Infra Head Name"
                    value={deptModal.data.infraHeadName || ''}
                    onChange={(e) => setDeptModal({ ...deptModal, data: { ...deptModal.data, infraHeadName: e.target.value } })}
                    className="p-2 border rounded-lg bg-white"
                  />
                  <input
                    type="email"
                    placeholder="infra.head@csc.gov.in"
                    value={deptModal.data.infraHeadEmail || ''}
                    onChange={(e) => setDeptModal({ ...deptModal, data: { ...deptModal.data, infraHeadEmail: e.target.value } })}
                    className="p-2 border rounded-lg bg-white font-mono"
                  />
                  <input
                    type="text"
                    placeholder="WhatsApp/Phone (+91...)"
                    value={deptModal.data.infraHeadPhone || ''}
                    onChange={(e) => setDeptModal({ ...deptModal, data: { ...deptModal.data, infraHeadPhone: e.target.value } })}
                    className="p-2 border rounded-lg bg-white font-mono"
                  />
                </div>
              </div>

              {/* Operations Manager */}
              <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                <p className="font-bold text-emerald-900 text-xs">Operations Manager Contact</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Ops Manager Name"
                    value={deptModal.data.opsManagerName || ''}
                    onChange={(e) => setDeptModal({ ...deptModal, data: { ...deptModal.data, opsManagerName: e.target.value } })}
                    className="p-2 border rounded-lg bg-white"
                  />
                  <input
                    type="email"
                    placeholder="ops.manager@csc.gov.in"
                    value={deptModal.data.opsManagerEmail || ''}
                    onChange={(e) => setDeptModal({ ...deptModal, data: { ...deptModal.data, opsManagerEmail: e.target.value } })}
                    className="p-2 border rounded-lg bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="dualAppr"
                  checked={deptModal.data.requiresDualApproval || false}
                  onChange={(e) => setDeptModal({ ...deptModal, data: { ...deptModal.data, requiresDualApproval: e.target.checked } })}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="dualAppr" className="font-bold text-slate-800">
                  Require Dual Approval (CISO + Infra Head clearance via WhatsApp/Email before Ops routing)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setDeptModal(null)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SERVICE CATALOG ADD / EDIT                        */}
      {/* ======================================================== */}
      {catalogModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95 my-8">
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {catalogModal.mode === 'add' ? 'Add Service Catalog Item' : `Edit: ${catalogModal.data.title}`}
              </h3>
              <button onClick={() => setCatalogModal(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCatalogItem} className="p-5 space-y-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UAT Server Provision"
                  value={catalogModal.data.title || ''}
                  onChange={(e) => setCatalogModal({ ...catalogModal, data: { ...catalogModal.data, title: e.target.value } })}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Category *</label>
                  <select
                    value={catalogModal.data.category || 'Cloud Infrastructure & Servers'}
                    onChange={(e) => setCatalogModal({ ...catalogModal, data: { ...catalogModal.data, category: e.target.value } })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="Cloud Infrastructure & Servers">Cloud Infrastructure & Servers</option>
                    <option value="Identity & Access Management">Identity & Access Management</option>
                    <option value="Network & Security">Network & Security</option>
                    <option value="End User Computing">End User Computing</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Delivery Estimate</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Business Day"
                    value={catalogModal.data.estimatedDelivery || ''}
                    onChange={(e) => setCatalogModal({ ...catalogModal, data: { ...catalogModal.data, estimatedDelivery: e.target.value } })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Service description..."
                  value={catalogModal.data.description || ''}
                  onChange={(e) => setCatalogModal({ ...catalogModal, data: { ...catalogModal.data, description: e.target.value } })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reqAppr"
                  checked={catalogModal.data.requiresApproval !== false}
                  onChange={(e) => setCatalogModal({ ...catalogModal, data: { ...catalogModal.data, requiresApproval: e.target.checked } })}
                  className="w-4 h-4 rounded text-blue-600"
                />
                <label htmlFor="reqAppr" className="font-bold text-slate-800">
                  Requires CISO & Infra Head Approval Workflow
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setCatalogModal(null)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800"
                >
                  Save Catalog Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: USER ADD / EDIT                                   */}
      {/* ======================================================== */}
      {userModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95 my-8">
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {userModal.mode === 'add' ? 'Add Staff Member' : `Edit User: ${userModal.data.name}`}
              </h3>
              <button onClick={() => setUserModal(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={userModal.data.name || ''}
                  onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, name: e.target.value } })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@csc.gov.in"
                  value={userModal.data.email || ''}
                  onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, email: e.target.value } })}
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Assigned Role</label>
                  <select
                    value={userModal.data.role || 'SERVICE_DESK'}
                    onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, role: e.target.value as any } })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="SERVICE_DESK">SERVICE_DESK (L1)</option>
                    <option value="L2_ENGINEER">L2_ENGINEER</option>
                    <option value="L3_SPECIALIST">L3_SPECIALIST</option>
                    <option value="IT_MANAGER">IT_MANAGER</option>
                    <option value="CHANGE_MANAGER">CHANGE_MANAGER</option>
                    <option value="PROBLEM_MANAGER">PROBLEM_MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Phone (WhatsApp)</label>
                  <input
                    type="text"
                    placeholder="+91 98..."
                    value={userModal.data.phone || ''}
                    onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, phone: e.target.value } })}
                    className="w-full p-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Technology & Digital Infrastructure"
                  value={userModal.data.departmentName || ''}
                  onChange={(e) => setUserModal({ ...userModal, data: { ...userModal.data, departmentName: e.target.value } })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setUserModal(null)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONCERN TEAM ADD / EDIT                           */}
      {/* ======================================================== */}
      {groupModal?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in zoom-in-95">
            <div className="bg-[#0B2545] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {groupModal.mode === 'add' ? 'Add Concern Team' : `Edit Group: ${groupModal.data.name}`}
              </h3>
              <button onClick={() => setGroupModal(null)} className="text-slate-300 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="p-5 space-y-3">
              <div>
                <label className="font-bold text-slate-800 block mb-1">Group / Concern Team Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infrastructure & Cloud Ops"
                  value={groupModal.data.name || ''}
                  onChange={(e) => setGroupModal({ ...groupModal, data: { ...groupModal.data, name: e.target.value } })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Group Email</label>
                <input
                  type="email"
                  placeholder="cloud.ops@csc.gov.in"
                  value={groupModal.data.email || ''}
                  onChange={(e) => setGroupModal({ ...groupModal, data: { ...groupModal.data, email: e.target.value } })}
                  className="w-full p-2 border rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Team scope and responsibilities..."
                  value={groupModal.data.description || ''}
                  onChange={(e) => setGroupModal({ ...groupModal, data: { ...groupModal.data, description: e.target.value } })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setGroupModal(null)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-700 text-white font-bold rounded-lg hover:bg-blue-800"
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
