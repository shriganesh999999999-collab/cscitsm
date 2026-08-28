// CSC e-Governance Services India Ltd. - ITSM Core Type Definitions

export type UserRole =
  | 'EMPLOYEE'
  | 'SERVICE_DESK'
  | 'L2_ENGINEER'
  | 'L3_SPECIALIST'
  | 'IT_MANAGER'
  | 'CHANGE_MANAGER'
  | 'PROBLEM_MANAGER'
  | 'ASSET_MANAGER'
  | 'AUDITOR'
  | 'ADMIN';

export type TicketType = 'INCIDENT' | 'SERVICE_REQUEST' | 'ACCESS_REQUEST';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Impact = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type Urgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TicketStatus =
  | 'NEW'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'AWAITING_USER'
  | 'AWAITING_APPROVAL'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REOPENED'
  | 'CANCELLED';

export type SLAState = 'HEALTHY' | 'AT_RISK' | 'BREACHED' | 'MET';

export type ChangeType = 'STANDARD' | 'NORMAL' | 'EMERGENCY';
export type ChangeStatus =
  | 'DRAFT'
  | 'ASSESSMENT'
  | 'APPROVAL'
  | 'SCHEDULED'
  | 'IMPLEMENTATION'
  | 'VALIDATION'
  | 'COMPLETED'
  | 'FAILED'
  | 'ROLLED_BACK'
  | 'CANCELLED';

export type ProblemStatus =
  | 'LOGGED'
  | 'INVESTIGATING'
  | 'ROOT_CAUSE_IDENTIFIED'
  | 'WORKAROUND_FOUND'
  | 'KNOWN_ERROR'
  | 'RESOLVED'
  | 'CLOSED';

export type AssetStatus = 'ACTIVE' | 'IN_STOCK' | 'MAINTENANCE' | 'RETIRED' | 'DECOMMISSIONED';

export type AssetType =
  | 'SERVER'
  | 'VM'
  | 'LAPTOP'
  | 'DESKTOP'
  | 'NETWORK_SWITCH'
  | 'FIREWALL'
  | 'ROUTER'
  | 'DATABASE'
  | 'APPLICATION'
  | 'STORAGE'
  | 'PRINTER'
  | 'OTHER';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  employeeCode?: string;
  role: UserRole;
  phone?: string;
  departmentId?: string;
  departmentName?: string;
  locationId?: string;
  locationName?: string;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  headName?: string;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  isDC?: boolean;
}

export interface AssignmentGroup {
  id: string;
  name: string;
  description?: string;
  email?: string;
  memberIds: string[];
  members?: User[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  defaultGroupId?: string;
  subcategories: string[];
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  isInternal: boolean; // false = Public Reply, true = Internal Work Note
  ipAddress?: string;
  createdAt: string;
}

export type TicketWorkNote = TicketComment;

export interface TicketTask {
  id: string;
  ticketId: string;
  title: string;
  description?: string;
  assignedToId?: string;
  assignedToName?: string;
  isCompleted: boolean;
  completedAt?: string;
  dueDate?: string;
  createdAt: string;
}

export interface TicketAttachment {
  id: string;
  ticketId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageKey: string;
  uploadedByName: string;
  createdAt: string;
  downloadUrl?: string;
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  userId?: string;
  userName: string;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  comment?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface ApprovalStep {
  id: string;
  stageNumber: number;
  roleRequired: UserRole;
  approverId?: string;
  approverName?: string;
  status: ApprovalStatus;
  comments?: string;
  actionedAt?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string; // INC-2026-000001 or SR-2026-000001
  subject: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: Priority;
  impact: Impact;
  urgency: Urgency;

  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;

  assignedToId?: string;
  assignedToName?: string;

  assignmentGroupId?: string;
  assignmentGroupName?: string;

  departmentId?: string;
  departmentName?: string;

  locationId?: string;
  locationName?: string;

  categoryId?: string;
  categoryName?: string;

  subcategoryId?: string;
  subcategoryName?: string;

  assetId?: string;
  assetTag?: string;
  assetName?: string;

  problemId?: string;
  changeId?: string;

  // SLA tracking
  responseDueDate?: string;
  respondedAt?: string;
  resolutionDueDate?: string;
  resolvedAt?: string;
  closedAt?: string;
  reopenedAt?: string;
  slaState: SLAState;
  slaRemainingSeconds?: number;

  // Resolution Details
  solution?: string;
  solutionAccepted?: boolean;
  closeNotes?: string;

  // Nested & relation counts
  commentsCount?: number;
  workNotesCount?: number;
  tasksCount?: number;
  completedTasksCount?: number;
  attachmentsCount?: number;

  comments?: TicketComment[];
  tasks?: TicketTask[];
  attachments?: TicketAttachment[];
  timeline?: TicketHistory[];
  approvals?: ApprovalStep[];

  createdAt: string;
  updatedAt: string;
}

export interface AccessRequest {
  id: string;
  requestNumber: string; // ACC-2026-000001
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  departmentName: string;
  applicationName: string;
  environment: 'PRODUCTION' | 'UAT' | 'DR' | 'STAGING';
  accessType: 'READ_ONLY' | 'READ_WRITE' | 'ADMIN' | 'DATABASE_ACCESS' | 'SERVER_SSH' | 'VPN_REMOTE';
  validFrom: string;
  validTo: string;
  businessJustification: string;
  currentStage: number;
  status: ApprovalStatus;
  approvals: ApprovalStep[];
  ticketId?: string;
  ticketNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChangeRequest {
  id: string;
  changeNumber: string; // CR-2026-000001
  title: string;
  description: string;
  type: ChangeType;
  status: ChangeStatus;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  justification: string;
  implementationPlan: string;
  rollbackPlan: string;
  testingPlan: string;
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  ownerId: string;
  ownerName: string;
  approverNames?: string[];
  approvals?: ApprovalStep[];
  linkedTicketIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProblemRecord {
  id: string;
  problemNumber: string; // PRB-2026-000001
  title: string;
  description: string;
  status: ProblemStatus;
  impact: Impact;
  rootCause?: string;
  workaround?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  ownerId: string;
  ownerName: string;
  relatedTicketNumbers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  assetTag: string; // AST-0001
  name: string;
  type: AssetType;
  status: AssetStatus;
  serialNumber?: string;
  ipAddress?: string;
  hostname?: string;
  vendor?: string;
  model?: string;
  departmentName?: string;
  locationName?: string;
  ownerName?: string;
  purchaseDate?: string;
  warrantyExpiry?: string;
  specs?: string;
  linkedTicketCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeArticle {
  id: string;
  articleCode: string; // KB-0001
  title: string;
  category: 'SOP' | 'Troubleshooting' | 'How-To' | 'FAQ' | 'Security' | 'Infrastructure' | 'Application';
  content: string;
  summary?: string;
  authorName: string;
  version: string;
  isPublished: boolean;
  viewCount: number;
  tags?: string[];
  reviewDate?: string;
  sourceTicketNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userName: string;
  userRole: string;
  action: string; // LOGIN, CREATE, UPDATE, ASSIGN, STATUS_CHANGE, APPROVE, REJECT, ESCALATE
  module: 'TICKETS' | 'USERS' | 'ASSETS' | 'CHANGES' | 'PROBLEMS' | 'ACCESS_REQUESTS' | 'ADMIN' | 'AUTH' | 'KB';
  objectType: string;
  objectId: string;
  oldValue?: string;
  newValue?: string;
  details?: string;
  ipAddress: string;
  userAgent?: string;
}

export interface SLADefinition {
  id: string;
  priority: Priority;
  name: string;
  responseMinutes: number;
  resolveMinutes: number;
  businessHoursOnly: boolean;
  escLevel1Minutes?: number;
  escLevel2Minutes?: number;
  escLevel3Minutes?: number;
}

export interface PriorityMatrixRule {
  impact: Impact;
  urgency: Urgency;
  resultPriority: Priority;
}

export interface AutoAssignmentRule {
  id: string;
  categoryName: string;
  assignmentGroupName: string;
  defaultTechnicianId?: string;
}

export interface NotificationTemplate {
  id: string;
  event: string;
  channel: 'EMAIL' | 'WHATSAPP' | 'IN_APP';
  subjectTemplate?: string;
  bodyTemplate: string;
  isActive: boolean;
}

export interface DashboardMetrics {
  totalTickets: number;
  openTickets: number;
  newTickets: number;
  inProgressTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  slaBreached: number;
  slaAtRisk: number;
  criticalTickets: number;
  highPriorityTickets: number;
  pendingApprovals: number;
  activeAssets: number;
  openProblems: number;
  activeChanges: number;
  avgResolutionTimeHours: number;
  avgResponseTimeMinutes: number;
  slaCompliancePercentage: number;
  
  ticketsByStatus: { name: string; value: number; color: string }[];
  ticketsByPriority: { name: string; value: number; color: string }[];
  ticketsByCategory: { name: string; count: number }[];
  ticketsByDepartment: { name: string; count: number }[];
  ticketsByTechnician: { name: string; count: number; resolvedCount: number }[];
  ticketsTrend: { date: string; created: number; resolved: number }[];
}

export interface ServiceCatalogItem {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  iconName: string;
  estimatedDelivery: string;
  defaultPriority: Priority;
  requiresApproval: boolean;
  approvalStages?: string[];
  fields: {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'date' | 'radio';
    options?: string[];
    required: boolean;
    placeholder?: string;
  }[];
}
