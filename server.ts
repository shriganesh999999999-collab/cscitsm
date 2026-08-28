// CSC e-Governance Services India Ltd. - Enterprise ITSM Backend API Server
// Compliant with Express + Vite Middleware, REST Standards, and Vercel/On-Premise portability

import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { itsmStorage } from './server/storage';
import { UserRole, Priority, Impact, Urgency } from './src/types/itsm';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logger & security headers middleware
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'HEALTHY',
      service: 'CSC ITSM Enterprise API Server',
      organization: 'CSC e-Governance Services India Ltd.',
      timestamp: new Date().toISOString(),
      version: '1.0.0-enterprise',
    });
  });

  // --- Auth APIs ---
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email or Username is required' });
    }

    const user = itsmStorage.getUserByEmail(email);
    if (!user) {
      // Create audit log for failed login
      itsmStorage.addAuditLog({
        userName: email,
        userRole: 'UNKNOWN',
        action: 'FAILED_LOGIN_ATTEMPT',
        module: 'AUTH',
        objectType: 'User',
        objectId: email,
        details: 'User account not found',
        ipAddress: req.ip || '10.120.1.100',
      });
      return res.status(401).json({ error: 'Invalid credentials or user not registered in CSC Directory' });
    }

    itsmStorage.addAuditLog({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'USER_LOGIN',
      module: 'AUTH',
      objectType: 'User',
      objectId: user.id,
      details: 'Successful authentication via CSC Enterprise Auth',
      ipAddress: req.ip || '10.120.1.100',
    });

    return res.json({
      success: true,
      token: `csc_token_${user.id}_${Date.now()}`,
      user,
    });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    // Default to admin or specified user ID header
    const userId = (req.headers['x-user-id'] as string) || 'usr-admin';
    const user = itsmStorage.getUserById(userId) || itsmStorage.getUsers()[0];
    res.json({ user });
  });

  app.post('/api/auth/switch-role', (req: Request, res: Response) => {
    const { role } = req.body as { role: UserRole };
    const allUsers = itsmStorage.getUsers();
    const targetUser = allUsers.find((u) => u.role === role) || allUsers[0];
    res.json({ user: targetUser });
  });

  // --- Master Data APIs ---
  app.get('/api/departments', (req: Request, res: Response) => {
    res.json({ departments: itsmStorage.getDepartments() });
  });

  app.get('/api/locations', (req: Request, res: Response) => {
    res.json({ locations: itsmStorage.getLocations() });
  });

  app.get('/api/groups', (req: Request, res: Response) => {
    res.json({ groups: itsmStorage.getGroups() });
  });

  app.get('/api/categories', (req: Request, res: Response) => {
    res.json({ categories: itsmStorage.getCategories() });
  });

  app.get('/api/service-catalog', (req: Request, res: Response) => {
    res.json({ items: itsmStorage.getServiceCatalog() });
  });

  // --- Ticket APIs ---
  app.get('/api/tickets', (req: Request, res: Response) => {
    const { type, status, priority, departmentId, assignedToId, requesterId, search } = req.query;
    const tickets = itsmStorage.getTickets({
      type: type as string,
      status: status as string,
      priority: priority as string,
      departmentId: departmentId as string,
      assignedToId: assignedToId as string,
      requesterId: requesterId as string,
      search: search as string,
    });
    res.json({ tickets });
  });

  app.get('/api/tickets/:id', (req: Request, res: Response) => {
    const ticket = itsmStorage.getTicketById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket record not found' });
    }
    return res.json({ ticket });
  });

  app.post('/api/tickets', (req: Request, res: Response) => {
    const { subject, description, type, impact, urgency, categoryName, subcategoryName, departmentId, locationId, assetId, requesterId } = req.body;
    if (!subject || !description) {
      return res.status(400).json({ error: 'Subject and Description are required' });
    }

    const currentUserId = requesterId || (req.headers['x-user-id'] as string) || 'usr-emp';
    const ticket = itsmStorage.createTicket({
      subject,
      description,
      type: type || 'INCIDENT',
      impact: impact as Impact,
      urgency: urgency as Urgency,
      categoryName,
      subcategoryName,
      departmentId,
      locationId,
      assetId,
      requesterId: currentUserId,
      clientIp: req.ip || '10.120.1.100',
    });

    return res.status(201).json({ success: true, ticket });
  });

  app.post('/api/tickets/:id/assign', (req: Request, res: Response) => {
    const { groupId, technicianId } = req.body;
    const actorId = (req.headers['x-user-id'] as string) || 'usr-admin';
    const actorUser = itsmStorage.getUserById(actorId);

    const ticket = itsmStorage.assignTicket(req.params.id, groupId, technicianId, actorUser);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.json({ success: true, ticket });
  });

  // Dual CISO / Infra Head Approval via Email / WhatsApp / Portal
  app.post('/api/tickets/:id/approve-step', (req: Request, res: Response) => {
    const { roleOrStepId, comments, channel } = req.body;
    const actorId = (req.headers['x-user-id'] as string) || 'usr-ciso';
    const actorUser = itsmStorage.getUserById(actorId);

    const ticket = itsmStorage.approveTicketStep(
      req.params.id,
      roleOrStepId,
      comments,
      channel || 'PORTAL',
      actorUser
    );
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.json({ success: true, ticket });
  });

  // Operations Manager Assign Concern Team
  app.post('/api/tickets/:id/assign-concern-team', (req: Request, res: Response) => {
    const { groupId, technicianId, opsInstructions } = req.body;
    if (!groupId) {
      return res.status(400).json({ error: 'Concern team assignment group is required' });
    }
    const actorId = (req.headers['x-user-id'] as string) || 'usr-ops-mgr';
    const actorUser = itsmStorage.getUserById(actorId);

    const ticket = itsmStorage.assignConcernTeam(
      req.params.id,
      { groupId, technicianId, opsInstructions },
      actorUser
    );
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.json({ success: true, ticket });
  });

  app.post('/api/tickets/:id/status', (req: Request, res: Response) => {
    const { status, comment } = req.body;
    const actorId = (req.headers['x-user-id'] as string) || 'usr-admin';
    const actorUser = itsmStorage.getUserById(actorId);

    const ticket = itsmStorage.updateTicketStatus(req.params.id, status, comment, actorUser);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.json({ success: true, ticket });
  });

  app.post('/api/tickets/:id/comments', (req: Request, res: Response) => {
    const { content, isInternal } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Comment content cannot be empty' });
    }

    const actorId = (req.headers['x-user-id'] as string) || 'usr-emp';
    const actorUser = itsmStorage.getUserById(actorId) || itsmStorage.getUsers()[0];

    const comment = itsmStorage.addComment(req.params.id, content, Boolean(isInternal), actorUser, req.ip);
    if (!comment) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.json({ success: true, comment });
  });

  app.post('/api/tickets/:id/tasks', (req: Request, res: Response) => {
    const { title, assignedToName } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const task = itsmStorage.addTask(req.params.id, title, assignedToName);
    if (!task) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.json({ success: true, task });
  });

  app.post('/api/tickets/:id/tasks/:taskId/toggle', (req: Request, res: Response) => {
    const task = itsmStorage.toggleTask(req.params.id, req.params.taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task or Ticket not found' });
    }
    return res.json({ success: true, task });
  });

  app.post('/api/tickets/:id/resolve', (req: Request, res: Response) => {
    const { solution } = req.body;
    if (!solution) {
      return res.status(400).json({ error: 'Resolution summary is required to resolve a ticket' });
    }

    const actorId = (req.headers['x-user-id'] as string) || 'usr-l2';
    const actorUser = itsmStorage.getUserById(actorId) || itsmStorage.getUsers()[0];

    const ticket = itsmStorage.resolveTicket(req.params.id, solution, actorUser);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.json({ success: true, ticket });
  });

  app.post('/api/tickets/:id/convert-to-kb', (req: Request, res: Response) => {
    const actorId = (req.headers['x-user-id'] as string) || 'usr-l2';
    const actorUser = itsmStorage.getUserById(actorId) || itsmStorage.getUsers()[0];

    const kb = itsmStorage.convertTicketToKB(req.params.id, actorUser);
    if (!kb) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    return res.json({ success: true, article: kb });
  });

  // --- Production / UAT Access Requests ---
  app.get('/api/access-requests', (req: Request, res: Response) => {
    res.json({ accessRequests: itsmStorage.getAccessRequests() });
  });

  app.post('/api/access-requests', (req: Request, res: Response) => {
    const { requesterId, applicationName, environment, accessType, validFrom, validTo, businessJustification } = req.body;
    if (!applicationName || !environment || !validFrom || !validTo || !businessJustification) {
      return res.status(400).json({ error: 'All access request fields are mandatory' });
    }

    const actorId = requesterId || (req.headers['x-user-id'] as string) || 'usr-emp';
    const accessRequest = itsmStorage.createAccessRequest({
      requesterId: actorId,
      applicationName,
      environment,
      accessType: accessType || 'READ_ONLY',
      validFrom,
      validTo,
      businessJustification,
    });

    return res.status(201).json({ success: true, accessRequest });
  });

  app.post('/api/access-requests/:id/approve', (req: Request, res: Response) => {
    const { stageNumber, comments } = req.body;
    const actorId = (req.headers['x-user-id'] as string) || 'usr-mgr';
    const approver = itsmStorage.getUserById(actorId) || itsmStorage.getUsers()[0];

    const reqRecord = itsmStorage.approveAccessRequest(req.params.id, stageNumber || 1, approver, comments);
    if (!reqRecord) {
      return res.status(404).json({ error: 'Access Request not found' });
    }
    return res.json({ success: true, accessRequest: reqRecord });
  });

  app.post('/api/access-requests/:id/reject', (req: Request, res: Response) => {
    const { comments } = req.body;
    const actorId = (req.headers['x-user-id'] as string) || 'usr-mgr';
    const approver = itsmStorage.getUserById(actorId) || itsmStorage.getUsers()[0];

    const reqRecord = itsmStorage.rejectAccessRequest(req.params.id, approver, comments || 'Rejected by approver');
    if (!reqRecord) {
      return res.status(404).json({ error: 'Access Request not found' });
    }
    return res.json({ success: true, accessRequest: reqRecord });
  });

  // --- Change Management (CAB) ---
  app.get('/api/changes', (req: Request, res: Response) => {
    res.json({ changes: itsmStorage.getChanges() });
  });

  app.post('/api/changes', (req: Request, res: Response) => {
    const body = req.body;
    if (!body.title || !body.justification || !body.implementationPlan) {
      return res.status(400).json({ error: 'Title, Justification, and Implementation Plan are required' });
    }

    const actorId = (req.headers['x-user-id'] as string) || 'usr-chg';
    const actor = itsmStorage.getUserById(actorId) || itsmStorage.getUsers()[0];

    const change = itsmStorage.createChange({
      title: body.title,
      description: body.description || body.title,
      type: body.type || 'NORMAL',
      status: body.status || 'ASSESSMENT',
      riskLevel: body.riskLevel || 'MEDIUM',
      impactLevel: body.impactLevel || 'MEDIUM',
      justification: body.justification,
      implementationPlan: body.implementationPlan,
      rollbackPlan: body.rollbackPlan || 'Revert to last configuration backup.',
      testingPlan: body.testingPlan || 'Verify core services response.',
      plannedStartTime: body.plannedStartTime || new Date().toISOString(),
      plannedEndTime: body.plannedEndTime || new Date(Date.now() + 7200000).toISOString(),
      ownerId: actor.id,
      ownerName: actor.name,
      approvals: [
        {
          id: `ca-${Date.now()}-1`,
          stageNumber: 1,
          roleRequired: 'CHANGE_MANAGER',
          approverName: 'Neha Gupta (CAB Chair)',
          status: 'PENDING',
        },
      ],
      linkedTicketIds: body.linkedTicketIds || [],
    });

    return res.status(201).json({ success: true, change });
  });

  // --- Problem Management ---
  app.get('/api/problems', (req: Request, res: Response) => {
    res.json({ problems: itsmStorage.getProblems() });
  });

  app.post('/api/problems', (req: Request, res: Response) => {
    const body = req.body;
    if (!body.title || !body.description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const actorId = (req.headers['x-user-id'] as string) || 'usr-prb';
    const actor = itsmStorage.getUserById(actorId) || itsmStorage.getUsers()[0];

    const problem = itsmStorage.createProblem({
      title: body.title,
      description: body.description,
      status: body.status || 'INVESTIGATING',
      impact: body.impact || 'MEDIUM',
      rootCause: body.rootCause,
      workaround: body.workaround,
      correctiveAction: body.correctiveAction,
      preventiveAction: body.preventiveAction,
      ownerId: actor.id,
      ownerName: actor.name,
      relatedTicketNumbers: body.relatedTicketNumbers || [],
    });

    return res.status(201).json({ success: true, problem });
  });

  // --- Asset Management (CMDB) ---
  app.get('/api/assets', (req: Request, res: Response) => {
    const { type, status, search } = req.query;
    const assets = itsmStorage.getAssets({
      type: type as string,
      status: status as string,
      search: search as string,
    });
    res.json({ assets });
  });

  app.post('/api/assets', (req: Request, res: Response) => {
    const body = req.body;
    if (!body.name || !body.type) {
      return res.status(400).json({ error: 'Asset Name and Type are required' });
    }

    const asset = itsmStorage.createAsset({
      name: body.name,
      type: body.type,
      status: body.status || 'ACTIVE',
      serialNumber: body.serialNumber,
      ipAddress: body.ipAddress,
      hostname: body.hostname,
      vendor: body.vendor,
      model: body.model,
      departmentName: body.departmentName,
      locationName: body.locationName,
      ownerName: body.ownerName,
      purchaseDate: body.purchaseDate,
      warrantyExpiry: body.warrantyExpiry,
      specs: body.specs,
    });

    return res.status(201).json({ success: true, asset });
  });

  // --- Knowledge Base ---
  app.get('/api/kb', (req: Request, res: Response) => {
    const { search, category } = req.query;
    const articles = itsmStorage.getKnowledgeArticles(search as string, category as string);
    res.json({ articles });
  });

  app.post('/api/kb', (req: Request, res: Response) => {
    const body = req.body;
    if (!body.title || !body.content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const actorId = (req.headers['x-user-id'] as string) || 'usr-l2';
    const actor = itsmStorage.getUserById(actorId) || itsmStorage.getUsers()[0];

    const article = itsmStorage.createKnowledgeArticle({
      title: body.title,
      category: body.category || 'Troubleshooting',
      summary: body.summary,
      content: body.content,
      authorName: actor.name,
      version: '1.0',
      isPublished: true,
      reviewDate: body.reviewDate,
    });

    return res.status(201).json({ success: true, article });
  });

  // --- Audit Logs ---
  app.get('/api/audit-logs', (req: Request, res: Response) => {
    const { module, action, search } = req.query;
    const logs = itsmStorage.getAuditLogs({
      module: module as string,
      action: action as string,
      search: search as string,
    });
    res.json({ logs });
  });

  // --- Reports & Metrics ---
  app.get('/api/reports/summary', (req: Request, res: Response) => {
    const metrics = itsmStorage.getDashboardMetrics();
    res.json({ metrics });
  });

  // --- Administration & Configuration ---
  app.get('/api/admin/users', (req: Request, res: Response) => {
    res.json({ users: itsmStorage.getUsers() });
  });

  app.post('/api/admin/users', (req: Request, res: Response) => {
    const { name, email, role, departmentName, locationName, phone, employeeCode } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    const newUser = itsmStorage.createUser({
      name,
      email,
      role,
      departmentName,
      locationName,
      phone,
      employeeCode,
      isActive: true,
    });

    return res.status(201).json({ success: true, user: newUser });
  });

  app.put('/api/admin/users/:id', (req: Request, res: Response) => {
    const updated = itsmStorage.updateUser(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ success: true, user: updated });
  });

  app.delete('/api/admin/users/:id', (req: Request, res: Response) => {
    const deleted = itsmStorage.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ success: true, message: 'User deleted successfully' });
  });

  // Departments CRUD
  app.post('/api/admin/departments', (req: Request, res: Response) => {
    const { code, name, headName, headEmail, headPhone, cisoName, cisoEmail, cisoPhone, infraHeadName, infraHeadEmail, infraHeadPhone, opsManagerName, opsManagerEmail, opsManagerPhone, requiresDualApproval, approvalChannels, description } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Department code and name are required' });
    }
    const dept = itsmStorage.createDepartment({
      code,
      name,
      headName,
      headEmail,
      headPhone,
      cisoName,
      cisoEmail,
      cisoPhone,
      infraHeadName,
      infraHeadEmail,
      infraHeadPhone,
      opsManagerName,
      opsManagerEmail,
      opsManagerPhone,
      requiresDualApproval: Boolean(requiresDualApproval),
      approvalChannels: approvalChannels || ['EMAIL', 'WHATSAPP'],
      description,
    });
    return res.status(201).json({ success: true, department: dept });
  });

  app.put('/api/admin/departments/:id', (req: Request, res: Response) => {
    const updated = itsmStorage.updateDepartment(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Department not found' });
    }
    return res.json({ success: true, department: updated });
  });

  app.delete('/api/admin/departments/:id', (req: Request, res: Response) => {
    const deleted = itsmStorage.deleteDepartment(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Department not found' });
    }
    return res.json({ success: true, message: 'Department deleted' });
  });

  // Service Catalog Items CRUD
  app.post('/api/admin/service-catalog', (req: Request, res: Response) => {
    const { code, title, category, description, iconName, estimatedDelivery, defaultPriority, requiresApproval, approvalStages, fields } = req.body;
    if (!title || !category) {
      return res.status(400).json({ error: 'Title and category are required' });
    }
    const item = itsmStorage.createServiceCatalogItem({
      code: code || `SC-${Date.now().toString().slice(-4)}`,
      title,
      category,
      description: description || '',
      iconName: iconName || 'Server',
      estimatedDelivery: estimatedDelivery || '1 Business Day',
      defaultPriority: defaultPriority || 'MEDIUM',
      requiresApproval: requiresApproval !== undefined ? requiresApproval : true,
      approvalStages: approvalStages || ['CISO Approval', 'Infra Head Approval', 'Operations Assignment'],
      fields: fields || [],
    });
    return res.status(201).json({ success: true, item });
  });

  app.put('/api/admin/service-catalog/:id', (req: Request, res: Response) => {
    const updated = itsmStorage.updateServiceCatalogItem(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Service catalog item not found' });
    }
    return res.json({ success: true, item: updated });
  });

  app.delete('/api/admin/service-catalog/:id', (req: Request, res: Response) => {
    const deleted = itsmStorage.deleteServiceCatalogItem(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Service catalog item not found' });
    }
    return res.json({ success: true, message: 'Catalog item deleted' });
  });

  // Assignment Groups CRUD
  app.post('/api/admin/groups', (req: Request, res: Response) => {
    const { name, description, email, memberIds } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }
    const group = itsmStorage.createGroup({
      name,
      description: description || '',
      email: email || '',
      memberIds: memberIds || [],
    });
    return res.status(201).json({ success: true, group });
  });

  app.put('/api/admin/groups/:id', (req: Request, res: Response) => {
    const updated = itsmStorage.updateGroup(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Group not found' });
    }
    return res.json({ success: true, group: updated });
  });

  app.delete('/api/admin/groups/:id', (req: Request, res: Response) => {
    const deleted = itsmStorage.deleteGroup(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Group not found' });
    }
    return res.json({ success: true, message: 'Group deleted' });
  });

  // SLA & Notification Template updates
  app.put('/api/admin/sla/:priority', (req: Request, res: Response) => {
    const priority = req.params.priority.toUpperCase() as Priority;
    const updated = itsmStorage.updateSLADefinition(priority, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'SLA definition not found' });
    }
    return res.json({ success: true, sla: updated });
  });

  app.put('/api/admin/notification-templates/:id', (req: Request, res: Response) => {
    const updated = itsmStorage.updateNotificationTemplate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Notification template not found' });
    }
    return res.json({ success: true, template: updated });
  });

  app.get('/api/admin/config', (req: Request, res: Response) => {
    res.json({
      slaDefinitions: itsmStorage.getSLADefinitions(),
      priorityMatrix: itsmStorage.getPriorityMatrix(),
      autoAssignmentRules: itsmStorage.getAutoAssignmentRules(),
      notificationTemplates: itsmStorage.getNotificationTemplates(),
      categories: itsmStorage.getCategories(),
      groups: itsmStorage.getGroups(),
      departments: itsmStorage.getDepartments(),
      locations: itsmStorage.getLocations(),
    });
  });

  app.post('/api/admin/reset-demo', (req: Request, res: Response) => {
    itsmStorage.seedInitialData();
    res.json({ success: true, message: 'CSC ITSM Demo Database successfully re-seeded with official records.' });
  });

  // --- Vite Middleware or Static Production Serving ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` CSC e-Governance Services India Ltd. - CSC ITSM Portal`);
    console.log(` Server running on http://0.0.0.0:${PORT}`);
    console.log(` Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start CSC ITSM Server:', err);
  process.exit(1);
});
