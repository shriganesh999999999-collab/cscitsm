import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import {
  User,
  Ticket,
  DashboardMetrics,
  ServiceCatalogItem,
  AccessRequest,
  ChangeRequest,
  ProblemRecord,
  Asset,
  KnowledgeArticle,
  AuditLog,
  Category,
  AssignmentGroup,
  UserRole,
  TicketStatus,
  Priority,
} from './types/itsm';

import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { ITSMDashboard } from './components/dashboard/ITSMDashboard';
import { TicketListView } from './components/tickets/TicketListView';
import { TicketDetailModal } from './components/tickets/TicketDetailModal';
import { CreateTicketModal } from './components/tickets/CreateTicketModal';
import { ServiceCatalogView } from './components/service-catalog/ServiceCatalogView';
import { AccessRequestsView } from './components/access-requests/AccessRequestsView';
import { ChangeManagementView } from './components/changes/ChangeManagementView';
import { ProblemManagementView } from './components/problems/ProblemManagementView';
import { AssetManagementView } from './components/assets/AssetManagementView';
import { KnowledgeBaseView } from './components/kb/KnowledgeBaseView';
import { ApprovalsPortalView } from './components/approvals/ApprovalsPortalView';
import { ReportsAnalyticsView } from './components/reports/ReportsAnalyticsView';
import { AdminPortalView } from './components/admin/AdminPortalView';
import { AuditLogsView } from './components/audit/AuditLogsView';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Core Data State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [catalogItems, setCatalogItems] = useState<ServiceCatalogItem[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [problems, setProblems] = useState<ProblemRecord[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [kbArticles, setKbArticles] = useState<KnowledgeArticle[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<AssignmentGroup[]>([]);
  const [adminUsers, setAdminUsers] = useState<User[]>([]);

  // Modals
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateTicketModal, setShowCreateTicketModal] = useState<boolean>(false);
  const [ticketListFilterTitle, setTicketListFilterTitle] = useState<string>('All Tickets & Requests');

  // Initial Boot & Data Refresh
  const loadAllData = useCallback(async (userId?: string) => {
    try {
      const [
        meRes,
        ticketsRes,
        metricsRes,
        catalogRes,
        accessRes,
        changesRes,
        problemsRes,
        assetsRes,
        kbRes,
        auditRes,
        catRes,
        groupsRes,
        usersRes,
      ] = await Promise.all([
        api.getMe(userId),
        api.getTickets(),
        api.getDashboardMetrics(),
        api.getServiceCatalog(),
        api.getAccessRequests(),
        api.getChanges(),
        api.getProblems(),
        api.getAssets(),
        api.getKBArticles(),
        api.getAuditLogs(),
        api.getCategories(),
        api.getGroups(),
        api.getAdminUsers(),
      ]);

      if (meRes?.user) setCurrentUser(meRes.user);
      if (ticketsRes?.tickets) setTickets(ticketsRes.tickets);
      if (metricsRes?.metrics) setMetrics(metricsRes.metrics);
      if (catalogRes?.items) setCatalogItems(catalogRes.items);
      if (accessRes?.accessRequests) setAccessRequests(accessRes.accessRequests);
      if (changesRes?.changes) setChanges(changesRes.changes);
      if (problemsRes?.problems) setProblems(problemsRes.problems);
      if (assetsRes?.assets) setAssets(assetsRes.assets);
      if (kbRes?.articles) setKbArticles(kbRes.articles);
      if (auditRes?.logs) setAuditLogs(auditRes.logs);
      if (catRes?.categories) setCategories(catRes.categories);
      if (groupsRes?.groups) setGroups(groupsRes.groups);
      if (usersRes?.users) setAdminUsers(usersRes.users);
    } catch (err) {
      console.error('Failed to load ITSM data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // SLA Live Countdown Timer Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.status === 'RESOLVED' || t.status === 'CLOSED' || t.slaState === 'MET') {
            return t;
          }
          if (t.slaRemainingSeconds !== undefined && t.slaRemainingSeconds > 0) {
            const nextSec = t.slaRemainingSeconds - 5;
            return {
              ...t,
              slaRemainingSeconds: nextSec,
              slaState: nextSec <= 0 ? 'BREACHED' : t.slaState,
            };
          }
          return t;
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auth actions
  const handleLogin = async (email: string, password?: string) => {
    const res = await api.login(email, password);
    setCurrentUser(res.user);
    await loadAllData(res.user.id);
  };

  const handleQuickRoleLogin = async (role: UserRole) => {
    const res = await api.switchRole(role);
    setCurrentUser(res.user);
    await loadAllData(res.user.id);
  };

  const handleSwitchRole = async (role: UserRole) => {
    const res = await api.switchRole(role);
    setCurrentUser(res.user);
    await loadAllData(res.user.id);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleResetDemo = async () => {
    await api.resetDemo();
    await loadAllData(currentUser?.id);
  };

  // Ticket Operations
  const handleCreateTicketSubmit = async (data: any) => {
    const res = await api.createTicket(data, currentUser?.id);
    await loadAllData(currentUser?.id);
    return res.ticket;
  };

  const handleAssignTicket = async (ticketId: string, groupId?: string, techId?: string) => {
    await api.assignTicket(ticketId, { groupId, technicianId: techId }, currentUser?.id);
    const updated = await api.getTicketById(ticketId);
    setSelectedTicket(updated.ticket);
    await loadAllData(currentUser?.id);
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: TicketStatus, comment?: string) => {
    await api.updateTicketStatus(ticketId, { status, comment }, currentUser?.id);
    const updated = await api.getTicketById(ticketId);
    setSelectedTicket(updated.ticket);
    await loadAllData(currentUser?.id);
  };

  const handleAddComment = async (ticketId: string, content: string, isInternal: boolean) => {
    await api.addComment(ticketId, { content, isInternal }, currentUser?.id);
    const updated = await api.getTicketById(ticketId);
    setSelectedTicket(updated.ticket);
    await loadAllData(currentUser?.id);
  };

  const handleAddTask = async (ticketId: string, title: string) => {
    await api.addTask(ticketId, title);
    const updated = await api.getTicketById(ticketId);
    setSelectedTicket(updated.ticket);
  };

  const handleToggleTask = async (ticketId: string, taskId: string) => {
    await api.toggleTask(ticketId, taskId);
    const updated = await api.getTicketById(ticketId);
    setSelectedTicket(updated.ticket);
  };

  const handleResolveTicket = async (ticketId: string, solution: string) => {
    await api.resolveTicket(ticketId, solution, currentUser?.id);
    const updated = await api.getTicketById(ticketId);
    setSelectedTicket(updated.ticket);
    await loadAllData(currentUser?.id);
  };

  const handleConvertTicketToKB = async (ticketId: string) => {
    const res = await api.convertTicketToKB(ticketId, currentUser?.id);
    alert(`Article "${res.article.title}" published into Knowledge Base!`);
    await loadAllData(currentUser?.id);
  };

  // Access Request Operations
  const handleCreateAccessRequest = async (data: any) => {
    await api.createAccessRequest(data, currentUser?.id);
    await loadAllData(currentUser?.id);
  };

  const handleApproveAccessRequest = async (id: string, stageNumber: number, comments?: string) => {
    await api.approveAccessRequest(id, { stageNumber, comments }, currentUser?.id);
    await loadAllData(currentUser?.id);
  };

  const handleRejectAccessRequest = async (id: string, comments: string) => {
    await api.rejectAccessRequest(id, { comments }, currentUser?.id);
    await loadAllData(currentUser?.id);
  };

  // Change & Problem Operations
  const handleCreateChange = async (data: any) => {
    await api.createChange(data, currentUser?.id);
    await loadAllData(currentUser?.id);
  };

  const handleCreateProblem = async (data: any) => {
    await api.createProblem(data, currentUser?.id);
    await loadAllData(currentUser?.id);
  };

  const handleCreateAsset = async (data: any) => {
    await api.createAsset(data);
    await loadAllData(currentUser?.id);
  };

  const handleCreateKBArticle = async (data: any) => {
    await api.createKBArticle(data, currentUser?.id);
    await loadAllData(currentUser?.id);
  };

  const handleCreateAdminUser = async (data: any) => {
    await api.createAdminUser(data);
    await loadAllData(currentUser?.id);
  };

  // Filter handlers from Dashboard
  const handleDashboardFilterTickets = (filter: { status?: string; priority?: string; type?: string }) => {
    if (filter.priority === 'CRITICAL') {
      setTicketListFilterTitle('Critical & High Priority Incidents');
    } else if (filter.status === 'RESOLVED') {
      setTicketListFilterTitle('Resolved & Closed Tickets');
    } else {
      setTicketListFilterTitle('Filtered Ticket Queue');
    }
    setActiveView('tickets');
  };

  // Global Search Handler
  const handleGlobalSearch = (query: string) => {
    if (query.trim()) {
      setActiveView('tickets');
      setTicketListFilterTitle(`Search Results for: "${query}"`);
    }
  };

  // Calculated Counters
  const pendingApprovalsCount = accessRequests.filter((a) => a.status === 'PENDING_APPROVAL').length;
  const openTicketsCount = tickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;

  if (isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-[#06182C] text-white flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Loading CSC e-Governance ITSM Core Engine...
        </p>
      </div>
    );
  }

  // If not logged in, show Login Screen
  if (!currentUser) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onQuickRoleLogin={handleQuickRoleLogin}
      />
    );
  }

  // My Tickets Filtered Subsets
  const myTickets = tickets.filter(
    (t) => t.assignedToId === currentUser.id || t.requesterId === currentUser.id
  );
  const incidentRecords = tickets.filter((t) => t.type === 'INCIDENT');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans text-slate-800">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
        onSearch={handleGlobalSearch}
        onOpenCreateTicket={() => setShowCreateTicketModal(true)}
        onResetDemo={handleResetDemo}
        pendingApprovalsCount={pendingApprovalsCount}
        activeView={activeView}
        onNavigate={(view) => setActiveView(view)}
      />

      {/* Main Workspace (Sidebar + Content Canvas) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => {
            setActiveView(view);
            if (view === 'tickets') setTicketListFilterTitle('All Tickets & Requests');
            if (view === 'my-tickets') setTicketListFilterTitle('My Assigned & Raised Queue');
            if (view === 'incidents') setTicketListFilterTitle('Incident Management Records');
          }}
          currentUser={currentUser}
          pendingApprovalsCount={pendingApprovalsCount}
          openTicketsCount={openTicketsCount}
        />

        {/* Dynamic View Canvas */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar max-w-7xl mx-auto w-full">
          {/* VIEW: DASHBOARD */}
          {activeView === 'dashboard' && (
            <ITSMDashboard
              metrics={metrics}
              onFilterTickets={handleDashboardFilterTickets}
              currentUser={currentUser}
              onNavigate={(v) => setActiveView(v)}
              onOpenCreateTicket={() => setShowCreateTicketModal(true)}
            />
          )}

          {/* VIEW: ALL TICKETS */}
          {activeView === 'tickets' && (
            <TicketListView
              tickets={tickets}
              onSelectTicket={(t) => setSelectedTicket(t)}
              onOpenCreateTicket={() => setShowCreateTicketModal(true)}
              onRefresh={() => loadAllData(currentUser.id)}
              currentUser={currentUser}
              filterTitle={ticketListFilterTitle}
            />
          )}

          {/* VIEW: MY TICKETS */}
          {activeView === 'my-tickets' && (
            <TicketListView
              tickets={myTickets}
              onSelectTicket={(t) => setSelectedTicket(t)}
              onOpenCreateTicket={() => setShowCreateTicketModal(true)}
              onRefresh={() => loadAllData(currentUser.id)}
              currentUser={currentUser}
              filterTitle="My Assigned & Raised Queue"
            />
          )}

          {/* VIEW: INCIDENTS */}
          {activeView === 'incidents' && (
            <TicketListView
              tickets={incidentRecords}
              onSelectTicket={(t) => setSelectedTicket(t)}
              onOpenCreateTicket={() => setShowCreateTicketModal(true)}
              onRefresh={() => loadAllData(currentUser.id)}
              currentUser={currentUser}
              filterTitle="Critical Incident Records (Outages & Degradations)"
            />
          )}

          {/* VIEW: SERVICE CATALOG */}
          {activeView === 'catalog' && (
            <ServiceCatalogView
              catalogItems={catalogItems}
              currentUser={currentUser}
              onRequestItem={async (data) => {
                await handleCreateTicketSubmit(data);
              }}
              onOpenAccessRequests={() => setActiveView('access-requests')}
            />
          )}

          {/* VIEW: ACCESS REQUESTS */}
          {activeView === 'access-requests' && (
            <AccessRequestsView
              accessRequests={accessRequests}
              currentUser={currentUser}
              onCreateAccessRequest={handleCreateAccessRequest}
              onApproveRequest={handleApproveAccessRequest}
              onRejectRequest={handleRejectAccessRequest}
            />
          )}

          {/* VIEW: CHANGES (CAB) */}
          {activeView === 'changes' && (
            <ChangeManagementView
              changes={changes}
              currentUser={currentUser}
              onCreateChange={handleCreateChange}
            />
          )}

          {/* VIEW: PROBLEMS (RCA) */}
          {activeView === 'problems' && (
            <ProblemManagementView
              problems={problems}
              currentUser={currentUser}
              onCreateProblem={handleCreateProblem}
            />
          )}

          {/* VIEW: ASSETS (CMDB) */}
          {activeView === 'assets' && (
            <AssetManagementView
              assets={assets}
              currentUser={currentUser}
              onCreateAsset={handleCreateAsset}
              onFilterAssetTickets={(tag) => {
                setActiveView('tickets');
                setTicketListFilterTitle(`Tickets Linked to Asset CI: ${tag}`);
              }}
            />
          )}

          {/* VIEW: KNOWLEDGE BASE */}
          {activeView === 'kb' && (
            <KnowledgeBaseView
              articles={kbArticles}
              currentUser={currentUser}
              onCreateArticle={handleCreateKBArticle}
            />
          )}

          {/* VIEW: APPROVALS INBOX */}
          {activeView === 'approvals' && (
            <ApprovalsPortalView
              accessRequests={accessRequests}
              changes={changes}
              currentUser={currentUser}
              onApproveAccess={handleApproveAccessRequest}
              onRejectAccess={handleRejectAccessRequest}
            />
          )}

          {/* VIEW: REPORTS & SLA */}
          {activeView === 'reports' && (
            <ReportsAnalyticsView
              metrics={metrics}
              tickets={tickets}
            />
          )}

          {/* VIEW: AUDIT LOGS */}
          {activeView === 'audit-logs' && (
            <AuditLogsView
              logs={auditLogs}
              currentUser={currentUser}
              onRefresh={() => loadAllData(currentUser.id)}
            />
          )}

          {/* VIEW: ADMIN */}
          {activeView === 'admin' && (
            <AdminPortalView
              users={adminUsers}
              currentUser={currentUser}
              onResetDemo={handleResetDemo}
              onCreateUser={handleCreateAdminUser}
            />
          )}
        </main>
      </div>

      {/* Ticket Details Inspection Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          currentUser={currentUser}
          assignmentGroups={groups}
          technicians={adminUsers.filter((u) => u.role !== 'EMPLOYEE')}
          assets={assets}
          onAssign={handleAssignTicket}
          onUpdateStatus={handleUpdateTicketStatus}
          onAddComment={handleAddComment}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onResolve={handleResolveTicket}
          onConvertToKB={handleConvertTicketToKB}
        />
      )}

      {/* Create Ticket Wizard Modal */}
      {showCreateTicketModal && (
        <CreateTicketModal
          isOpen={showCreateTicketModal}
          onClose={() => setShowCreateTicketModal(false)}
          categories={categories}
          assets={assets}
          currentUser={currentUser}
          onSubmit={handleCreateTicketSubmit}
          onSelectCreatedTicket={(t) => setSelectedTicket(t)}
        />
      )}
    </div>
  );
}
