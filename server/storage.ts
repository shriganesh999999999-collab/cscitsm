// CSC e-Governance Services India Ltd. - Enterprise ITSM In-Memory Storage & Repository Engine
// Designed for seamless Vercel / Cloud Run execution with full state operations and export readiness

import {
  User,
  Department,
  Location,
  AssignmentGroup,
  Category,
  Ticket,
  TicketComment,
  TicketWorkNote,
  TicketTask,
  TicketAttachment,
  TicketHistory,
  ApprovalStep,
  AccessRequest,
  ChangeRequest,
  ProblemRecord,
  Asset,
  KnowledgeArticle,
  AuditLog,
  SLADefinition,
  PriorityMatrixRule,
  AutoAssignmentRule,
  NotificationTemplate,
  DashboardMetrics,
  Priority,
  Impact,
  Urgency,
  TicketStatus,
  SLAState,
  UserRole,
  ServiceCatalogItem,
} from '../src/types/itsm';

export class ITSMStorage {
  private users: Map<string, User> = new Map();
  private departments: Map<string, Department> = new Map();
  private locations: Map<string, Location> = new Map();
  private groups: Map<string, AssignmentGroup> = new Map();
  private categories: Map<string, Category> = new Map();
  private tickets: Map<string, Ticket> = new Map();
  private accessRequests: Map<string, AccessRequest> = new Map();
  private changes: Map<string, ChangeRequest> = new Map();
  private problems: Map<string, ProblemRecord> = new Map();
  private assets: Map<string, Asset> = new Map();
  private knowledgeArticles: Map<string, KnowledgeArticle> = new Map();
  private auditLogs: AuditLog[] = [];
  private slaDefinitions: Map<Priority, SLADefinition> = new Map();
  private priorityMatrix: PriorityMatrixRule[] = [];
  private autoAssignmentRules: AutoAssignmentRule[] = [];
  private notificationTemplates: NotificationTemplate[] = [];
  private serviceCatalog: ServiceCatalogItem[] = [];

  private ticketCounter = 1000;
  private changeCounter = 100;
  private problemCounter = 50;
  private accessCounter = 200;
  private assetCounter = 500;
  private kbCounter = 100;

  constructor() {
    this.seedInitialData();
  }

  public seedInitialData() {
    this.users.clear();
    this.departments.clear();
    this.locations.clear();
    this.groups.clear();
    this.categories.clear();
    this.tickets.clear();
    this.accessRequests.clear();
    this.changes.clear();
    this.problems.clear();
    this.assets.clear();
    this.knowledgeArticles.clear();
    this.auditLogs = [];
    this.slaDefinitions.clear();
    this.priorityMatrix = [];
    this.autoAssignmentRules = [];
    this.notificationTemplates = [];
    this.serviceCatalog = [];

    // 1. Departments
    const depts: Department[] = [
      { id: 'dept-1', code: 'PMU', name: 'Project Management Unit', headName: 'Sanjay Kumar' },
      { id: 'dept-2', code: 'CYBER', name: 'Cyber Security Operations (CSOC)', headName: 'Vikram Aditya' },
      { id: 'dept-3', code: 'INFRA', name: 'Cloud Infrastructure & DC', headName: 'Amit Sharma' },
      { id: 'dept-4', code: 'OPS', name: 'State Operations & VLE Desk', headName: 'Rahul Deshmukh' },
      { id: 'dept-5', code: 'DBA', name: 'Database & Data Warehouse', headName: 'Anil Rao' },
      { id: 'dept-6', code: 'LEGAL', name: 'Legal & Regulatory Compliance', headName: 'Meenakshi Iyer' },
      { id: 'dept-7', code: 'HR', name: 'Human Resource & Admin', headName: 'Shalini Saxena' },
    ];
    depts.forEach((d) => this.departments.set(d.id, d));

    // 2. Locations
    const locs: Location[] = [
      { id: 'loc-1', code: 'NDC-DEL', name: 'National Data Centre (NDC)', city: 'New Delhi', state: 'Delhi', isDC: true },
      { id: 'loc-2', code: 'SDC-HYD', name: 'State Data Centre (SDC)', city: 'Hyderabad', state: 'Telangana', isDC: true },
      { id: 'loc-3', code: 'HQ-OIS', name: 'CSC Corporate HQ (Okhla)', city: 'New Delhi', state: 'Delhi', isDC: false },
      { id: 'loc-4', code: 'RH-LKO', name: 'Regional Operations Hub', city: 'Lucknow', state: 'Uttar Pradesh', isDC: false },
      { id: 'loc-5', code: 'RH-BLR', name: 'CSC Southern Regional Office', city: 'Bengaluru', state: 'Karnataka', isDC: false },
    ];
    locs.forEach((l) => this.locations.set(l.id, l));

    // 3. Users for All 10 Roles
    const sampleUsers: User[] = [
      {
        id: 'usr-admin',
        email: 'rajesh.verma@csc.gov.in',
        name: 'Rajesh Verma',
        employeeCode: 'CSC-1001',
        role: 'ADMIN',
        phone: '+91 98112 34567',
        departmentId: 'dept-3',
        departmentName: 'Cloud Infrastructure & DC',
        locationId: 'loc-3',
        locationName: 'CSC Corporate HQ (Okhla)',
        isActive: true,
        createdAt: '2026-01-01T09:00:00Z',
      },
      {
        id: 'usr-mgr',
        email: 'amit.sharma@csc.gov.in',
        name: 'Amit Sharma',
        employeeCode: 'CSC-1045',
        role: 'IT_MANAGER',
        phone: '+91 98234 56789',
        departmentId: 'dept-3',
        departmentName: 'Cloud Infrastructure & DC',
        locationId: 'loc-1',
        locationName: 'National Data Centre (NDC)',
        isActive: true,
        createdAt: '2026-01-05T09:00:00Z',
      },
      {
        id: 'usr-l1',
        email: 'priya.singh@csc.gov.in',
        name: 'Priya Singh',
        employeeCode: 'CSC-2104',
        role: 'SERVICE_DESK',
        phone: '+91 97118 99881',
        departmentId: 'dept-3',
        departmentName: 'Cloud Infrastructure & DC',
        locationId: 'loc-3',
        locationName: 'CSC Corporate HQ (Okhla)',
        isActive: true,
        createdAt: '2026-01-10T09:00:00Z',
      },
      {
        id: 'usr-l2',
        email: 'suresh.kumar@csc.gov.in',
        name: 'Suresh Kumar',
        employeeCode: 'CSC-2188',
        role: 'L2_ENGINEER',
        phone: '+91 98334 11223',
        departmentId: 'dept-3',
        departmentName: 'Cloud Infrastructure & DC',
        locationId: 'loc-1',
        locationName: 'National Data Centre (NDC)',
        isActive: true,
        createdAt: '2026-01-15T09:00:00Z',
      },
      {
        id: 'usr-l3',
        email: 'vikram.aditya@csc.gov.in',
        name: 'Vikram Aditya',
        employeeCode: 'CSC-1102',
        role: 'L3_SPECIALIST',
        phone: '+91 99100 44556',
        departmentId: 'dept-2',
        departmentName: 'Cyber Security Operations (CSOC)',
        locationId: 'loc-1',
        locationName: 'National Data Centre (NDC)',
        isActive: true,
        createdAt: '2026-01-12T09:00:00Z',
      },
      {
        id: 'usr-chg',
        email: 'neha.gupta@csc.gov.in',
        name: 'Neha Gupta',
        employeeCode: 'CSC-1340',
        role: 'CHANGE_MANAGER',
        phone: '+91 98450 77889',
        departmentId: 'dept-1',
        departmentName: 'Project Management Unit',
        locationId: 'loc-3',
        locationName: 'CSC Corporate HQ (Okhla)',
        isActive: true,
        createdAt: '2026-01-20T09:00:00Z',
      },
      {
        id: 'usr-prb',
        email: 'manoj.patel@csc.gov.in',
        name: 'Manoj Patel',
        employeeCode: 'CSC-1490',
        role: 'PROBLEM_MANAGER',
        phone: '+91 98711 22334',
        departmentId: 'dept-3',
        departmentName: 'Cloud Infrastructure & DC',
        locationId: 'loc-1',
        locationName: 'National Data Centre (NDC)',
        isActive: true,
        createdAt: '2026-01-22T09:00:00Z',
      },
      {
        id: 'usr-ast',
        email: 'sunita.rao@csc.gov.in',
        name: 'Sunita Rao',
        employeeCode: 'CSC-1820',
        role: 'ASSET_MANAGER',
        phone: '+91 99401 55667',
        departmentId: 'dept-3',
        departmentName: 'Cloud Infrastructure & DC',
        locationId: 'loc-3',
        locationName: 'CSC Corporate HQ (Okhla)',
        isActive: true,
        createdAt: '2026-02-01T09:00:00Z',
      },
      {
        id: 'usr-aud',
        email: 'dr.anil.mehta@csc.gov.in',
        name: 'Dr. Anil Mehta',
        employeeCode: 'CSC-AUD-01',
        role: 'AUDITOR',
        phone: '+91 98101 99001',
        departmentId: 'dept-6',
        departmentName: 'Legal & Regulatory Compliance',
        locationId: 'loc-3',
        locationName: 'CSC Corporate HQ (Okhla)',
        isActive: true,
        createdAt: '2026-02-05T09:00:00Z',
      },
      {
        id: 'usr-emp',
        email: 'rahul.deshmukh@csc.gov.in',
        name: 'Rahul Deshmukh',
        employeeCode: 'CSC-3510',
        role: 'EMPLOYEE',
        phone: '+91 97654 32109',
        departmentId: 'dept-4',
        departmentName: 'State Operations & VLE Desk',
        locationId: 'loc-4',
        locationName: 'Regional Operations Hub',
        isActive: true,
        createdAt: '2026-02-10T09:00:00Z',
      },
    ];
    sampleUsers.forEach((u) => this.users.set(u.id, u));

    // 4. Assignment Groups
    const sampleGroups: AssignmentGroup[] = [
      {
        id: 'grp-l1',
        name: 'Service Desk L1',
        description: 'First response tier for all employee incidents and service requests',
        email: 'servicedesk@csc.gov.in',
        memberIds: ['usr-l1'],
      },
      {
        id: 'grp-infra',
        name: 'Infrastructure & Cloud Ops',
        description: 'Linux/Windows servers, virtualization, hypervisors, and storage',
        email: 'infra-support@csc.gov.in',
        memberIds: ['usr-l2', 'usr-mgr'],
      },
      {
        id: 'grp-dba',
        name: 'Database Administration (DBA)',
        description: 'PostgreSQL, Oracle, high-availability clusters and performance tuning',
        email: 'dba-team@csc.gov.in',
        memberIds: ['usr-l2', 'usr-l3'],
      },
      {
        id: 'grp-net',
        name: 'Network & Telecom Team',
        description: 'Switches, routers, leased lines, MPLS, and SDC interconnects',
        email: 'network-noc@csc.gov.in',
        memberIds: ['usr-l2', 'usr-l3'],
      },
      {
        id: 'grp-csoc',
        name: 'Cyber Security Operations (CSOC)',
        description: 'Security incident response, firewall ACLs, SSL certs, and access audits',
        email: 'csoc-alerts@csc.gov.in',
        memberIds: ['usr-l3'],
      },
      {
        id: 'grp-app',
        name: 'Application Support Team',
        description: 'CSC Digital Seva Portal, VLE Services, Payment Gateway microservices',
        email: 'appsupport@csc.gov.in',
        memberIds: ['usr-l2', 'usr-l1'],
      },
      {
        id: 'grp-endpoint',
        name: 'Endpoint & Hardware Support',
        description: 'Laptops, desktops, office printers, peripherals, and local VPN',
        email: 'desktop-support@csc.gov.in',
        memberIds: ['usr-l1'],
      },
    ];
    sampleGroups.forEach((g) => this.groups.set(g.id, g));

    // 5. Categories & Subcategories
    const sampleCategories: Category[] = [
      {
        id: 'cat-1',
        name: 'Network',
        description: 'VPN, MPLS connectivity, Wi-Fi, Gateway, DNS & Bandwidth issues',
        defaultGroupId: 'grp-net',
        subcategories: ['SSL VPN Access', 'SDC Leased Line', 'Office Wi-Fi / LAN', 'DNS Resolution', 'Firewall Whitelist'],
      },
      {
        id: 'cat-2',
        name: 'Server & Cloud',
        description: 'Data centre physical servers, VMs, OS kernel, and disk space',
        defaultGroupId: 'grp-infra',
        subcategories: ['High Disk Utilization', 'VM Provisioning', 'Linux OS Kernel Panic', 'Backup Failure', 'CPU Spike'],
      },
      {
        id: 'cat-3',
        name: 'Database',
        description: 'PostgreSQL, Oracle, query latency, connection pool, replication',
        defaultGroupId: 'grp-dba',
        subcategories: ['Slow Query / High Latency', 'Replication Lag', 'Connection Pool Exhaustion', 'Schema Migration', 'DB Backup Restoration'],
      },
      {
        id: 'cat-4',
        name: 'Application',
        description: 'Digital Seva portal, payment settlement, VLE onboarding API',
        defaultGroupId: 'grp-app',
        subcategories: ['Payment Gateway Timeout', 'Portal Login Error (500)', 'OTP Gateway Delay', 'Session Expiry Loop', 'Report Generation Crash'],
      },
      {
        id: 'cat-5',
        name: 'Cyber Security',
        description: 'Access anomalies, malware alerts, SSL expiration, WAF alerts',
        defaultGroupId: 'grp-csoc',
        subcategories: ['SSL Certificate Expiry', 'Suspicious Login Attempt', 'WAF False Positive', 'Malware Signature Alert', 'Privilege Audit'],
      },
      {
        id: 'cat-6',
        name: 'Access & Identity',
        description: 'Production access, UAT privileges, LDAP sync, MFA token resets',
        defaultGroupId: 'grp-csoc',
        subcategories: ['Production Server SSH', 'UAT Database Read/Write', 'Active Directory Password Reset', 'MFA Token Reset', 'Email Account Creation'],
      },
      {
        id: 'cat-7',
        name: 'Hardware & Assets',
        description: 'Laptop allocation, monitor, docking station, printer, desktop',
        defaultGroupId: 'grp-endpoint',
        subcategories: ['New Laptop Allocation', 'RAM / SSD Upgrade', 'Faulty Display / Keyboard', 'Network Switch Port Flapping', 'Printer Configuration'],
      },
    ];
    sampleCategories.forEach((c) => this.categories.set(c.id, c));

    // 6. SLA Definitions
    const slas: SLADefinition[] = [
      {
        id: 'sla-crit',
        priority: 'CRITICAL',
        name: 'Tier 1 Critical Incident SLA',
        responseMinutes: 15,
        resolveMinutes: 120, // 2 hours
        businessHoursOnly: false,
        escLevel1Minutes: 30,
        escLevel2Minutes: 60,
        escLevel3Minutes: 90,
      },
      {
        id: 'sla-high',
        priority: 'HIGH',
        name: 'Tier 2 High Priority SLA',
        responseMinutes: 30,
        resolveMinutes: 240, // 4 hours
        businessHoursOnly: true,
        escLevel1Minutes: 60,
        escLevel2Minutes: 120,
        escLevel3Minutes: 180,
      },
      {
        id: 'sla-med',
        priority: 'MEDIUM',
        name: 'Tier 3 Medium Priority SLA',
        responseMinutes: 120, // 2 hours
        resolveMinutes: 480, // 8 hours
        businessHoursOnly: true,
        escLevel1Minutes: 180,
        escLevel2Minutes: 300,
        escLevel3Minutes: 420,
      },
      {
        id: 'sla-low',
        priority: 'LOW',
        name: 'Tier 4 Low Priority SLA',
        responseMinutes: 240, // 4 hours
        resolveMinutes: 1440, // 24 hours
        businessHoursOnly: true,
      },
    ];
    slas.forEach((s) => this.slaDefinitions.set(s.priority, s));

    // 7. Priority Matrix Rules
    const priorities: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    for (const imp of priorities) {
      for (const urg of priorities) {
        let resultPriority: Priority = 'MEDIUM';
        if (imp === 'CRITICAL' || urg === 'CRITICAL') {
          resultPriority = imp === 'CRITICAL' && urg === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
        } else if (imp === 'HIGH' || urg === 'HIGH') {
          resultPriority = imp === 'HIGH' && urg === 'HIGH' ? 'HIGH' : 'MEDIUM';
        } else if (imp === 'MEDIUM' || urg === 'MEDIUM') {
          resultPriority = imp === 'MEDIUM' && urg === 'MEDIUM' ? 'MEDIUM' : 'LOW';
        } else {
          resultPriority = 'LOW';
        }
        this.priorityMatrix.push({ impact: imp, urgency: urg, resultPriority });
      }
    }

    // 8. Auto Assignment Rules
    this.autoAssignmentRules = [
      { id: 'rule-1', categoryName: 'Network', assignmentGroupName: 'Network & Telecom Team', defaultTechnicianId: 'usr-l2' },
      { id: 'rule-2', categoryName: 'Server & Cloud', assignmentGroupName: 'Infrastructure & Cloud Ops', defaultTechnicianId: 'usr-l2' },
      { id: 'rule-3', categoryName: 'Database', assignmentGroupName: 'Database Administration (DBA)', defaultTechnicianId: 'usr-l2' },
      { id: 'rule-4', categoryName: 'Application', assignmentGroupName: 'Application Support Team', defaultTechnicianId: 'usr-l1' },
      { id: 'rule-5', categoryName: 'Cyber Security', assignmentGroupName: 'Cyber Security Operations (CSOC)', defaultTechnicianId: 'usr-l3' },
      { id: 'rule-6', categoryName: 'Access & Identity', assignmentGroupName: 'Cyber Security Operations (CSOC)', defaultTechnicianId: 'usr-l3' },
      { id: 'rule-7', categoryName: 'Hardware & Assets', assignmentGroupName: 'Endpoint & Hardware Support', defaultTechnicianId: 'usr-l1' },
    ];

    // 9. Notification Templates
    this.notificationTemplates = [
      {
        id: 'nt-1',
        event: 'TICKET_CREATED',
        channel: 'EMAIL',
        subjectTemplate: '[CSC ITSM] Ticket {{ticket_number}} Created - {{subject}}',
        bodyTemplate: 'Dear {{requester_name}},\n\nYour ticket {{ticket_number}} has been created with priority {{priority}} and assigned to {{assignment_group}}.\n\nSubject: {{subject}}\nExpected Resolution SLA: {{sla_due_time}}\n\nRegards,\nCSC Service Desk',
        isActive: true,
      },
      {
        id: 'nt-2',
        event: 'TICKET_ASSIGNED',
        channel: 'WHATSAPP',
        bodyTemplate: 'CSC ITSM: Ticket {{ticket_number}} (Priority: {{priority}}) has been assigned to you for investigation. Please review in ITSM Portal.',
        isActive: true,
      },
      {
        id: 'nt-3',
        event: 'TICKET_RESOLVED',
        channel: 'EMAIL',
        subjectTemplate: '[CSC ITSM] Ticket {{ticket_number}} Resolved - Action Required',
        bodyTemplate: 'Dear {{requester_name}},\n\nYour ticket {{ticket_number}} has been marked as RESOLVED by {{technician_name}}.\n\nResolution Summary: {{solution}}\n\nPlease login to confirm the resolution or reject within 48 hours.',
        isActive: true,
      },
    ];

    // 10. Service Catalog Items
    this.serviceCatalog = [
      {
        id: 'cat-item-1',
        code: 'SC-LAPTOP',
        title: 'New Standard Laptop Allocation',
        category: 'Hardware',
        description: 'Request standard enterprise laptop (Core i7, 32GB RAM, 512GB NVMe SSD, TPM 2.0).',
        iconName: 'Laptop',
        estimatedDelivery: '3 Business Days',
        defaultPriority: 'MEDIUM',
        requiresApproval: true,
        approvalStages: ['Department Head Approval', 'IT Asset Manager Approval'],
        fields: [
          { id: 'userRole', label: 'Employee Role / Designation', type: 'text', required: true, placeholder: 'e.g. Senior Software Engineer' },
          { id: 'osPreference', label: 'Operating System', type: 'select', options: ['Ubuntu Linux 24.04 LTS (Default)', 'Windows 11 Enterprise'], required: true },
          { id: 'reason', label: 'Business Justification', type: 'textarea', required: true, placeholder: 'Reason for new laptop...' },
        ],
      },
      {
        id: 'cat-item-2',
        code: 'SC-VPN',
        title: 'Enterprise SSL VPN Access',
        category: 'Network & Access',
        description: 'Request secure remote access to CSC NDC/SDC internal network and subnets.',
        iconName: 'ShieldCheck',
        estimatedDelivery: '1 Business Day',
        defaultPriority: 'MEDIUM',
        requiresApproval: true,
        approvalStages: ['Reporting Manager', 'Cyber Security CSOC'],
        fields: [
          { id: 'subnets', label: 'Required Subnet / Application Access', type: 'text', required: true, placeholder: 'e.g. 10.120.0.0/16 (VLE Microservices)' },
          { id: 'durationMonths', label: 'Access Duration (Months)', type: 'select', options: ['1 Month', '3 Months', '6 Months', 'Permanent'], required: true },
          { id: 'justification', label: 'Business Need for Remote Access', type: 'textarea', required: true },
        ],
      },
      {
        id: 'cat-item-3',
        code: 'SC-PROD-ACC',
        title: 'Production / UAT Server Access Request',
        category: 'Security & Access',
        description: 'Time-bound privileged SSH / Database access for deployment or emergency diagnostics.',
        iconName: 'KeyRound',
        estimatedDelivery: '4 Hours',
        defaultPriority: 'HIGH',
        requiresApproval: true,
        approvalStages: ['Reporting Manager', 'IT Operations Manager', 'Cyber Security (CSOC)'],
        fields: [
          { id: 'appName', label: 'Application / System', type: 'select', options: ['Digital Seva Portal', 'VLE Aadhaar Service', 'PMJAY Enrolment Cluster', 'Central Payment Gateway'], required: true },
          { id: 'environment', label: 'Target Environment', type: 'select', options: ['PRODUCTION', 'UAT', 'DR', 'STAGING'], required: true },
          { id: 'accessType', label: 'Access Privilege Level', type: 'select', options: ['READ_ONLY', 'READ_WRITE', 'ADMIN / SUDO', 'DATABASE_ACCESS'], required: true },
          { id: 'validFrom', label: 'Access Start Date & Time', type: 'date', required: true },
          { id: 'validTo', label: 'Access End Date & Time', type: 'date', required: true },
          { id: 'justification', label: 'Detailed Justification & RFC reference', type: 'textarea', required: true },
        ],
      },
      {
        id: 'cat-item-4',
        code: 'SC-EMAIL',
        title: 'Official @csc.gov.in Email Provisioning',
        category: 'Identity',
        description: 'Request official email account with enterprise mailbox quota and calendar.',
        iconName: 'Mail',
        estimatedDelivery: '1 Business Day',
        defaultPriority: 'LOW',
        requiresApproval: true,
        approvalStages: ['HR Approval', 'IT Service Desk'],
        fields: [
          { id: 'fullName', label: 'Full Official Name', type: 'text', required: true },
          { id: 'empCode', label: 'Employee ID', type: 'text', required: true },
          { id: 'dept', label: 'Department', type: 'text', required: true },
        ],
      },
      {
        id: 'cat-item-5',
        code: 'SC-VM',
        title: 'Cloud VM / Container Provisioning',
        category: 'Infrastructure',
        description: 'Provision virtual machine in CSC Private Cloud (OpenStack / VMware vSphere).',
        iconName: 'Server',
        estimatedDelivery: '2 Business Days',
        defaultPriority: 'HIGH',
        requiresApproval: true,
        approvalStages: ['Project Manager', 'Infrastructure Lead'],
        fields: [
          { id: 'vmSpecs', label: 'Compute Flavour', type: 'select', options: ['Small (2 vCPU, 4GB RAM, 50GB)', 'Medium (4 vCPU, 16GB RAM, 150GB)', 'Large (8 vCPU, 32GB RAM, 500GB)', 'GPU Compute Node (16 vCPU, 64GB RAM, NVIDIA A100)'], required: true },
          { id: 'osType', label: 'Base OS Image', type: 'select', options: ['Rocky Linux 9', 'Ubuntu 24.04 LTS', 'Red Hat Enterprise Linux 9'], required: true },
          { id: 'networkZone', label: 'Network DMZ / Zone', type: 'select', options: ['Internal Trust Zone', 'DMZ Web Tier', 'Database Isolated VLAN'], required: true },
          { id: 'purpose', label: 'Project Justification', type: 'textarea', required: true },
        ],
      },
    ];

    // 11. Assets (CMDB)
    const sampleAssets: Asset[] = [
      {
        id: 'ast-1',
        assetTag: 'AST-NDC-SRV-01',
        name: 'CSC-NDC-PROD-APP-01',
        type: 'SERVER',
        status: 'ACTIVE',
        serialNumber: 'DL-R750-99812A',
        ipAddress: '10.120.4.11',
        hostname: 'ndc-app01.prod.csc.gov.in',
        vendor: 'Dell Technologies',
        model: 'PowerEdge R750 (2x Xeon Gold 6330, 256GB RAM, 3.8TB NVMe RAID-10)',
        departmentName: 'Cloud Infrastructure & DC',
        locationName: 'National Data Centre (NDC)',
        ownerName: 'Amit Sharma',
        purchaseDate: '2025-03-15',
        warrantyExpiry: '2028-03-14',
        specs: 'OS: RHEL 9.3 | Dual 25GbE NIC | iDRAC9 Enterprise',
        linkedTicketCount: 2,
        createdAt: '2025-03-20T10:00:00Z',
        updatedAt: '2026-08-20T14:30:00Z',
      },
      {
        id: 'ast-2',
        assetTag: 'AST-NDC-DB-01',
        name: 'CSC-NDC-PROD-PG-PRIMARY',
        type: 'DATABASE',
        status: 'ACTIVE',
        serialNumber: 'DL-R850-44120X',
        ipAddress: '10.120.8.21',
        hostname: 'ndc-db01.prod.csc.gov.in',
        vendor: 'Dell Technologies',
        model: 'PowerEdge R850 (4x Xeon Platinum 8380, 512GB RAM, 15.3TB All-Flash SAN)',
        departmentName: 'Database & Data Warehouse',
        locationName: 'National Data Centre (NDC)',
        ownerName: 'Amit Sharma',
        purchaseDate: '2025-02-10',
        warrantyExpiry: '2028-02-09',
        specs: 'PostgreSQL 16.2 Enterprise HA Cluster with Patroni & etcd quorum',
        linkedTicketCount: 1,
        createdAt: '2025-02-15T11:00:00Z',
        updatedAt: '2026-08-25T09:15:00Z',
      },
      {
        id: 'ast-3',
        assetTag: 'AST-NDC-FW-01',
        name: 'CSC-NDC-PERIMETER-FW-HA',
        type: 'FIREWALL',
        status: 'ACTIVE',
        serialNumber: 'FG-3000F-881299',
        ipAddress: '10.120.1.1',
        hostname: 'ndc-fw01.core.csc.gov.in',
        vendor: 'Fortinet',
        model: 'FortiGate 3000F Active-Passive HA Pair',
        departmentName: 'Cyber Security Operations (CSOC)',
        locationName: 'National Data Centre (NDC)',
        ownerName: 'Vikram Aditya',
        purchaseDate: '2024-11-01',
        warrantyExpiry: '2027-10-31',
        specs: 'Throughput: 100Gbps | IPS/AV Hardware Accelerated | FortiGuard AI SecOps',
        linkedTicketCount: 1,
        createdAt: '2024-11-10T12:00:00Z',
        updatedAt: '2026-08-10T11:20:00Z',
      },
      {
        id: 'ast-4',
        assetTag: 'AST-NDC-SW-CORE',
        name: 'CSC-NDC-CORE-SWITCH-01',
        type: 'NETWORK_SWITCH',
        status: 'ACTIVE',
        serialNumber: 'CS-C9500-11029',
        ipAddress: '10.120.1.2',
        hostname: 'ndc-core01.net.csc.gov.in',
        vendor: 'Cisco Systems',
        model: 'Catalyst 9500 48-port 25G/100G Modular',
        departmentName: 'Cloud Infrastructure & DC',
        locationName: 'National Data Centre (NDC)',
        ownerName: 'Suresh Kumar',
        purchaseDate: '2024-10-15',
        warrantyExpiry: '2027-10-14',
        specs: 'Dual Redundant Power Supply | BGP/OSPF Routing Engine',
        linkedTicketCount: 1,
        createdAt: '2024-10-20T08:30:00Z',
        updatedAt: '2026-08-27T18:00:00Z',
      },
      {
        id: 'ast-5',
        assetTag: 'AST-LTP-3510',
        name: 'CSC-LAPTOP-RAHUL-D',
        type: 'LAPTOP',
        status: 'ACTIVE',
        serialNumber: 'LT-LAT-5440-4491',
        ipAddress: '10.120.64.88',
        hostname: 'csc-lko-ltp3510',
        vendor: 'Dell Technologies',
        model: 'Latitude 5440 (Intel Core i7-1365U, 32GB RAM, 512GB SSD)',
        departmentName: 'State Operations & VLE Desk',
        locationName: 'Regional Operations Hub',
        ownerName: 'Rahul Deshmukh',
        purchaseDate: '2025-06-01',
        warrantyExpiry: '2028-05-31',
        specs: 'Windows 11 Enterprise | BitLocker Enforced | Endpoint EDR Active',
        linkedTicketCount: 1,
        createdAt: '2025-06-05T09:00:00Z',
        updatedAt: '2026-08-20T10:00:00Z',
      },
    ];
    sampleAssets.forEach((a) => this.assets.set(a.id, a));

    // 12. Knowledge Base Articles
    const sampleArticles: KnowledgeArticle[] = [
      {
        id: 'kb-1',
        articleCode: 'KB-SOP-001',
        title: 'SOP: Resolving High Disk Utilization on Production Linux Nodes',
        category: 'SOP',
        summary: 'Standard operating procedure for identifying large core dumps, log rotation triggers, and safely clearing Docker/podman prune cache.',
        content: `### 1. Objective\nSafely recover disk space on production Linux nodes without causing service interruption.\n\n### 2. Diagnosis Steps\n1. Run \`df -hT\` to identify the mounted filesystem reaching above 85% threshold.\n2. Run \`du -ahx /var/log | sort -rh | head -n 20\` to inspect bloated logs.\n3. Check systemd journal size: \`journalctl --disk-usage\`.\n\n### 3. Immediate Action\n- Vacuum logs safely: \`journalctl --vacuum-time=3d\`\n- Rotate nginx & app logs: \`logrotate -f /etc/logrotate.conf\`\n- Clean old container layers: \`docker system prune -f --volumes\` (only if approved)\n\n### 4. SLA & Escalation\nIf disk is above 95%, immediately notify L2/L3 on-call engineer and post work notes on the active Incident ticket.`,
        authorName: 'Suresh Kumar (L2)',
        version: '2.1',
        isPublished: true,
        viewCount: 148,
        reviewDate: '2026-12-31',
        createdAt: '2026-02-01T10:00:00Z',
        updatedAt: '2026-08-15T16:00:00Z',
      },
      {
        id: 'kb-2',
        articleCode: 'KB-TS-002',
        title: 'Troubleshooting PostgreSQL Replication Lag & Connection Leaks',
        category: 'Troubleshooting',
        summary: 'Guide for diagnosing pg_stat_replication delay and terminating idle in transaction backends.',
        content: `### Problem Description\nWhen downstream VLE portal reports stale records or read replica fails to sync.\n\n### Identification\nExecute on primary node:\n\`SELECT client_addr, state, sync_state, pg_wal_lsn_diff(pg_current_wal_lsn(), write_lsn) AS write_lag_bytes FROM pg_stat_replication;\`\n\n### Terminating Hung Sessions\n\`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction' AND state_change < NOW() - INTERVAL '15 minutes';\``,
        authorName: 'Vikram Aditya (L3)',
        version: '1.4',
        isPublished: true,
        viewCount: 215,
        reviewDate: '2026-11-30',
        createdAt: '2026-02-15T11:00:00Z',
        updatedAt: '2026-08-10T12:00:00Z',
      },
      {
        id: 'kb-3',
        articleCode: 'KB-SEC-003',
        title: 'Enterprise Password & Privileged Access Control Policy (ISO 27001)',
        category: 'Security',
        summary: 'Official security guidelines for multi-factor authentication, rotation cycles, and access review obligations.',
        content: `### Guidelines for all CSC Officers\n1. Passwords must be minimum 14 characters, combining uppercase, lowercase, numeric, and special symbols.\n2. MFA is strictly mandatory for all internal VPN, Admin, and Production credentials.\n3. Production keys must be stored exclusively in CSC Hardware Security Modules (HSM) and Key Vault.\n4. Access permissions are reviewed monthly by the Cyber Security Operations Center.`,
        authorName: 'Dr. Anil Mehta (Auditor)',
        version: '3.0',
        isPublished: true,
        viewCount: 420,
        reviewDate: '2027-01-01',
        createdAt: '2026-01-10T09:00:00Z',
        updatedAt: '2026-08-01T10:00:00Z',
      },
    ];
    sampleArticles.forEach((a) => this.knowledgeArticles.set(a.id, a));

    // 13. Pre-seeded Tickets
    const now = new Date();
    const sampleTickets: Ticket[] = [
      {
        id: 'tkt-1',
        ticketNumber: 'INC-2026-000101',
        subject: 'Production Server CSC-NDC-PROD-APP-01 High Disk Utilization (94%)',
        description: 'Automated monitoring alert: Root mount /var filesystem utilization exceeded 94% on primary portal application server. Immediate log rotation and audit log offload required to prevent service degradation.',
        type: 'INCIDENT',
        status: 'IN_PROGRESS',
        priority: 'CRITICAL',
        impact: 'CRITICAL',
        urgency: 'CRITICAL',
        requesterId: 'usr-emp',
        requesterName: 'Rahul Deshmukh',
        requesterEmail: 'rahul.deshmukh@csc.gov.in',
        requesterPhone: '+91 97654 32109',
        assignedToId: 'usr-l2',
        assignedToName: 'Suresh Kumar',
        assignmentGroupId: 'grp-infra',
        assignmentGroupName: 'Infrastructure & Cloud Ops',
        departmentId: 'dept-3',
        departmentName: 'Cloud Infrastructure & DC',
        locationId: 'loc-1',
        locationName: 'National Data Centre (NDC)',
        categoryId: 'cat-2',
        categoryName: 'Server & Cloud',
        subcategoryId: 'High Disk Utilization',
        subcategoryName: 'High Disk Utilization',
        assetId: 'ast-1',
        assetTag: 'AST-NDC-SRV-01',
        assetName: 'CSC-NDC-PROD-APP-01',
        responseDueDate: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
        respondedAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
        resolutionDueDate: new Date(now.getTime() + 65 * 60 * 1000).toISOString(),
        slaState: 'HEALTHY',
        slaRemainingSeconds: 3900,
        commentsCount: 2,
        workNotesCount: 2,
        tasksCount: 3,
        completedTasksCount: 1,
        attachmentsCount: 1,
        comments: [
          {
            id: 'c-1',
            ticketId: 'tkt-1',
            authorId: 'usr-emp',
            authorName: 'Rahul Deshmukh',
            authorRole: 'EMPLOYEE',
            content: 'Noticed portal response time creeping up during state enrollment batch jobs. Please check if this disk alert is impacting the session storage.',
            isInternal: false,
            createdAt: new Date(now.getTime() - 40 * 60 * 1000).toISOString(),
          },
          {
            id: 'c-2',
            ticketId: 'tkt-1',
            authorId: 'usr-l2',
            authorName: 'Suresh Kumar',
            authorRole: 'L2_ENGINEER',
            content: 'We have acknowledged the critical incident and initiated disk cleanup protocols. Application services are currently operating normally without packet loss.',
            isInternal: false,
            createdAt: new Date(now.getTime() - 22 * 60 * 1000).toISOString(),
          },
          {
            id: 'c-3',
            ticketId: 'tkt-1',
            authorId: 'usr-l2',
            authorName: 'Suresh Kumar',
            authorRole: 'L2_ENGINEER',
            content: 'INTERNAL WORK NOTE: Found 84GB of unrotated audit logs in /var/log/audit/audit.log due to sudden influx of batch jobs. Running safe vacuum and setting up automated rsyslog offload to S3.',
            isInternal: true,
            createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
          },
        ],
        tasks: [
          {
            id: 'tsk-1',
            ticketId: 'tkt-1',
            title: 'Verify disk partition usage with df -hT and du',
            isCompleted: true,
            completedAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
            assignedToName: 'Suresh Kumar',
            createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
          },
          {
            id: 'tsk-2',
            ticketId: 'tkt-1',
            title: 'Execute journalctl vacuum and compress archived audit logs',
            isCompleted: false,
            assignedToName: 'Suresh Kumar',
            createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
          },
          {
            id: 'tsk-3',
            ticketId: 'tkt-1',
            title: 'Validate threshold falls below 75% on Zabbix/Prometheus',
            isCompleted: false,
            assignedToName: 'Suresh Kumar',
            createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
          },
        ],
        attachments: [
          {
            id: 'att-1',
            ticketId: 'tkt-1',
            fileName: 'disk_utilization_graph.png',
            fileSize: 452000,
            fileType: 'image/png',
            storageKey: 'attachments/tkt-1/disk_utilization_graph.png',
            uploadedByName: 'Rahul Deshmukh',
            createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
          },
        ],
        timeline: [
          {
            id: 'th-1',
            ticketId: 'tkt-1',
            userName: 'Rahul Deshmukh',
            action: 'CREATED',
            comment: 'Ticket raised via Portal with Critical priority',
            createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
          },
          {
            id: 'th-2',
            ticketId: 'tkt-1',
            userName: 'System Auto-Assignment',
            action: 'ASSIGNED_GROUP',
            oldValue: 'Unassigned',
            newValue: 'Infrastructure & Cloud Ops',
            createdAt: new Date(now.getTime() - 44 * 60 * 1000).toISOString(),
          },
          {
            id: 'th-3',
            ticketId: 'tkt-1',
            userName: 'Priya Singh (Service Desk)',
            action: 'ASSIGNED_TECHNICIAN',
            oldValue: 'Unassigned',
            newValue: 'Suresh Kumar (L2)',
            createdAt: new Date(now.getTime() - 35 * 60 * 1000).toISOString(),
          },
          {
            id: 'th-4',
            ticketId: 'tkt-1',
            userName: 'Suresh Kumar',
            action: 'STATUS_CHANGE',
            oldValue: 'NEW',
            newValue: 'IN_PROGRESS',
            createdAt: new Date(now.getTime() - 25 * 60 * 1000).toISOString(),
          },
        ],
        createdAt: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 'tkt-2',
        ticketNumber: 'INC-2026-000102',
        subject: 'SSL Certificate Expiry Warning on *.csc.gov.in Core Gateway',
        description: 'Certbot / CSOC alert: Wildcard SSL certificate for *.csc.gov.in subdomains expires in 12 days. Production renewal and nginx reload required across NDC & SDC load balancers.',
        type: 'INCIDENT',
        status: 'ASSIGNED',
        priority: 'HIGH',
        impact: 'HIGH',
        urgency: 'HIGH',
        requesterId: 'usr-mgr',
        requesterName: 'Amit Sharma',
        requesterEmail: 'amit.sharma@csc.gov.in',
        assignedToId: 'usr-l3',
        assignedToName: 'Vikram Aditya',
        assignmentGroupId: 'grp-csoc',
        assignmentGroupName: 'Cyber Security Operations (CSOC)',
        departmentId: 'dept-2',
        departmentName: 'Cyber Security Operations (CSOC)',
        locationId: 'loc-1',
        locationName: 'National Data Centre (NDC)',
        categoryId: 'cat-5',
        categoryName: 'Cyber Security',
        subcategoryId: 'SSL Certificate Expiry',
        subcategoryName: 'SSL Certificate Expiry',
        assetId: 'ast-3',
        assetTag: 'AST-NDC-FW-01',
        assetName: 'CSC-NDC-PERIMETER-FW-HA',
        responseDueDate: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
        resolutionDueDate: new Date(now.getTime() + 180 * 60 * 1000).toISOString(),
        slaState: 'HEALTHY',
        slaRemainingSeconds: 10800,
        commentsCount: 1,
        workNotesCount: 1,
        tasksCount: 2,
        completedTasksCount: 0,
        attachmentsCount: 0,
        comments: [
          {
            id: 'c-201',
            ticketId: 'tkt-2',
            authorId: 'usr-l3',
            authorName: 'Vikram Aditya',
            authorRole: 'L3_SPECIALIST',
            content: 'INTERNAL WORK NOTE: Generated CSR with 4096-bit RSA key and submitted to National Informatics Centre (NIC) CA. Awaiting signature issuance.',
            isInternal: true,
            createdAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
          },
        ],
        tasks: [
          {
            id: 'tsk-201',
            ticketId: 'tkt-2',
            title: 'Verify NIC CA Certificate Chain and Intermediate certs',
            isCompleted: false,
            assignedToName: 'Vikram Aditya',
            createdAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
          },
          {
            id: 'tsk-202',
            ticketId: 'tkt-2',
            title: 'Deploy certs on HAProxy & FortiGate SSL Offloader',
            isCompleted: false,
            assignedToName: 'Vikram Aditya',
            createdAt: new Date(now.getTime() - 20 * 60 * 1000).toISOString(),
          },
        ],
        timeline: [
          {
            id: 'th-201',
            ticketId: 'tkt-2',
            userName: 'Amit Sharma',
            action: 'CREATED',
            comment: 'Created High priority security incident',
            createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
          },
          {
            id: 'th-202',
            ticketId: 'tkt-2',
            userName: 'System Auto-Assignment',
            action: 'ASSIGNED_GROUP',
            newValue: 'Cyber Security Operations (CSOC)',
            createdAt: new Date(now.getTime() - 29 * 60 * 1000).toISOString(),
          },
        ],
        createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: 'tkt-3',
        ticketNumber: 'SR-2026-000103',
        subject: 'Request for CSC SSL VPN Access for State Operations Hub (Lucknow)',
        description: 'Official VPN access request for accessing Digital Seva regional administrative subnet (10.120.64.0/24) to conduct state VLE enrollment reviews.',
        type: 'SERVICE_REQUEST',
        status: 'AWAITING_APPROVAL',
        priority: 'MEDIUM',
        impact: 'MEDIUM',
        urgency: 'MEDIUM',
        requesterId: 'usr-emp',
        requesterName: 'Rahul Deshmukh',
        requesterEmail: 'rahul.deshmukh@csc.gov.in',
        assignedToId: 'usr-l1',
        assignedToName: 'Priya Singh',
        assignmentGroupId: 'grp-net',
        assignmentGroupName: 'Network & Telecom Team',
        departmentId: 'dept-4',
        departmentName: 'State Operations & VLE Desk',
        locationId: 'loc-4',
        locationName: 'Regional Operations Hub',
        categoryId: 'cat-1',
        categoryName: 'Network',
        subcategoryId: 'SSL VPN Access',
        subcategoryName: 'SSL VPN Access',
        responseDueDate: new Date(now.getTime() + 90 * 60 * 1000).toISOString(),
        resolutionDueDate: new Date(now.getTime() + 420 * 60 * 1000).toISOString(),
        slaState: 'HEALTHY',
        slaRemainingSeconds: 25200,
        commentsCount: 0,
        workNotesCount: 0,
        tasksCount: 1,
        completedTasksCount: 0,
        attachmentsCount: 0,
        approvals: [
          {
            id: 'appr-301',
            stageNumber: 1,
            roleRequired: 'IT_MANAGER',
            approverName: 'Amit Sharma',
            status: 'PENDING',
            comments: 'Awaiting manager sign-off for regional subnet access.',
          },
          {
            id: 'appr-302',
            stageNumber: 2,
            roleRequired: 'L3_SPECIALIST',
            approverName: 'Vikram Aditya (CSOC)',
            status: 'PENDING',
          },
        ],
        timeline: [
          {
            id: 'th-301',
            ticketId: 'tkt-3',
            userName: 'Rahul Deshmukh',
            action: 'CREATED_SERVICE_REQUEST',
            comment: 'Service catalog request initiated with 2-stage approval workflow',
            createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
          },
        ],
        createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'tkt-4',
        ticketNumber: 'INC-2026-000104',
        subject: 'PostgreSQL Primary Replica Latency & Connection Pool Exhaustion',
        description: 'Application logs reported intermittent 504 Gateway Timeouts on VLE registration queries. PgBouncer pool reached 98% max client connections.',
        type: 'INCIDENT',
        status: 'RESOLVED',
        priority: 'HIGH',
        impact: 'HIGH',
        urgency: 'HIGH',
        requesterId: 'usr-l1',
        requesterName: 'Priya Singh',
        requesterEmail: 'priya.singh@csc.gov.in',
        assignedToId: 'usr-l3',
        assignedToName: 'Vikram Aditya',
        assignmentGroupId: 'grp-dba',
        assignmentGroupName: 'Database Administration (DBA)',
        departmentId: 'dept-5',
        departmentName: 'Database & Data Warehouse',
        locationId: 'loc-1',
        locationName: 'National Data Centre (NDC)',
        categoryId: 'cat-3',
        categoryName: 'Database',
        subcategoryId: 'Connection Pool Exhaustion',
        subcategoryName: 'Connection Pool Exhaustion',
        assetId: 'ast-2',
        assetTag: 'AST-NDC-DB-01',
        assetName: 'CSC-NDC-PROD-PG-PRIMARY',
        responseDueDate: new Date(now.getTime() - 300 * 60 * 1000).toISOString(),
        respondedAt: new Date(now.getTime() - 310 * 60 * 1000).toISOString(),
        resolutionDueDate: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
        resolvedAt: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
        slaState: 'MET',
        solution: 'Identified unindexed aggregate query on tbl_vle_transactions. Added partial composite index idx_vle_tx_state_created and increased PgBouncer reserve pool from 250 to 600.',
        solutionAccepted: true,
        commentsCount: 3,
        workNotesCount: 2,
        tasksCount: 2,
        completedTasksCount: 2,
        attachmentsCount: 0,
        timeline: [
          {
            id: 'th-401',
            ticketId: 'tkt-4',
            userName: 'Priya Singh',
            action: 'CREATED',
            createdAt: new Date(now.getTime() - 360 * 60 * 1000).toISOString(),
          },
          {
            id: 'th-402',
            ticketId: 'tkt-4',
            userName: 'Vikram Aditya',
            action: 'RESOLVED',
            comment: 'Added missing index and tuned connection pool.',
            createdAt: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
          },
        ],
        createdAt: new Date(now.getTime() - 360 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
      },
    ];
    sampleTickets.forEach((t) => this.tickets.set(t.id, t));

    // 14. Access Requests (Production / UAT time-bound access)
    const sampleAccessReqs: AccessRequest[] = [
      {
        id: 'acc-1',
        requestNumber: 'ACC-2026-000201',
        requesterId: 'usr-emp',
        requesterName: 'Rahul Deshmukh',
        requesterEmail: 'rahul.deshmukh@csc.gov.in',
        departmentName: 'State Operations & VLE Desk',
        applicationName: 'Digital Seva Portal Core DB',
        environment: 'PRODUCTION',
        accessType: 'DATABASE_ACCESS',
        validFrom: '2026-09-01T10:00:00Z',
        validTo: '2026-09-07T18:00:00Z',
        businessJustification: 'Audit reconciliation of state subsidy disbursement records across Uttar Pradesh and Bihar VLE accounts.',
        currentStage: 2,
        status: 'PENDING',
        approvals: [
          {
            id: 'app-stg-1',
            stageNumber: 1,
            roleRequired: 'IT_MANAGER',
            approverId: 'usr-mgr',
            approverName: 'Amit Sharma',
            status: 'APPROVED',
            comments: 'Approved for read-only database query access with masked PII fields.',
            actionedAt: '2026-08-28T09:30:00Z',
          },
          {
            id: 'app-stg-2',
            stageNumber: 2,
            roleRequired: 'L3_SPECIALIST',
            approverId: 'usr-l3',
            approverName: 'Vikram Aditya (CSOC Lead)',
            status: 'PENDING',
            comments: 'Under security policy review. Checking session recording bastion requirements.',
          },
        ],
        createdAt: '2026-08-28T08:00:00Z',
        updatedAt: '2026-08-28T09:30:00Z',
      },
      {
        id: 'acc-2',
        requestNumber: 'ACC-2026-000202',
        requesterId: 'usr-l2',
        requesterName: 'Suresh Kumar',
        requesterEmail: 'suresh.kumar@csc.gov.in',
        departmentName: 'Cloud Infrastructure & DC',
        applicationName: 'National Data Centre Perimeter Firewall',
        environment: 'PRODUCTION',
        accessType: 'ADMIN',
        validFrom: '2026-08-30T00:00:00Z',
        validTo: '2026-08-30T04:00:00Z',
        businessJustification: 'Scheduled maintenance window for upgrading FortiOS firmware from 7.2.6 to 7.4.2 (Ref: CR-2026-000101).',
        currentStage: 1,
        status: 'PENDING',
        approvals: [
          {
            id: 'app-stg-21',
            stageNumber: 1,
            roleRequired: 'CHANGE_MANAGER',
            approverName: 'Neha Gupta (CAB Chair)',
            status: 'PENDING',
          },
        ],
        createdAt: '2026-08-27T16:00:00Z',
        updatedAt: '2026-08-27T16:00:00Z',
      },
    ];
    sampleAccessReqs.forEach((a) => this.accessRequests.set(a.id, a));

    // 15. Change Requests (CAB Workflow)
    const sampleChanges: ChangeRequest[] = [
      {
        id: 'cr-1',
        changeNumber: 'CR-2026-000101',
        title: 'Perimeter FortiGate Firewall Firmware Upgrade (7.2 to 7.4)',
        description: 'Upgrade HA FortiGate 3000F pair at NDC to patch critical CVEs and enable TLS 1.3 deep packet inspection.',
        type: 'NORMAL',
        status: 'APPROVAL',
        riskLevel: 'HIGH',
        impactLevel: 'HIGH',
        justification: 'Compliance with CERT-In Cybersecurity Guidelines 2026 and vulnerability remediation.',
        implementationPlan: '1. Backup firewall configuration XML.\n2. Upgrade secondary HA passive node.\n3. Failover traffic to secondary.\n4. Upgrade primary node and restore cluster sync.',
        rollbackPlan: 'If cluster desync occurs > 5 mins, reboot secondary into previous firmware partition and restore backup XML configuration.',
        testingPlan: 'Verify IPSec tunnels, BGP peer routes, SSL VPN user connections, and CSC portal reachability from 3 regional ISP lines.',
        plannedStartTime: '2026-08-30T00:30:00Z',
        plannedEndTime: '2026-08-30T03:30:00Z',
        ownerId: 'usr-chg',
        ownerName: 'Neha Gupta',
        approvals: [
          {
            id: 'ca-1',
            stageNumber: 1,
            roleRequired: 'CHANGE_MANAGER',
            approverName: 'Neha Gupta',
            status: 'APPROVED',
            comments: 'CAB reviewed risk assessment. Approved for maintenance window.',
            actionedAt: '2026-08-27T15:00:00Z',
          },
          {
            id: 'ca-2',
            stageNumber: 2,
            roleRequired: 'IT_MANAGER',
            approverName: 'Amit Sharma',
            status: 'PENDING',
          },
        ],
        linkedTicketIds: ['tkt-2'],
        createdAt: '2026-08-26T10:00:00Z',
        updatedAt: '2026-08-27T15:00:00Z',
      },
      {
        id: 'cr-2',
        changeNumber: 'CR-2026-000102',
        title: 'Emergency Hotfix: Digital Seva Aadhaar OTP Gateway Retry Circuit Breaker',
        description: 'Deploy resilient circuit breaker pattern on Aadhaar OTP validation endpoint to handle upstream NIC latency spikes.',
        type: 'EMERGENCY',
        status: 'SCHEDULED',
        riskLevel: 'MEDIUM',
        impactLevel: 'MEDIUM',
        justification: 'High user drop-off observed during peak morning hours.',
        implementationPlan: 'Canary rollout to 2 pods in NDC K8s cluster, verify error rate, then promote to all 12 pods.',
        rollbackPlan: 'Helm rollback to release v4.12.0 within 60 seconds.',
        testingPlan: 'Automated load test against mock UIDAI API stub with simulated 4000ms latency.',
        plannedStartTime: '2026-08-28T22:00:00Z',
        plannedEndTime: '2026-08-28T23:00:00Z',
        ownerId: 'usr-l3',
        ownerName: 'Vikram Aditya',
        createdAt: '2026-08-28T09:00:00Z',
        updatedAt: '2026-08-28T11:00:00Z',
      },
    ];
    sampleChanges.forEach((c) => this.changes.set(c.id, c));

    // 16. Problem Management Records
    const sampleProblems: ProblemRecord[] = [
      {
        id: 'prb-1',
        problemNumber: 'PRB-2026-000051',
        title: 'Intermittent PgBouncer Connection Pool Exhaustion under Heavy VLE Concurrency',
        description: 'Repeated incidents over past 30 days where sudden state subsidy announcements cause 400% connection spikes, saturating PostgreSQL backend processes.',
        status: 'ROOT_CAUSE_IDENTIFIED',
        impact: 'HIGH',
        rootCause: 'Default max_client_conn parameter was set to 250 with no transaction-level connection pooling enabled on read-only queries.',
        workaround: 'Manual restart of PgBouncer service and shedding background analytics jobs.',
        correctiveAction: 'Migrate to Transaction Pooling mode and configure Redis cache layer for VLE state master lookups.',
        preventiveAction: 'Implement automated horizontal autoscaling on read replicas and set up Prometheus alert at 80% pool utilization.',
        ownerId: 'usr-prb',
        ownerName: 'Manoj Patel',
        relatedTicketNumbers: ['INC-2026-000104'],
        createdAt: '2026-08-20T11:00:00Z',
        updatedAt: '2026-08-27T17:00:00Z',
      },
    ];
    sampleProblems.forEach((p) => this.problems.set(p.id, p));

    // 17. Initial Audit Logs
    this.addAuditLog({
      userId: 'usr-admin',
      userName: 'Rajesh Verma (Admin)',
      userRole: 'ADMIN',
      action: 'SYSTEM_INITIALIZATION',
      module: 'ADMIN',
      objectType: 'SystemConfiguration',
      objectId: 'CSC-ITSM-CORE',
      newValue: 'Initialized CSC ITSM Enterprise Database Schema with ISO 27001 Controls',
      ipAddress: '10.120.10.5',
    });
    this.addAuditLog({
      userId: 'usr-emp',
      userName: 'Rahul Deshmukh',
      userRole: 'EMPLOYEE',
      action: 'CREATE',
      module: 'TICKETS',
      objectType: 'Ticket',
      objectId: 'INC-2026-000101',
      newValue: 'Subject: Production Server CSC-NDC-PROD-APP-01 High Disk Utilization (94%)',
      ipAddress: '10.120.64.88',
    });
    this.addAuditLog({
      userId: 'usr-l2',
      userName: 'Suresh Kumar',
      userRole: 'L2_ENGINEER',
      action: 'STATUS_CHANGE',
      module: 'TICKETS',
      objectType: 'Ticket',
      objectId: 'INC-2026-000101',
      oldValue: 'NEW',
      newValue: 'IN_PROGRESS',
      details: 'Technician acknowledged alert and began log vacuuming procedures',
      ipAddress: '10.120.4.15',
    });
    this.addAuditLog({
      userId: 'usr-mgr',
      userName: 'Amit Sharma',
      userRole: 'IT_MANAGER',
      action: 'APPROVE',
      module: 'ACCESS_REQUESTS',
      objectType: 'AccessRequest',
      objectId: 'ACC-2026-000201',
      oldValue: 'PENDING_STAGE_1',
      newValue: 'APPROVED_STAGE_1',
      details: 'Approved stage 1 for Rahul Deshmukh audit reconciliation access',
      ipAddress: '10.120.4.2',
    });
  }

  // --- Audit Logging ---
  public addAuditLog(entry: {
    userId?: string;
    userName: string;
    userRole: string;
    action: string;
    module: 'TICKETS' | 'USERS' | 'ASSETS' | 'CHANGES' | 'PROBLEMS' | 'ACCESS_REQUESTS' | 'ADMIN' | 'AUTH' | 'KB';
    objectType: string;
    objectId: string;
    oldValue?: string;
    newValue?: string;
    details?: string;
    ipAddress?: string;
  }): AuditLog {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: entry.userId,
      userName: entry.userName,
      userRole: entry.userRole,
      action: entry.action,
      module: entry.module,
      objectType: entry.objectType,
      objectId: entry.objectId,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      details: entry.details,
      ipAddress: entry.ipAddress || '10.120.1.100',
    };
    this.auditLogs.unshift(log);
    return log;
  }

  public getAuditLogs(filter?: { module?: string; action?: string; search?: string }): AuditLog[] {
    let logs = [...this.auditLogs];
    if (filter?.module && filter.module !== 'ALL') {
      logs = logs.filter((l) => l.module === filter.module);
    }
    if (filter?.action && filter.action !== 'ALL') {
      logs = logs.filter((l) => l.action.toLowerCase().includes(filter.action!.toLowerCase()));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.userName.toLowerCase().includes(q) ||
          l.objectId.toLowerCase().includes(q) ||
          (l.details && l.details.toLowerCase().includes(q)) ||
          l.action.toLowerCase().includes(q)
      );
    }
    return logs;
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return Array.from(this.users.values());
  }

  public getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  public getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const id = `usr-${Date.now()}`;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, newUser);
    this.addAuditLog({
      userName: 'System Administrator',
      userRole: 'ADMIN',
      action: 'USER_CREATED',
      module: 'USERS',
      objectType: 'User',
      objectId: id,
      newValue: `${newUser.name} (${newUser.email}) - Role: ${newUser.role}`,
    });
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    const oldRole = user.role;
    const updated = { ...user, ...updates };
    this.users.set(id, updated);
    this.addAuditLog({
      userName: 'System Administrator',
      userRole: 'ADMIN',
      action: 'USER_UPDATED',
      module: 'USERS',
      objectType: 'User',
      objectId: id,
      oldValue: `Role: ${oldRole}`,
      newValue: `Role: ${updated.role}, Active: ${updated.isActive}`,
    });
    return updated;
  }

  // --- Departments, Locations, Groups, Categories ---
  public getDepartments(): Department[] {
    return Array.from(this.departments.values());
  }
  public getLocations(): Location[] {
    return Array.from(this.locations.values());
  }
  public getGroups(): AssignmentGroup[] {
    return Array.from(this.groups.values());
  }
  public getCategories(): Category[] {
    return Array.from(this.categories.values());
  }
  public getSLADefinitions(): SLADefinition[] {
    return Array.from(this.slaDefinitions.values());
  }
  public getPriorityMatrix(): PriorityMatrixRule[] {
    return this.priorityMatrix;
  }
  public getAutoAssignmentRules(): AutoAssignmentRule[] {
    return this.autoAssignmentRules;
  }
  public getNotificationTemplates(): NotificationTemplate[] {
    return this.notificationTemplates;
  }
  public getServiceCatalog(): ServiceCatalogItem[] {
    return this.serviceCatalog;
  }

  // --- Ticket CRUD & Lifecycle ---
  public calculatePriority(impact: Impact, urgency: Urgency): Priority {
    const match = this.priorityMatrix.find((p) => p.impact === impact && p.urgency === urgency);
    if (match) return match.resultPriority;
    if (impact === 'CRITICAL' && urgency === 'CRITICAL') return 'CRITICAL';
    if (impact === 'CRITICAL' || urgency === 'CRITICAL' || (impact === 'HIGH' && urgency === 'HIGH')) return 'HIGH';
    if (impact === 'LOW' && urgency === 'LOW') return 'LOW';
    return 'MEDIUM';
  }

  public getAutoAssignment(categoryName: string): { groupName?: string; techId?: string } {
    const rule = this.autoAssignmentRules.find((r) => r.categoryName.toLowerCase() === categoryName.toLowerCase());
    if (rule) {
      return { groupName: rule.assignmentGroupName, techId: rule.defaultTechnicianId };
    }
    return { groupName: 'Service Desk L1', techId: 'usr-l1' };
  }

  public getTickets(filter?: {
    type?: string;
    status?: string;
    priority?: string;
    departmentId?: string;
    assignedToId?: string;
    requesterId?: string;
    groupId?: string;
    search?: string;
  }): Ticket[] {
    let list = Array.from(this.tickets.values());

    // Update remaining SLA timers dynamically
    const now = new Date().getTime();
    list = list.map((t) => {
      if (t.resolutionDueDate && t.status !== 'RESOLVED' && t.status !== 'CLOSED' && t.status !== 'CANCELLED') {
        const dueTime = new Date(t.resolutionDueDate).getTime();
        const diffSecs = Math.floor((dueTime - now) / 1000);
        let slaState: SLAState = 'HEALTHY';
        if (diffSecs <= 0) {
          slaState = 'BREACHED';
        } else if (diffSecs <= 1800) {
          // Less than 30 mins
          slaState = 'AT_RISK';
        }
        return {
          ...t,
          slaRemainingSeconds: diffSecs,
          slaState,
        };
      }
      return t;
    });

    if (filter?.type && filter.type !== 'ALL') {
      list = list.filter((t) => t.type === filter.type);
    }
    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((t) => t.status === filter.status);
    }
    if (filter?.priority && filter.priority !== 'ALL') {
      list = list.filter((t) => t.priority === filter.priority);
    }
    if (filter?.departmentId && filter.departmentId !== 'ALL') {
      list = list.filter((t) => t.departmentId === filter.departmentId);
    }
    if (filter?.assignedToId) {
      list = list.filter((t) => t.assignedToId === filter.assignedToId);
    }
    if (filter?.requesterId) {
      list = list.filter((t) => t.requesterId === filter.requesterId);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.requesterName.toLowerCase().includes(q) ||
          (t.assignedToName && t.assignedToName.toLowerCase().includes(q)) ||
          (t.assetTag && t.assetTag.toLowerCase().includes(q))
      );
    }

    // Sort by newest created first
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getTicketById(id: string): Ticket | undefined {
    const t = this.tickets.get(id);
    if (!t) return undefined;
    const now = new Date().getTime();
    if (t.resolutionDueDate && t.status !== 'RESOLVED' && t.status !== 'CLOSED') {
      const dueTime = new Date(t.resolutionDueDate).getTime();
      const diffSecs = Math.floor((dueTime - now) / 1000);
      let slaState: SLAState = 'HEALTHY';
      if (diffSecs <= 0) slaState = 'BREACHED';
      else if (diffSecs <= 1800) slaState = 'AT_RISK';
      t.slaRemainingSeconds = diffSecs;
      t.slaState = slaState;
    }
    return t;
  }

  public createTicket(input: {
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
    requesterId: string;
    clientIp?: string;
  }): Ticket {
    this.ticketCounter += 1;
    const year = new Date().getFullYear();
    const prefix = input.type === 'SERVICE_REQUEST' ? 'SR' : input.type === 'ACCESS_REQUEST' ? 'ACC' : 'INC';
    const ticketNumber = `${prefix}-${year}-${String(this.ticketCounter).padStart(6, '0')}`;
    const id = `tkt-${Date.now()}`;

    const impact = input.impact || 'MEDIUM';
    const urgency = input.urgency || 'MEDIUM';
    const priority = this.calculatePriority(impact, urgency);

    const requester = this.users.get(input.requesterId) || {
      id: input.requesterId,
      name: 'Employee',
      email: 'requester@csc.gov.in',
      role: 'EMPLOYEE',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    // Auto routing based on category
    const catName = input.categoryName || 'General IT';
    const { groupName, techId } = this.getAutoAssignment(catName);
    const assignedGroup = Array.from(this.groups.values()).find((g) => g.name === groupName);
    const assignedTech = techId ? this.users.get(techId) : undefined;

    // SLA Calculation
    const slaDef = this.slaDefinitions.get(priority) || {
      id: 'default',
      priority,
      name: 'Standard SLA',
      responseMinutes: 60,
      resolveMinutes: 480,
      businessHoursOnly: true,
    };
    const now = new Date();
    const responseDue = new Date(now.getTime() + slaDef.responseMinutes * 60 * 1000);
    const resolutionDue = new Date(now.getTime() + slaDef.resolveMinutes * 60 * 1000);

    const asset = input.assetId ? this.assets.get(input.assetId) : undefined;

    const newTicket: Ticket = {
      id,
      ticketNumber,
      subject: input.subject,
      description: input.description,
      type: input.type || 'INCIDENT',
      status: 'NEW',
      priority,
      impact,
      urgency,
      requesterId: requester.id,
      requesterName: requester.name,
      requesterEmail: requester.email,
      requesterPhone: requester.phone,
      departmentId: input.departmentId || requester.departmentId,
      departmentName: requester.departmentName,
      locationId: input.locationId || requester.locationId,
      locationName: requester.locationName,
      categoryName: catName,
      subcategoryName: input.subcategoryName,
      assignmentGroupId: assignedGroup?.id,
      assignmentGroupName: assignedGroup?.name,
      assignedToId: assignedTech?.id,
      assignedToName: assignedTech?.name,
      assetId: asset?.id,
      assetTag: asset?.assetTag,
      assetName: asset?.name,
      responseDueDate: responseDue.toISOString(),
      resolutionDueDate: resolutionDue.toISOString(),
      slaState: 'HEALTHY',
      slaRemainingSeconds: slaDef.resolveMinutes * 60,
      commentsCount: 0,
      workNotesCount: 0,
      tasksCount: 0,
      completedTasksCount: 0,
      attachmentsCount: 0,
      comments: [],
      tasks: [],
      attachments: [],
      approvals: [],
      timeline: [
        {
          id: `th-${Date.now()}-1`,
          ticketId: id,
          userName: requester.name,
          action: 'TICKET_CREATED',
          comment: `Created ${input.type || 'INCIDENT'} with Priority: ${priority}`,
          ipAddress: input.clientIp || '10.120.1.100',
          createdAt: now.toISOString(),
        },
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    if (assignedGroup) {
      newTicket.timeline?.push({
        id: `th-${Date.now()}-2`,
        ticketId: id,
        userName: 'Auto-Assignment Rule',
        action: 'ASSIGNED_GROUP',
        newValue: assignedGroup.name,
        createdAt: new Date(now.getTime() + 1000).toISOString(),
      });
    }

    this.tickets.set(id, newTicket);

    this.addAuditLog({
      userId: requester.id,
      userName: requester.name,
      userRole: requester.role,
      action: 'TICKET_CREATE',
      module: 'TICKETS',
      objectType: 'Ticket',
      objectId: ticketNumber,
      newValue: `Subject: ${input.subject} | Priority: ${priority} | Group: ${assignedGroup?.name || 'None'}`,
      ipAddress: input.clientIp,
    });

    return newTicket;
  }

  public assignTicket(ticketId: string, groupId?: string, technicianId?: string, actorUser?: User): Ticket | undefined {
    const t = this.tickets.get(ticketId);
    if (!t) return undefined;

    const oldAssignee = t.assignedToName || 'Unassigned';
    const oldGroup = t.assignmentGroupName || 'Unassigned';

    if (groupId) {
      const g = this.groups.get(groupId);
      if (g) {
        t.assignmentGroupId = g.id;
        t.assignmentGroupName = g.name;
      }
    }
    if (technicianId) {
      const tech = this.users.get(technicianId);
      if (tech) {
        t.assignedToId = tech.id;
        t.assignedToName = tech.name;
        if (t.status === 'NEW') {
          t.status = 'ASSIGNED';
        }
      }
    }

    t.updatedAt = new Date().toISOString();
    t.timeline = t.timeline || [];
    t.timeline.push({
      id: `th-${Date.now()}`,
      ticketId: t.id,
      userName: actorUser ? actorUser.name : 'System Admin',
      action: 'REASSIGNED',
      oldValue: `Group: ${oldGroup}, Tech: ${oldAssignee}`,
      newValue: `Group: ${t.assignmentGroupName}, Tech: ${t.assignedToName}`,
      createdAt: new Date().toISOString(),
    });

    this.addAuditLog({
      userId: actorUser?.id,
      userName: actorUser?.name || 'System',
      userRole: actorUser?.role || 'ADMIN',
      action: 'ASSIGNMENT_CHANGE',
      module: 'TICKETS',
      objectType: 'Ticket',
      objectId: t.ticketNumber,
      oldValue: `${oldGroup} / ${oldAssignee}`,
      newValue: `${t.assignmentGroupName} / ${t.assignedToName}`,
    });

    return t;
  }

  public updateTicketStatus(ticketId: string, newStatus: TicketStatus, comment?: string, actorUser?: User): Ticket | undefined {
    const t = this.tickets.get(ticketId);
    if (!t) return undefined;

    const oldStatus = t.status;
    t.status = newStatus;
    const now = new Date().toISOString();
    t.updatedAt = now;

    if (newStatus === 'RESOLVED') {
      t.resolvedAt = now;
      t.slaState = 'MET';
    } else if (newStatus === 'CLOSED') {
      t.closedAt = now;
    } else if (newStatus === 'REOPENED') {
      t.reopenedAt = now;
    }

    t.timeline = t.timeline || [];
    t.timeline.push({
      id: `th-${Date.now()}`,
      ticketId: t.id,
      userName: actorUser ? actorUser.name : 'System',
      action: 'STATUS_CHANGE',
      oldValue: oldStatus,
      newValue: newStatus,
      comment: comment || `Status updated to ${newStatus}`,
      createdAt: now,
    });

    this.addAuditLog({
      userId: actorUser?.id,
      userName: actorUser?.name || 'System',
      userRole: actorUser?.role || 'SERVICE_DESK',
      action: 'STATUS_CHANGE',
      module: 'TICKETS',
      objectType: 'Ticket',
      objectId: t.ticketNumber,
      oldValue: oldStatus,
      newValue: newStatus,
      details: comment,
    });

    return t;
  }

  public addComment(
    ticketId: string,
    content: string,
    isInternal: boolean,
    author: User,
    ipAddress?: string
  ): TicketComment | undefined {
    const t = this.tickets.get(ticketId);
    if (!t) return undefined;

    const comment: TicketComment = {
      id: `c-${Date.now()}`,
      ticketId,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      content,
      isInternal,
      ipAddress: ipAddress || '10.120.1.100',
      createdAt: new Date().toISOString(),
    };

    t.comments = t.comments || [];
    t.comments.push(comment);

    if (isInternal) {
      t.workNotesCount = (t.workNotesCount || 0) + 1;
    } else {
      t.commentsCount = (t.commentsCount || 0) + 1;
    }

    // Automatically set respondedAt if technician comments
    if (!t.respondedAt && author.role !== 'EMPLOYEE') {
      t.respondedAt = new Date().toISOString();
    }

    t.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: author.id,
      userName: author.name,
      userRole: author.role,
      action: isInternal ? 'WORK_NOTE_ADDED' : 'PUBLIC_COMMENT_ADDED',
      module: 'TICKETS',
      objectType: 'Ticket',
      objectId: t.ticketNumber,
      details: content.length > 80 ? content.substring(0, 80) + '...' : content,
      ipAddress,
    });

    return comment;
  }

  public addTask(ticketId: string, title: string, assignedToName?: string): TicketTask | undefined {
    const t = this.tickets.get(ticketId);
    if (!t) return undefined;

    const task: TicketTask = {
      id: `tsk-${Date.now()}`,
      ticketId,
      title,
      isCompleted: false,
      assignedToName: assignedToName || t.assignedToName,
      createdAt: new Date().toISOString(),
    };

    t.tasks = t.tasks || [];
    t.tasks.push(task);
    t.tasksCount = t.tasks.length;
    t.updatedAt = new Date().toISOString();

    return task;
  }

  public toggleTask(ticketId: string, taskId: string): TicketTask | undefined {
    const t = this.tickets.get(ticketId);
    if (!t || !t.tasks) return undefined;

    const task = t.tasks.find((tk) => tk.id === taskId);
    if (!task) return undefined;

    task.isCompleted = !task.isCompleted;
    task.completedAt = task.isCompleted ? new Date().toISOString() : undefined;
    t.completedTasksCount = t.tasks.filter((tk) => tk.isCompleted).length;
    t.updatedAt = new Date().toISOString();

    return task;
  }

  public resolveTicket(ticketId: string, solution: string, actorUser: User): Ticket | undefined {
    const t = this.tickets.get(ticketId);
    if (!t) return undefined;

    t.solution = solution;
    t.status = 'RESOLVED';
    t.resolvedAt = new Date().toISOString();
    t.slaState = 'MET';
    t.updatedAt = new Date().toISOString();

    t.timeline = t.timeline || [];
    t.timeline.push({
      id: `th-${Date.now()}`,
      ticketId: t.id,
      userName: actorUser.name,
      action: 'RESOLVED',
      comment: `Ticket marked as Resolved with Solution: ${solution}`,
      createdAt: new Date().toISOString(),
    });

    this.addAuditLog({
      userId: actorUser.id,
      userName: actorUser.name,
      userRole: actorUser.role,
      action: 'TICKET_RESOLVE',
      module: 'TICKETS',
      objectType: 'Ticket',
      objectId: t.ticketNumber,
      newValue: solution,
    });

    return t;
  }

  public convertTicketToKB(ticketId: string, actorUser: User): KnowledgeArticle | undefined {
    const t = this.tickets.get(ticketId);
    if (!t) return undefined;

    this.kbCounter += 1;
    const articleCode = `KB-TKT-${String(this.kbCounter).padStart(4, '0')}`;
    const kb: KnowledgeArticle = {
      id: `kb-${Date.now()}`,
      articleCode,
      title: `Resolution for: ${t.subject}`,
      category: 'Troubleshooting',
      summary: `Auto-generated from resolved ticket ${t.ticketNumber} (${t.categoryName} - ${t.subcategoryName || ''})`,
      content: `### Problem Description\n${t.description}\n\n### Root Cause & Resolution\n${t.solution || 'Follow standard SOP verification steps.'}\n\n### Related Ticket\nResolved Ticket Ref: **${t.ticketNumber}** by ${t.assignedToName || actorUser.name}.`,
      authorName: actorUser.name,
      version: '1.0',
      isPublished: true,
      viewCount: 1,
      sourceTicketNumber: t.ticketNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.knowledgeArticles.set(kb.id, kb);

    this.addAuditLog({
      userId: actorUser.id,
      userName: actorUser.name,
      userRole: actorUser.role,
      action: 'KB_ARTICLE_CREATED',
      module: 'KB',
      objectType: 'KnowledgeArticle',
      objectId: articleCode,
      newValue: `Converted from Ticket ${t.ticketNumber}`,
    });

    return kb;
  }

  // --- Access Requests ---
  public getAccessRequests(): AccessRequest[] {
    return Array.from(this.accessRequests.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createAccessRequest(input: {
    requesterId: string;
    applicationName: string;
    environment: 'PRODUCTION' | 'UAT' | 'DR' | 'STAGING';
    accessType: 'READ_ONLY' | 'READ_WRITE' | 'ADMIN' | 'DATABASE_ACCESS' | 'SERVER_SSH' | 'VPN_REMOTE';
    validFrom: string;
    validTo: string;
    businessJustification: string;
  }): AccessRequest {
    this.accessCounter += 1;
    const year = new Date().getFullYear();
    const requestNumber = `ACC-${year}-${String(this.accessCounter).padStart(6, '0')}`;
    const requester = this.users.get(input.requesterId) || {
      id: input.requesterId,
      name: 'Employee',
      email: 'requester@csc.gov.in',
      departmentName: 'State Operations',
      role: 'EMPLOYEE',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const req: AccessRequest = {
      id: `acc-${Date.now()}`,
      requestNumber,
      requesterId: requester.id,
      requesterName: requester.name,
      requesterEmail: requester.email,
      departmentName: requester.departmentName || 'State Operations',
      applicationName: input.applicationName,
      environment: input.environment,
      accessType: input.accessType,
      validFrom: input.validFrom,
      validTo: input.validTo,
      businessJustification: input.businessJustification,
      currentStage: 1,
      status: 'PENDING',
      approvals: [
        {
          id: `appr-stage-1`,
          stageNumber: 1,
          roleRequired: 'IT_MANAGER',
          approverName: 'Amit Sharma (IT Operations Manager)',
          status: 'PENDING',
        },
        {
          id: `appr-stage-2`,
          stageNumber: 2,
          roleRequired: 'L3_SPECIALIST',
          approverName: 'Vikram Aditya (Cyber Security CSOC)',
          status: 'PENDING',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.accessRequests.set(req.id, req);

    this.addAuditLog({
      userId: requester.id,
      userName: requester.name,
      userRole: requester.role,
      action: 'ACCESS_REQUEST_CREATED',
      module: 'ACCESS_REQUESTS',
      objectType: 'AccessRequest',
      objectId: requestNumber,
      newValue: `Application: ${input.applicationName} | Env: ${input.environment} | Validity: ${input.validFrom} to ${input.validTo}`,
    });

    return req;
  }

  public approveAccessRequest(
    requestId: string,
    stageNumber: number,
    approver: User,
    comments?: string
  ): AccessRequest | undefined {
    const req = this.accessRequests.get(requestId);
    if (!req) return undefined;

    const step = req.approvals.find((a) => a.stageNumber === stageNumber);
    if (step) {
      step.status = 'APPROVED';
      step.approverId = approver.id;
      step.approverName = approver.name;
      step.comments = comments || 'Approved in accordance with ISO 27001 Access Control Policy.';
      step.actionedAt = new Date().toISOString();
    }

    const allApproved = req.approvals.every((a) => a.status === 'APPROVED');
    if (allApproved) {
      req.status = 'APPROVED';
    } else {
      req.currentStage += 1;
    }
    req.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: approver.id,
      userName: approver.name,
      userRole: approver.role,
      action: 'ACCESS_REQUEST_APPROVED',
      module: 'ACCESS_REQUESTS',
      objectType: 'AccessRequest',
      objectId: req.requestNumber,
      details: `Stage ${stageNumber} approved by ${approver.name}. Comments: ${comments || 'None'}`,
    });

    return req;
  }

  public rejectAccessRequest(requestId: string, approver: User, comments: string): AccessRequest | undefined {
    const req = this.accessRequests.get(requestId);
    if (!req) return undefined;

    req.status = 'REJECTED';
    const currentStep = req.approvals.find((a) => a.stageNumber === req.currentStage) || req.approvals[0];
    if (currentStep) {
      currentStep.status = 'REJECTED';
      currentStep.approverId = approver.id;
      currentStep.approverName = approver.name;
      currentStep.comments = comments;
      currentStep.actionedAt = new Date().toISOString();
    }
    req.updatedAt = new Date().toISOString();

    this.addAuditLog({
      userId: approver.id,
      userName: approver.name,
      userRole: approver.role,
      action: 'ACCESS_REQUEST_REJECTED',
      module: 'ACCESS_REQUESTS',
      objectType: 'AccessRequest',
      objectId: req.requestNumber,
      details: `Rejected by ${approver.name}. Reason: ${comments}`,
    });

    return req;
  }

  // --- Change Management (CAB) ---
  public getChanges(): ChangeRequest[] {
    return Array.from(this.changes.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createChange(input: Omit<ChangeRequest, 'id' | 'changeNumber' | 'createdAt' | 'updatedAt'>): ChangeRequest {
    this.changeCounter += 1;
    const year = new Date().getFullYear();
    const changeNumber = `CR-${year}-${String(this.changeCounter).padStart(6, '0')}`;
    const id = `cr-${Date.now()}`;

    const cr: ChangeRequest = {
      ...input,
      id,
      changeNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.changes.set(id, cr);

    this.addAuditLog({
      userId: input.ownerId,
      userName: input.ownerName,
      userRole: 'CHANGE_MANAGER',
      action: 'CHANGE_REQUEST_CREATED',
      module: 'CHANGES',
      objectType: 'ChangeRequest',
      objectId: changeNumber,
      newValue: `Title: ${input.title} | Type: ${input.type} | Risk: ${input.riskLevel}`,
    });

    return cr;
  }

  // --- Problem Management ---
  public getProblems(): ProblemRecord[] {
    return Array.from(this.problems.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createProblem(input: Omit<ProblemRecord, 'id' | 'problemNumber' | 'createdAt' | 'updatedAt'>): ProblemRecord {
    this.problemCounter += 1;
    const year = new Date().getFullYear();
    const problemNumber = `PRB-${year}-${String(this.problemCounter).padStart(6, '0')}`;
    const id = `prb-${Date.now()}`;

    const prb: ProblemRecord = {
      ...input,
      id,
      problemNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.problems.set(id, prb);

    this.addAuditLog({
      userId: input.ownerId,
      userName: input.ownerName,
      userRole: 'PROBLEM_MANAGER',
      action: 'PROBLEM_RECORD_CREATED',
      module: 'PROBLEMS',
      objectType: 'ProblemRecord',
      objectId: problemNumber,
      newValue: `Title: ${input.title} | Root Cause Identified: ${Boolean(input.rootCause)}`,
    });

    return prb;
  }

  // --- Asset Management (CMDB) ---
  public getAssets(filter?: { type?: string; status?: string; search?: string }): Asset[] {
    let list = Array.from(this.assets.values());
    if (filter?.type && filter.type !== 'ALL') {
      list = list.filter((a) => a.type === filter.type);
    }
    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((a) => a.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.assetTag.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          (a.ipAddress && a.ipAddress.includes(q)) ||
          (a.hostname && a.hostname.toLowerCase().includes(q)) ||
          (a.serialNumber && a.serialNumber.toLowerCase().includes(q))
      );
    }
    return list;
  }

  public createAsset(input: Omit<Asset, 'id' | 'assetTag' | 'createdAt' | 'updatedAt'>): Asset {
    this.assetCounter += 1;
    const assetTag = `AST-${String(this.assetCounter).padStart(4, '0')}`;
    const id = `ast-${Date.now()}`;

    const newAsset: Asset = {
      ...input,
      id,
      assetTag,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.assets.set(id, newAsset);

    this.addAuditLog({
      userName: 'Asset Manager',
      userRole: 'ASSET_MANAGER',
      action: 'ASSET_CREATED',
      module: 'ASSETS',
      objectType: 'Asset',
      objectId: assetTag,
      newValue: `Name: ${input.name} | Type: ${input.type} | IP: ${input.ipAddress || 'None'}`,
    });

    return newAsset;
  }

  // --- Knowledge Base ---
  public getKnowledgeArticles(search?: string, category?: string): KnowledgeArticle[] {
    let list = Array.from(this.knowledgeArticles.values());
    if (category && category !== 'ALL') {
      list = list.filter((k) => k.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (k) =>
          k.title.toLowerCase().includes(q) ||
          k.content.toLowerCase().includes(q) ||
          (k.summary && k.summary.toLowerCase().includes(q)) ||
          k.articleCode.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public createKnowledgeArticle(input: Omit<KnowledgeArticle, 'id' | 'articleCode' | 'viewCount' | 'createdAt' | 'updatedAt'>): KnowledgeArticle {
    this.kbCounter += 1;
    const articleCode = `KB-${String(this.kbCounter).padStart(4, '0')}`;
    const id = `kb-${Date.now()}`;

    const kb: KnowledgeArticle = {
      ...input,
      id,
      articleCode,
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.knowledgeArticles.set(id, kb);
    return kb;
  }

  // --- Dashboard Metrics & Analytics ---
  public getDashboardMetrics(): DashboardMetrics {
    const allTickets = Array.from(this.tickets.values());
    const total = allTickets.length;

    const open = allTickets.filter((t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED' && t.status !== 'CANCELLED').length;
    const newT = allTickets.filter((t) => t.status === 'NEW').length;
    const inProgress = allTickets.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;
    const pending = allTickets.filter((t) => t.status === 'PENDING' || t.status === 'AWAITING_USER' || t.status === 'AWAITING_APPROVAL').length;
    const resolved = allTickets.filter((t) => t.status === 'RESOLVED').length;
    const closed = allTickets.filter((t) => t.status === 'CLOSED').length;
    const slaBreached = allTickets.filter((t) => t.slaState === 'BREACHED').length;
    const slaAtRisk = allTickets.filter((t) => t.slaState === 'AT_RISK').length;
    const critical = allTickets.filter((t) => t.priority === 'CRITICAL' && t.status !== 'CLOSED').length;
    const high = allTickets.filter((t) => t.priority === 'HIGH' && t.status !== 'CLOSED').length;

    const pendingApprovals =
      Array.from(this.accessRequests.values()).filter((a) => a.status === 'PENDING').length +
      Array.from(this.changes.values()).filter((c) => c.status === 'APPROVAL').length;

    const activeAssets = Array.from(this.assets.values()).filter((a) => a.status === 'ACTIVE').length;
    const openProblems = Array.from(this.problems.values()).filter((p) => p.status !== 'RESOLVED' && p.status !== 'CLOSED').length;
    const activeChanges = Array.from(this.changes.values()).filter((c) => c.status !== 'COMPLETED' && c.status !== 'CANCELLED').length;

    // Status breakdown
    const statusMap: Record<string, { count: number; color: string }> = {
      NEW: { count: 0, color: '#3B82F6' },
      ASSIGNED: { count: 0, color: '#6366F1' },
      IN_PROGRESS: { count: 0, color: '#F59E0B' },
      PENDING: { count: 0, color: '#8B5CF6' },
      AWAITING_APPROVAL: { count: 0, color: '#EC4899' },
      RESOLVED: { count: 0, color: '#10B981' },
      CLOSED: { count: 0, color: '#64748B' },
    };
    allTickets.forEach((t) => {
      if (statusMap[t.status]) {
        statusMap[t.status].count += 1;
      }
    });
    const ticketsByStatus = Object.entries(statusMap).map(([name, val]) => ({
      name,
      value: val.count,
      color: val.color,
    }));

    // Priority breakdown
    const priorityMap: Record<string, { count: number; color: string }> = {
      CRITICAL: { count: 0, color: '#EF4444' },
      HIGH: { count: 0, color: '#F97316' },
      MEDIUM: { count: 0, color: '#FBBF24' },
      LOW: { count: 0, color: '#34D399' },
    };
    allTickets.forEach((t) => {
      if (priorityMap[t.priority]) priorityMap[t.priority].count += 1;
    });
    const ticketsByPriority = Object.entries(priorityMap).map(([name, val]) => ({
      name,
      value: val.count,
      color: val.color,
    }));

    // Category breakdown
    const catMap: Record<string, number> = {};
    allTickets.forEach((t) => {
      const c = t.categoryName || 'Other';
      catMap[c] = (catMap[c] || 0) + 1;
    });
    const ticketsByCategory = Object.entries(catMap).map(([name, count]) => ({ name, count }));

    // Department breakdown
    const deptMap: Record<string, number> = {};
    allTickets.forEach((t) => {
      const d = t.departmentName || 'General';
      deptMap[d] = (deptMap[d] || 0) + 1;
    });
    const ticketsByDepartment = Object.entries(deptMap).map(([name, count]) => ({ name, count }));

    // Technician performance
    const techMap: Record<string, { count: number; resolvedCount: number }> = {};
    allTickets.forEach((t) => {
      if (t.assignedToName) {
        if (!techMap[t.assignedToName]) techMap[t.assignedToName] = { count: 0, resolvedCount: 0 };
        techMap[t.assignedToName].count += 1;
        if (t.status === 'RESOLVED' || t.status === 'CLOSED') {
          techMap[t.assignedToName].resolvedCount += 1;
        }
      }
    });
    const ticketsByTechnician = Object.entries(techMap).map(([name, data]) => ({
      name,
      count: data.count,
      resolvedCount: data.resolvedCount,
    }));

    // Realistic trend
    const ticketsTrend = [
      { date: 'Mon', created: 14, resolved: 12 },
      { date: 'Tue', created: 22, resolved: 19 },
      { date: 'Wed', created: 18, resolved: 16 },
      { date: 'Thu', created: 25, resolved: 21 },
      { date: 'Fri', created: 30, resolved: 28 },
      { date: 'Sat', created: 8, resolved: 10 },
      { date: 'Sun', created: 5, resolved: 6 },
    ];

    return {
      totalTickets: total,
      openTickets: open,
      newTickets: newT,
      inProgressTickets: inProgress,
      pendingTickets: pending,
      resolvedTickets: resolved,
      closedTickets: closed,
      slaBreached,
      slaAtRisk,
      criticalTickets: critical,
      highPriorityTickets: high,
      pendingApprovals,
      activeAssets,
      openProblems,
      activeChanges,
      avgResolutionTimeHours: 3.2,
      avgResponseTimeMinutes: 18.5,
      slaCompliancePercentage: 94.8,
      ticketsByStatus,
      ticketsByPriority,
      ticketsByCategory,
      ticketsByDepartment,
      ticketsByTechnician,
      ticketsTrend,
    };
  }
}

// Global Singleton Instance for Dev and Server
export const itsmStorage = new ITSMStorage();
