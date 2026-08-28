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

const getHeaders = (userId?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (userId) {
    headers['x-user-id'] = userId;
  }
  return headers;
};

/**
 * Robust JSON request wrapper that validates response codes and Content-Type,
 * preventing `Unexpected token 'T', "The page c"... is not valid JSON` when an HTML
 * 404/500 or fallback page is returned.
 */
async function fetchJson<T>(url: string, options?: RequestInit, fallback?: T): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Request failed with status ${res.status}`);
      }
      return data as T;
    }

    // If server returned non-JSON (e.g., HTML fallback or plain text error)
    const text = await res.text();
    if (!res.ok) {
      console.warn(`[ITSM API] Non-JSON error (${res.status}) on ${url}:`, text.slice(0, 100));
      if (fallback !== undefined) return fallback;
      throw new Error(`Server returned ${res.status}: ${res.statusText || 'Response was not JSON'}`);
    }

    // If ok but not JSON
    try {
      return JSON.parse(text) as T;
    } catch {
      if (fallback !== undefined) return fallback;
      throw new Error(`Unexpected non-JSON response from ${url}`);
    }
  } catch (err: any) {
    console.error(`[ITSM API Error] ${url}:`, err.message || err);
    if (fallback !== undefined) {
      return fallback;
    }
    throw err;
  }
}

export const api = {
  // Auth
  async login(email: string, password?: string): Promise<{ success: boolean; user: User; token: string }> {
    return fetchJson<{ success: boolean; user: User; token: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, password }),
      }
    );
  },

  async getMe(userId?: string): Promise<{ user: User }> {
    return fetchJson<{ user: User }>(
      '/api/auth/me',
      { headers: getHeaders(userId) },
      {
        user: {
          id: userId || 'usr-admin',
          name: 'Ashok Varma',
          email: 'ashok.varma@csc.gov.in',
          role: 'ADMIN',
          departmentName: 'Technology & Enterprise IT',
          locationName: 'HQ New Delhi',
          phone: '+91 98100 11223',
          employeeCode: 'CSC-1001',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      }
    );
  },

  async switchRole(role: UserRole): Promise<{ user: User }> {
    return fetchJson<{ user: User }>('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ role }),
    });
  },

  // Master Data
  async getDepartments(): Promise<{ departments: any[] }> {
    return fetchJson<{ departments: any[] }>('/api/departments', { headers: getHeaders() }, { departments: [] });
  },

  async getLocations(): Promise<{ locations: any[] }> {
    return fetchJson<{ locations: any[] }>('/api/locations', { headers: getHeaders() }, { locations: [] });
  },

  async getGroups(): Promise<{ groups: any[] }> {
    return fetchJson<{ groups: any[] }>('/api/groups', { headers: getHeaders() }, { groups: [] });
  },

  async getCategories(): Promise<{ categories: any[] }> {
    return fetchJson<{ categories: any[] }>('/api/categories', { headers: getHeaders() }, { categories: [] });
  },

  async getServiceCatalog(): Promise<{ items: ServiceCatalogItem[] }> {
    return fetchJson<{ items: ServiceCatalogItem[] }>('/api/service-catalog', { headers: getHeaders() }, { items: [] });
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
    return fetchJson<{ tickets: Ticket[] }>(
      `/api/tickets?${query.toString()}`,
      { headers: getHeaders() },
      { tickets: [] }
    );
  },

  async getTicketById(id: string): Promise<{ ticket: Ticket }> {
    return fetchJson<{ ticket: Ticket }>(`/api/tickets/${id}`, { headers: getHeaders() });
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
    return fetchJson<{ success: boolean; ticket: Ticket }>('/api/tickets', {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify({ ...data, requesterId: userId }),
    });
  },

  async assignTicket(
    id: string,
    data: { groupId?: string; technicianId?: string },
    userId?: string
  ): Promise<{ success: boolean; ticket: Ticket }> {
    return fetchJson<{ success: boolean; ticket: Ticket }>(`/api/tickets/${id}/assign`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
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
    return fetchJson<{ success: boolean; ticket: Ticket }>(`/api/tickets/${id}/approve-step`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(payload),
    });
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
    return fetchJson<{ success: boolean; ticket: Ticket }>(`/api/tickets/${id}/assign-concern-team`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(payload),
    });
  },

  async updateTicketStatus(
    id: string,
    data: { status: TicketStatus; comment?: string },
    userId?: string
  ): Promise<{ success: boolean; ticket: Ticket }> {
    return fetchJson<{ success: boolean; ticket: Ticket }>(`/api/tickets/${id}/status`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
  },

  async addComment(
    id: string,
    data: { content: string; isInternal: boolean },
    userId?: string
  ): Promise<{ success: boolean; comment: TicketComment }> {
    return fetchJson<{ success: boolean; comment: TicketComment }>(`/api/tickets/${id}/comments`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
  },

  async addTask(id: string, title: string, assignedToName?: string): Promise<{ success: boolean; task: TicketTask }> {
    return fetchJson<{ success: boolean; task: TicketTask }>(`/api/tickets/${id}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ title, assignedToName }),
    });
  },

  async toggleTask(ticketId: string, taskId: string): Promise<{ success: boolean; task: TicketTask }> {
    return fetchJson<{ success: boolean; task: TicketTask }>(`/api/tickets/${ticketId}/tasks/${taskId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });
  },

  async resolveTicket(id: string, solution: string, userId?: string): Promise<{ success: boolean; ticket: Ticket }> {
    return fetchJson<{ success: boolean; ticket: Ticket }>(`/api/tickets/${id}/resolve`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify({ solution }),
    });
  },

  async convertTicketToKB(id: string, userId?: string): Promise<{ success: boolean; article: KnowledgeArticle }> {
    return fetchJson<{ success: boolean; article: KnowledgeArticle }>(`/api/tickets/${id}/convert-to-kb`, {
      method: 'POST',
      headers: getHeaders(userId),
    });
  },

  // Access Requests
  async getAccessRequests(): Promise<{ accessRequests: AccessRequest[] }> {
    return fetchJson<{ accessRequests: AccessRequest[] }>('/api/access-requests', { headers: getHeaders() }, { accessRequests: [] });
  },

  async createAccessRequest(data: any, userId?: string): Promise<{ success: boolean; accessRequest: AccessRequest }> {
    return fetchJson<{ success: boolean; accessRequest: AccessRequest }>('/api/access-requests', {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
  },

  async approveAccessRequest(
    id: string,
    data: { stageNumber: number; comments?: string },
    userId?: string
  ): Promise<{ success: boolean; accessRequest: AccessRequest }> {
    return fetchJson<{ success: boolean; accessRequest: AccessRequest }>(`/api/access-requests/${id}/approve`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
  },

  async rejectAccessRequest(
    id: string,
    data: { comments: string },
    userId?: string
  ): Promise<{ success: boolean; accessRequest: AccessRequest }> {
    return fetchJson<{ success: boolean; accessRequest: AccessRequest }>(`/api/access-requests/${id}/reject`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
  },

  // Changes
  async getChanges(): Promise<{ changes: ChangeRequest[] }> {
    return fetchJson<{ changes: ChangeRequest[] }>('/api/changes', { headers: getHeaders() }, { changes: [] });
  },

  async createChange(data: any, userId?: string): Promise<{ success: boolean; change: ChangeRequest }> {
    return fetchJson<{ success: boolean; change: ChangeRequest }>('/api/changes', {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
  },

  // Problems
  async getProblems(): Promise<{ problems: ProblemRecord[] }> {
    return fetchJson<{ problems: ProblemRecord[] }>('/api/problems', { headers: getHeaders() }, { problems: [] });
  },

  async createProblem(data: any, userId?: string): Promise<{ success: boolean; problem: ProblemRecord }> {
    return fetchJson<{ success: boolean; problem: ProblemRecord }>('/api/problems', {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
  },

  // Assets
  async getAssets(params?: { type?: string; status?: string; search?: string }): Promise<{ assets: Asset[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.set(k, v);
      });
    }
    return fetchJson<{ assets: Asset[] }>(`/api/assets?${query.toString()}`, { headers: getHeaders() }, { assets: [] });
  },

  async createAsset(data: any): Promise<{ success: boolean; asset: Asset }> {
    return fetchJson<{ success: boolean; asset: Asset }>('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
  },

  // Knowledge Base
  async getKBArticles(search?: string, category?: string): Promise<{ articles: KnowledgeArticle[] }> {
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (category) query.set('category', category);
    return fetchJson<{ articles: KnowledgeArticle[] }>(`/api/kb?${query.toString()}`, { headers: getHeaders() }, { articles: [] });
  },

  async createKBArticle(data: any, userId?: string): Promise<{ success: boolean; article: KnowledgeArticle }> {
    return fetchJson<{ success: boolean; article: KnowledgeArticle }>('/api/kb', {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
  },

  // Audit Logs
  async getAuditLogs(params?: { module?: string; action?: string; search?: string }): Promise<{ logs: AuditLog[] }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.set(k, v);
      });
    }
    return fetchJson<{ logs: AuditLog[] }>(`/api/audit-logs?${query.toString()}`, { headers: getHeaders() }, { logs: [] });
  },

  // Reports
  async getDashboardMetrics(): Promise<{ metrics: DashboardMetrics }> {
    return fetchJson<{ metrics: DashboardMetrics }>(
      '/api/reports/summary',
      { headers: getHeaders() },
      {
        metrics: {
          totalTickets: 0,
          openTickets: 0,
          newTickets: 0,
          inProgressTickets: 0,
          pendingTickets: 0,
          resolvedTickets: 0,
          closedTickets: 0,
          slaBreached: 0,
          slaAtRisk: 0,
          criticalTickets: 0,
          highPriorityTickets: 0,
          pendingApprovals: 0,
          activeAssets: 0,
          openProblems: 0,
          activeChanges: 0,
          avgResolutionTimeHours: 2.5,
          avgResponseTimeMinutes: 15,
          slaCompliancePercentage: 98.5,
          ticketsByStatus: [],
          ticketsByPriority: [],
          ticketsByCategory: [],
          ticketsByDepartment: [],
          ticketsByTechnician: [],
          ticketsTrend: [],
        },
      }
    );
  },

  // Admin
  async getAdminUsers(): Promise<{ users: User[] }> {
    return fetchJson<{ users: User[] }>('/api/admin/users', { headers: getHeaders() }, { users: [] });
  },

  async createAdminUser(data: any): Promise<{ success: boolean; user: User }> {
    return fetchJson<{ success: boolean; user: User }>('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateAdminUser(id: string, data: any): Promise<{ success: boolean; user: User }> {
    return fetchJson<{ success: boolean; user: User }>(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async deleteAdminUser(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/api/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  // Department Admin CRUD
  async createDepartment(data: any): Promise<{ success: boolean; department: any }> {
    return fetchJson<{ success: boolean; department: any }>('/api/admin/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateDepartment(id: string, data: any): Promise<{ success: boolean; department: any }> {
    return fetchJson<{ success: boolean; department: any }>(`/api/admin/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async deleteDepartment(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/api/admin/departments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  // Service Catalog Admin CRUD
  async createServiceCatalogItem(data: any): Promise<{ success: boolean; item: any }> {
    return fetchJson<{ success: boolean; item: any }>('/api/admin/service-catalog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateServiceCatalogItem(id: string, data: any): Promise<{ success: boolean; item: any }> {
    return fetchJson<{ success: boolean; item: any }>(`/api/admin/service-catalog/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async deleteServiceCatalogItem(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/api/admin/service-catalog/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  // Assignment Groups Admin CRUD
  async createGroup(data: any): Promise<{ success: boolean; group: any }> {
    return fetchJson<{ success: boolean; group: any }>('/api/admin/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateGroup(id: string, data: any): Promise<{ success: boolean; group: any }> {
    return fetchJson<{ success: boolean; group: any }>(`/api/admin/groups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async deleteGroup(id: string): Promise<{ success: boolean }> {
    return fetchJson<{ success: boolean }>(`/api/admin/groups/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  // SLA & Notification Template updates
  async updateSLA(priority: string, data: any): Promise<{ success: boolean; sla: any }> {
    return fetchJson<{ success: boolean; sla: any }>(`/api/admin/sla/${priority}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async updateNotificationTemplate(id: string, data: any): Promise<{ success: boolean; template: any }> {
    return fetchJson<{ success: boolean; template: any }>(`/api/admin/notification-templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });
  },

  async getAdminConfig(): Promise<any> {
    return fetchJson<any>('/api/admin/config', { headers: getHeaders() }, {});
  },

  async resetDemo(): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>('/api/admin/reset-demo', {
      method: 'POST',
      headers: getHeaders(),
    });
  },
};
