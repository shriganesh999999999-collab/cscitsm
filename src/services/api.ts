// CSC e-Governance Services India Ltd. - Enterprise ITSM API Client
import {
  User,
  Ticket,
  TicketComment,
  TicketTask,
  AccessRequest,
  ChangeRequest,
  ProblemRecord,
  Asset,
  KnowledgeArticle,
  AuditLog,
  DashboardMetrics,
  ServiceCatalogItem,
  UserRole,
  Priority,
  Impact,
  Urgency,
  TicketStatus,
} from '../types/itsm';

const getHeaders = (userId?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (userId) {
    headers['x-user-id'] = userId;
  }
  return headers;
};

export const api = {
  // Auth
  async login(email: string, password?: string): Promise<{ success: boolean; user: User; token: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Authentication failed');
    }
    return res.json();
  },

  async getMe(userId?: string): Promise<{ user: User }> {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders(userId),
    });
    return res.json();
  },

  async switchRole(role: UserRole): Promise<{ user: User }> {
    const res = await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return res.json();
  },

  // Master Data
  async getDepartments(): Promise<{ departments: any[] }> {
    const res = await fetch('/api/departments');
    return res.json();
  },

  async getLocations(): Promise<{ locations: any[] }> {
    const res = await fetch('/api/locations');
    return res.json();
  },

  async getGroups(): Promise<{ groups: any[] }> {
    const res = await fetch('/api/groups');
    return res.json();
  },

  async getCategories(): Promise<{ categories: any[] }> {
    const res = await fetch('/api/categories');
    return res.json();
  },

  async getServiceCatalog(): Promise<{ items: ServiceCatalogItem[] }> {
    const res = await fetch('/api/service-catalog');
    return res.json();
  },

  // Tickets
  async getTickets(params?: {
    type?: string;
    status?: string;
    priority?: string;
    departmentId?: string;
    assignedToId?: string;
    requesterId?: string;
    search?: string;
  }): Promise<{ tickets: Ticket[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val) query.set(key, val);
      });
    }
    const res = await fetch(`/api/tickets?${query.toString()}`);
    return res.json();
  },

  async getTicketById(id: string): Promise<{ ticket: Ticket }> {
    const res = await fetch(`/api/tickets/${id}`);
    if (!res.ok) throw new Error('Ticket not found');
    return res.json();
  },

  async createTicket(
    data: {
      subject: string;
      description: string;
      type?: 'INCIDENT' | 'SERVICE_REQUEST' | 'ACCESS_REQUEST';
      impact?: Impact;
      urgency?: Urgency;
      categoryName?: string;
      subcategoryName?: string;
      departmentId?: string;
      locationId?: string;
      assetId?: string;
    },
    userId?: string
  ): Promise<{ success: boolean; ticket: Ticket }> {
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify({ ...data, requesterId: userId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create ticket');
    }
    return res.json();
  },

  async assignTicket(
    id: string,
    data: { groupId?: string; technicianId?: string },
    userId?: string
  ): Promise<{ success: boolean; ticket: Ticket }> {
    const res = await fetch(`/api/tickets/${id}/assign`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async approveTicketStep(
    id: string,
    data: {
      roleOrStepId?: string;
      roleRequired?: string;
      comments?: string;
      channel?: 'EMAIL' | 'WHATSAPP' | 'PORTAL';
      channelUsed?: 'EMAIL' | 'WHATSAPP' | 'PORTAL';
    },
    userId?: string
  ): Promise<{ success: boolean; ticket: Ticket }> {
    const payload = {
      roleOrStepId: data.roleOrStepId || data.roleRequired,
      channel: data.channel || data.channelUsed || 'WHATSAPP',
      comments: data.comments,
    };
    const res = await fetch(`/api/tickets/${id}/approve-step`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async assignConcernTeam(
    id: string,
    data: {
      groupId?: string;
      assignedGroupId?: string;
      assignedGroup?: string;
      technicianId?: string;
      opsInstructions?: string;
      comments?: string;
    },
    userId?: string
  ): Promise<{ success: boolean; ticket: Ticket }> {
    const payload = {
      groupId: data.groupId || data.assignedGroupId,
      technicianId: data.technicianId,
      opsInstructions: data.opsInstructions || data.comments || (data.assignedGroup ? `Assigned to ${data.assignedGroup}` : undefined),
    };
    const res = await fetch(`/api/tickets/${id}/assign-concern-team`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async updateTicketStatus(
    id: string,
    data: { status: TicketStatus; comment?: string },
    userId?: string
  ): Promise<{ success: boolean; ticket: Ticket }> {
    const res = await fetch(`/api/tickets/${id}/status`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async addComment(
    id: string,
    data: { content: string; isInternal: boolean },
    userId?: string
  ): Promise<{ success: boolean; comment: TicketComment }> {
    const res = await fetch(`/api/tickets/${id}/comments`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async addTask(id: string, title: string, assignedToName?: string): Promise<{ success: boolean; task: TicketTask }> {
    const res = await fetch(`/api/tickets/${id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, assignedToName }),
    });
    return res.json();
  },

  async toggleTask(ticketId: string, taskId: string): Promise<{ success: boolean; task: TicketTask }> {
    const res = await fetch(`/api/tickets/${ticketId}/tasks/${taskId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  async resolveTicket(id: string, solution: string, userId?: string): Promise<{ success: boolean; ticket: Ticket }> {
    const res = await fetch(`/api/tickets/${id}/resolve`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify({ solution }),
    });
    return res.json();
  },

  async convertTicketToKB(id: string, userId?: string): Promise<{ success: boolean; article: KnowledgeArticle }> {
    const res = await fetch(`/api/tickets/${id}/convert-to-kb`, {
      method: 'POST',
      headers: getHeaders(userId),
    });
    return res.json();
  },

  // Access Requests
  async getAccessRequests(): Promise<{ accessRequests: AccessRequest[] }> {
    const res = await fetch('/api/access-requests');
    return res.json();
  },

  async createAccessRequest(data: any, userId?: string): Promise<{ success: boolean; accessRequest: AccessRequest }> {
    const res = await fetch('/api/access-requests', {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async approveAccessRequest(
    id: string,
    data: { stageNumber: number; comments?: string },
    userId?: string
  ): Promise<{ success: boolean; accessRequest: AccessRequest }> {
    const res = await fetch(`/api/access-requests/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async rejectAccessRequest(
    id: string,
    data: { comments: string },
    userId?: string
  ): Promise<{ success: boolean; accessRequest: AccessRequest }> {
    const res = await fetch(`/api/access-requests/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Changes
  async getChanges(): Promise<{ changes: ChangeRequest[] }> {
    const res = await fetch('/api/changes');
    return res.json();
  },

  async createChange(data: any, userId?: string): Promise<{ success: boolean; change: ChangeRequest }> {
    const res = await fetch('/api/changes', {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Problems
  async getProblems(): Promise<{ problems: ProblemRecord[] }> {
    const res = await fetch('/api/problems');
    return res.json();
  },

  async createProblem(data: any, userId?: string): Promise<{ success: boolean; problem: ProblemRecord }> {
    const res = await fetch('/api/problems', {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Assets
  async getAssets(params?: { type?: string; status?: string; search?: string }): Promise<{ assets: Asset[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.set(k, v);
      });
    }
    const res = await fetch(`/api/assets?${query.toString()}`);
    return res.json();
  },

  async createAsset(data: any): Promise<{ success: boolean; asset: Asset }> {
    const res = await fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Knowledge Base
  async getKBArticles(search?: string, category?: string): Promise<{ articles: KnowledgeArticle[] }> {
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (category) query.set('category', category);
    const res = await fetch(`/api/kb?${query.toString()}`);
    return res.json();
  },

  async createKBArticle(data: any, userId?: string): Promise<{ success: boolean; article: KnowledgeArticle }> {
    const res = await fetch('/api/kb', {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(params?: { module?: string; action?: string; search?: string }): Promise<{ logs: AuditLog[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.set(k, v);
      });
    }
    const res = await fetch(`/api/audit-logs?${query.toString()}`);
    return res.json();
  },

  // Reports
  async getDashboardMetrics(): Promise<{ metrics: DashboardMetrics }> {
    const res = await fetch('/api/reports/summary');
    return res.json();
  },

  // Admin
  async getAdminUsers(): Promise<{ users: User[] }> {
    const res = await fetch('/api/admin/users');
    return res.json();
  },

  async createAdminUser(data: any): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateAdminUser(id: string, data: any): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteAdminUser(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Department Admin CRUD
  async createDepartment(data: any): Promise<{ success: boolean; department: any }> {
    const res = await fetch('/api/admin/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateDepartment(id: string, data: any): Promise<{ success: boolean; department: any }> {
    const res = await fetch(`/api/admin/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteDepartment(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/departments/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Service Catalog Admin CRUD
  async createServiceCatalogItem(data: any): Promise<{ success: boolean; item: any }> {
    const res = await fetch('/api/admin/service-catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateServiceCatalogItem(id: string, data: any): Promise<{ success: boolean; item: any }> {
    const res = await fetch(`/api/admin/service-catalog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteServiceCatalogItem(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/service-catalog/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // Assignment Groups Admin CRUD
  async createGroup(data: any): Promise<{ success: boolean; group: any }> {
    const res = await fetch('/api/admin/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateGroup(id: string, data: any): Promise<{ success: boolean; group: any }> {
    const res = await fetch(`/api/admin/groups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteGroup(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/admin/groups/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  // SLA & Notification Template updates
  async updateSLA(priority: string, data: any): Promise<{ success: boolean; sla: any }> {
    const res = await fetch(`/api/admin/sla/${priority}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateNotificationTemplate(id: string, data: any): Promise<{ success: boolean; template: any }> {
    const res = await fetch(`/api/admin/notification-templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getAdminConfig(): Promise<any> {
    const res = await fetch('/api/admin/config');
    return res.json();
  },

  async resetDemo(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/reset-demo', { method: 'POST' });
    return res.json();
  },
};
