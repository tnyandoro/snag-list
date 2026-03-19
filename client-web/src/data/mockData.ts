// Types
export type TicketType = 'incident' | 'service_request' | 'problem' | 'change';
export type TicketStatus = 'new' | 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type UserRole = 'end_user' | 'agent' | 'admin';
export type ChangeStatus = 'draft' | 'submitted' | 'approved' | 'scheduled' | 'implementing' | 'completed' | 'rejected';
export type AssetStatus = 'active' | 'inactive' | 'maintenance' | 'retired';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  type: TicketType;
  status: TicketStatus;
  priority: Priority;
  category: string;
  subcategory: string;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  requesterId: string;
  assigneeId: string | null;
  tags: string[];
  comments: Comment[];
  attachments: Attachment[];
  slaBreached: boolean;
  resolutionTime?: number;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  status: AssetStatus;
  serialNumber: string;
  manufacturer: string;
  model: string;
  location: string;
  assignedTo: string | null;
  purchaseDate: string;
  warrantyExpiry: string;
  value: number;
  tags: string[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: ChangeStatus;
  priority: Priority;
  type: 'standard' | 'normal' | 'emergency';
  impact: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  requesterId: string;
  assigneeId: string | null;
  approvers: { userId: string; status: 'pending' | 'approved' | 'rejected'; date?: string }[];
  scheduledStart: string;
  scheduledEnd: string;
  createdAt: string;
  affectedServices: string[];
  rollbackPlan: string;
}

// Sample Users
export const users: User[] = [
  { id: 'u1', name: 'John Smith', email: 'john.smith@company.com', role: 'admin', avatar: 'JS', department: 'IT Operations' },
  { id: 'u2', name: 'Sarah Johnson', email: 'sarah.j@company.com', role: 'agent', avatar: 'SJ', department: 'Service Desk' },
  { id: 'u3', name: 'Mike Chen', email: 'mike.chen@company.com', role: 'agent', avatar: 'MC', department: 'Infrastructure' },
  { id: 'u4', name: 'Emily Davis', email: 'emily.d@company.com', role: 'agent', avatar: 'ED', department: 'Applications' },
  { id: 'u5', name: 'Alex Wilson', email: 'alex.w@company.com', role: 'end_user', avatar: 'AW', department: 'Marketing' },
  { id: 'u6', name: 'Lisa Brown', email: 'lisa.b@company.com', role: 'end_user', avatar: 'LB', department: 'Finance' },
  { id: 'u7', name: 'David Lee', email: 'david.l@company.com', role: 'end_user', avatar: 'DL', department: 'Sales' },
  { id: 'u8', name: 'Rachel Green', email: 'rachel.g@company.com', role: 'agent', avatar: 'RG', department: 'Security' },
  { id: 'u9', name: 'Tom Anderson', email: 'tom.a@company.com', role: 'admin', avatar: 'TA', department: 'IT Management' },
  { id: 'u10', name: 'Jennifer Martinez', email: 'jennifer.m@company.com', role: 'end_user', avatar: 'JM', department: 'HR' },
];

// Sample Tickets (50+)
export const tickets: Ticket[] = [
  {
    id: 'INC-001',
    title: 'Email server down - Cannot send or receive emails',
    description: 'Multiple users reporting inability to send or receive emails since 8:00 AM. Exchange server appears to be unresponsive.',
    type: 'incident',
    status: 'in_progress',
    priority: 'critical',
    category: 'Email',
    subcategory: 'Exchange Server',
    createdAt: '2026-01-30T08:15:00Z',
    updatedAt: '2026-01-30T08:45:00Z',
    dueDate: '2026-01-30T10:15:00Z',
    requesterId: 'u5',
    assigneeId: 'u3',
    tags: ['email', 'outage', 'exchange'],
    comments: [
      { id: 'c1', userId: 'u3', content: 'Investigating the issue. Initial diagnostics show high CPU usage on the mail server.', isInternal: true, createdAt: '2026-01-30T08:30:00Z' },
      { id: 'c2', userId: 'u3', content: 'We are aware of the email issue and working on it. Expected resolution within 2 hours.', isInternal: false, createdAt: '2026-01-30T08:35:00Z' },
    ],
    attachments: [],
    slaBreached: false,
  },
  {
    id: 'INC-002',
    title: 'VPN connection dropping frequently',
    description: 'Remote workers experiencing intermittent VPN disconnections every 15-20 minutes.',
    type: 'incident',
    status: 'open',
    priority: 'high',
    category: 'Network',
    subcategory: 'VPN',
    createdAt: '2026-01-29T14:30:00Z',
    updatedAt: '2026-01-29T16:00:00Z',
    dueDate: '2026-01-30T14:30:00Z',
    requesterId: 'u7',
    assigneeId: 'u3',
    tags: ['vpn', 'network', 'remote'],
    comments: [],
    attachments: [],
    slaBreached: false,
  },
  {
    id: 'INC-003',
    title: 'Printer not working on 3rd floor',
    description: 'HP LaserJet Pro in the 3rd floor break room showing offline status.',
    type: 'incident',
    status: 'resolved',
    priority: 'low',
    category: 'Hardware',
    subcategory: 'Printer',
    createdAt: '2026-01-28T10:00:00Z',
    updatedAt: '2026-01-28T14:30:00Z',
    dueDate: '2026-01-29T10:00:00Z',
    requesterId: 'u6',
    assigneeId: 'u2',
    tags: ['printer', 'hardware'],
    comments: [
      { id: 'c3', userId: 'u2', content: 'Printer was jammed. Cleared the jam and tested - working now.', isInternal: false, createdAt: '2026-01-28T14:30:00Z' },
    ],
    attachments: [],
    slaBreached: false,
    resolutionTime: 270,
  },
  {
    id: 'SR-001',
    title: 'New laptop request for new hire',
    description: 'Requesting a new MacBook Pro for incoming developer starting Feb 1st.',
    type: 'service_request',
    status: 'pending',
    priority: 'medium',
    category: 'Hardware',
    subcategory: 'Laptop',
    createdAt: '2026-01-25T09:00:00Z',
    updatedAt: '2026-01-27T11:00:00Z',
    dueDate: '2026-02-01T09:00:00Z',
    requesterId: 'u10',
    assigneeId: 'u2',
    tags: ['hardware', 'onboarding', 'laptop'],
    comments: [
      { id: 'c4', userId: 'u2', content: 'Laptop ordered. Expected delivery Jan 31st.', isInternal: false, createdAt: '2026-01-27T11:00:00Z' },
    ],
    attachments: [],
    slaBreached: false,
  },
  {
    id: 'SR-002',
    title: 'Software installation - Adobe Creative Suite',
    description: 'Need Adobe Creative Suite installed for marketing campaign work.',
    type: 'service_request',
    status: 'in_progress',
    priority: 'medium',
    category: 'Software',
    subcategory: 'Installation',
    createdAt: '2026-01-29T11:00:00Z',
    updatedAt: '2026-01-30T08:00:00Z',
    dueDate: '2026-01-31T11:00:00Z',
    requesterId: 'u5',
    assigneeId: 'u4',
    tags: ['software', 'adobe', 'installation'],
    comments: [],
    attachments: [],
    slaBreached: false,
  },
  {
    id: 'SR-003',
    title: 'Password reset for SAP system',
    description: 'Locked out of SAP after too many failed attempts.',
    type: 'service_request',
    status: 'closed',
    priority: 'high',
    category: 'Access',
    subcategory: 'Password Reset',
    createdAt: '2026-01-30T07:30:00Z',
    updatedAt: '2026-01-30T07:45:00Z',
    dueDate: '2026-01-30T08:30:00Z',
    requesterId: 'u6',
    assigneeId: 'u2',
    tags: ['password', 'sap', 'access'],
    comments: [
      { id: 'c5', userId: 'u2', content: 'Password has been reset. Temporary password sent via secure channel.', isInternal: false, createdAt: '2026-01-30T07:45:00Z' },
    ],
    attachments: [],
    slaBreached: false,
    resolutionTime: 15,
  },
  {
    id: 'INC-004',
    title: 'CRM system running extremely slow',
    description: 'Salesforce taking 30+ seconds to load pages. Multiple users affected.',
    type: 'incident',
    status: 'in_progress',
    priority: 'high',
    category: 'Application',
    subcategory: 'CRM',
    createdAt: '2026-01-30T07:00:00Z',
    updatedAt: '2026-01-30T08:30:00Z',
    dueDate: '2026-01-30T11:00:00Z',
    requesterId: 'u7',
    assigneeId: 'u4',
    tags: ['salesforce', 'performance', 'crm'],
    comments: [],
    attachments: [],
    slaBreached: false,
  },
  {
    id: 'INC-005',
    title: 'Blue screen error on workstation',
    description: 'Getting BSOD with error code 0x0000007E when opening multiple applications.',
    type: 'incident',
    status: 'new',
    priority: 'medium',
    category: 'Hardware',
    subcategory: 'Workstation',
    createdAt: '2026-01-30T08:30:00Z',
    updatedAt: '2026-01-30T08:30:00Z',
    dueDate: '2026-01-31T08:30:00Z',
    requesterId: 'u10',
    assigneeId: null,
    tags: ['bsod', 'hardware', 'workstation'],
    comments: [],
    attachments: [],
    slaBreached: false,
  },
  {
    id: 'PRB-001',
    title: 'Recurring network latency issues in Building B',
    description: 'Multiple incidents reported about slow network in Building B. Need root cause analysis.',
    type: 'problem',
    status: 'in_progress',
    priority: 'high',
    category: 'Network',
    subcategory: 'Infrastructure',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-29T15:00:00Z',
    dueDate: '2026-02-03T10:00:00Z',
    requesterId: 'u1',
    assigneeId: 'u3',
    tags: ['network', 'latency', 'building-b'],
    comments: [
      { id: 'c6', userId: 'u3', content: 'Initial analysis shows potential switch configuration issues. Scheduling maintenance window.', isInternal: true, createdAt: '2026-01-29T15:00:00Z' },
    ],
    attachments: [],
    slaBreached: false,
  },
  {
    id: 'PRB-002',
    title: 'Application crashes after Windows updates',
    description: 'Legacy ERP application crashing after recent Windows security patches.',
    type: 'problem',
    status: 'open',
    priority: 'critical',
    category: 'Application',
    subcategory: 'ERP',
    createdAt: '2026-01-28T09:00:00Z',
    updatedAt: '2026-01-29T14:00:00Z',
    dueDate: '2026-01-31T09:00:00Z',
    requesterId: 'u9',
    assigneeId: 'u4',
    tags: ['erp', 'windows', 'compatibility'],
    comments: [],
    attachments: [],
    slaBreached: false,
  },
  {
    id: 'SR-004',
    title: 'New user account creation',
    description: 'Create AD account, email, and system access for new employee in Finance.',
    type: 'service_request',
    status: 'in_progress',
    priority: 'medium',
    category: 'Access',
    subcategory: 'Account Creation',
    createdAt: '2026-01-29T13:00:00Z',
    updatedAt: '2026-01-30T08:00:00Z',
    dueDate: '2026-01-31T13:00:00Z',
    requesterId: 'u10',
    assigneeId: 'u2',
    tags: ['onboarding', 'account', 'access'],
    comments: [],
    attachments: [],
    slaBreached: false,
  },
  {
    id: 'SR-005',
    title: 'VPN access request for contractor',
    description: 'External contractor needs VPN access for 3-month project.',
    type: 'service_request',
    status: 'pending',
    priority: 'medium',
    category: 'Access',
    subcategory: 'VPN',
    createdAt: '2026-01-28T15:00:00Z',
    updatedAt: '2026-01-29T10:00:00Z',
    dueDate: '2026-01-30T15:00:00Z',
    requesterId: 'u7',
    assigneeId: 'u8',
    tags: ['vpn', 'contractor', 'access'],
    comments: [
      { id: 'c7', userId: 'u8', content: 'Awaiting security clearance approval from manager.', isInternal: false, createdAt: '2026-01-29T10:00:00Z' },
    ],
    attachments: [],
    slaBreached: false,
  },
  {
    id: 'INC-006',
    title: 'WiFi not connecting in conference room A',
    description: 'Unable to connect to corporate WiFi in main conference room.',
    type: 'incident',
    status: 'resolved',
    priority: 'medium',
    category: 'Network',
    subcategory: 'WiFi',
    createdAt: '2026-01-29T09:00:00Z',
    updatedAt: '2026-01-29T11:30:00Z',
    dueDate: '2026-01-30T09:00:00Z',
    requesterId: 'u5',
    assigneeId: 'u3',
    tags: ['wifi', 'network', 'conference'],
    comments: [],
    attachments: [],
    slaBreached: false,
    resolutionTime: 150,
  },
  {
    id: 'INC-007',
    title: 'Database connection timeout errors',
    description: 'Production database showing intermittent connection timeouts.',
    type: 'incident',
    status: 'in_progress',
    priority: 'critical',
    category: 'Database',
    subcategory: 'SQL Server',
    createdAt: '2026-01-30T06:00:00Z',
    updatedAt: '2026-01-30T08:00:00Z',
    dueDate: '2026-01-30T08:00:00Z',
    requesterId: 'u4',
    assigneeId: 'u3',
    tags: ['database', 'sql', 'production'],
    comments: [],
    attachments: [],
    slaBreached: true,
  },
  {
    id: 'SR-006',
    title: 'Request for additional monitor',
    description: 'Need second monitor for productivity improvement.',
    type: 'service_request',
    status: 'new',
    priority: 'low',
    category: 'Hardware',
    subcategory: 'Monitor',
    createdAt: '2026-01-30T08:00:00Z',
    updatedAt: '2026-01-30T08:00:00Z',
    dueDate: '2026-02-06T08:00:00Z',
    requesterId: 'u6',
    assigneeId: null,
    tags: ['hardware', 'monitor'],
    comments: [],
    attachments: [],
    slaBreached: false,
  },
  {
    id: 'INC-008',
    title: 'Outlook calendar sync issues',
    description: 'Calendar appointments not syncing between desktop and mobile.',
    type: 'incident',
    status: 'open',
    priority: 'medium',
    category: 'Email',
    subcategory: 'Outlook',
    createdAt: '2026-01-29T16:00:00Z',
    updatedAt: '2026-01-30T07:00:00Z',
    dueDate: '2026-01-30T16:00:00Z',
    requesterId: 'u10',
    assigneeId: 'u2',
    tags: ['outlook', 'calendar', 'sync'],
    comments: [],
    attachments: [],
    slaBreached: false,
  },
  {
    id: 'SR-007',
    title: 'SharePoint site creation request',
    description: 'Need new SharePoint site for Project Alpha team collaboration.',
    type: 'service_request',
    status: 'in_progress',
    priority: 'medium',
    category: 'Application',
    subcategory: 'SharePoint',
    createdAt: '2026-01-27T10:00:00Z',
    updatedAt: '2026-01-29T14:00:00Z',
    dueDate: '2026-01-31T10:00:00Z',
    requesterId: 'u7',
    assigneeId: 'u4',
    tags: ['sharepoint', 'collaboration'],
    comments: [],
    attachments: [],
    slaBreached: false,
  },
  {
    id: 'INC-009',
    title: 'Security certificate expired warning',
    description: 'Internal portal showing certificate expired warnings to all users.',
    type: 'incident',
    status: 'in_progress',
    priority: 'high',
    category: 'Security',
    subcategory: 'Certificates',
    createdAt: '2026-01-30T07:30:00Z',
    updatedAt: '2026-01-30T08:15:00Z',
    dueDate: '2026-01-30T09:30:00Z',
    requesterId: 'u8',
    assigneeId: 'u8',
    tags: ['security', 'certificate', 'ssl'],
    comments: [],
    attachments: [],
    slaBreached: false,
  },
  {
    id: 'SR-008',
    title: 'Software license renewal - Microsoft 365',
    description: 'Annual renewal for 50 Microsoft 365 E3 licenses.',
    type: 'service_request',
    status: 'pending',
    priority: 'high',
    category: 'Software',
    subcategory: 'Licensing',
    createdAt: '2026-01-15T09:00:00Z',
    updatedAt: '2026-01-28T11:00:00Z',
    dueDate: '2026-02-01T09:00:00Z',
    requesterId: 'u1',
    assigneeId: 'u9',
    tags: ['license', 'microsoft', 'renewal'],
    comments: [],
    attachments: [],
    slaBreached: false,
  },
  {
    id: 'INC-010',
    title: 'Phone system not routing calls correctly',
    description: 'Incoming calls to main line not being routed to correct departments.',
    type: 'incident',
    status: 'new',
    priority: 'high',
    category: 'Telephony',
    subcategory: 'PBX',
    createdAt: '2026-01-30T08:45:00Z',
    updatedAt: '2026-01-30T08:45:00Z',
    dueDate: '2026-01-30T12:45:00Z',
    requesterId: 'u6',
    assigneeId: null,
    tags: ['phone', 'pbx', 'routing'],
    comments: [],
    attachments: [],
    slaBreached: false,
  },
  // Additional tickets for comprehensive data
  ...generateAdditionalTickets(),
];

function generateAdditionalTickets(): Ticket[] {
  const additionalTickets: Ticket[] = [];
  const titles = [
    { title: 'Slow login times on domain computers', type: 'incident' as TicketType, category: 'Network', subcategory: 'Active Directory' },
    { title: 'Request for remote desktop access', type: 'service_request' as TicketType, category: 'Access', subcategory: 'RDP' },
    { title: 'Antivirus update failing', type: 'incident' as TicketType, category: 'Security', subcategory: 'Antivirus' },
    { title: 'New software deployment request', type: 'service_request' as TicketType, category: 'Software', subcategory: 'Deployment' },
    { title: 'Backup job failed overnight', type: 'incident' as TicketType, category: 'Infrastructure', subcategory: 'Backup' },
    { title: 'Request for file share access', type: 'service_request' as TicketType, category: 'Access', subcategory: 'File Share' },
    { title: 'Monitor flickering intermittently', type: 'incident' as TicketType, category: 'Hardware', subcategory: 'Monitor' },
    { title: 'Request for mobile device enrollment', type: 'service_request' as TicketType, category: 'Mobile', subcategory: 'MDM' },
    { title: 'Application license expired', type: 'incident' as TicketType, category: 'Software', subcategory: 'Licensing' },
    { title: 'Network drive mapping issue', type: 'incident' as TicketType, category: 'Network', subcategory: 'File Share' },
    { title: 'Request for video conferencing setup', type: 'service_request' as TicketType, category: 'Hardware', subcategory: 'AV Equipment' },
    { title: 'Keyboard not responding', type: 'incident' as TicketType, category: 'Hardware', subcategory: 'Peripherals' },
    { title: 'Request for database access', type: 'service_request' as TicketType, category: 'Access', subcategory: 'Database' },
    { title: 'Slow file transfer speeds', type: 'incident' as TicketType, category: 'Network', subcategory: 'Performance' },
    { title: 'Request for software training', type: 'service_request' as TicketType, category: 'Training', subcategory: 'Software' },
    { title: 'USB ports not working', type: 'incident' as TicketType, category: 'Hardware', subcategory: 'Workstation' },
    { title: 'Request for cloud storage quota increase', type: 'service_request' as TicketType, category: 'Storage', subcategory: 'Cloud' },
    { title: 'Application crashing on startup', type: 'incident' as TicketType, category: 'Application', subcategory: 'Desktop App' },
    { title: 'Request for API access', type: 'service_request' as TicketType, category: 'Access', subcategory: 'API' },
    { title: 'Webcam not detected', type: 'incident' as TicketType, category: 'Hardware', subcategory: 'Peripherals' },
    { title: 'Request for security group membership', type: 'service_request' as TicketType, category: 'Access', subcategory: 'Active Directory' },
    { title: 'Screen sharing not working in Teams', type: 'incident' as TicketType, category: 'Application', subcategory: 'Teams' },
    { title: 'Request for printer installation', type: 'service_request' as TicketType, category: 'Hardware', subcategory: 'Printer' },
    { title: 'Outlook search not returning results', type: 'incident' as TicketType, category: 'Email', subcategory: 'Outlook' },
    { title: 'Request for VDI access', type: 'service_request' as TicketType, category: 'Access', subcategory: 'VDI' },
    { title: 'Browser extensions causing issues', type: 'incident' as TicketType, category: 'Application', subcategory: 'Browser' },
    { title: 'Request for development environment', type: 'service_request' as TicketType, category: 'Software', subcategory: 'Development' },
    { title: 'Audio not working in meetings', type: 'incident' as TicketType, category: 'Hardware', subcategory: 'Audio' },
    { title: 'Request for SSL certificate', type: 'service_request' as TicketType, category: 'Security', subcategory: 'Certificates' },
    { title: 'Disk space running low', type: 'incident' as TicketType, category: 'Infrastructure', subcategory: 'Storage' },
    { title: 'Request for project management tool access', type: 'service_request' as TicketType, category: 'Application', subcategory: 'Project Management' },
    { title: 'Two-factor authentication issues', type: 'incident' as TicketType, category: 'Security', subcategory: 'MFA' },
    { title: 'Request for data migration', type: 'service_request' as TicketType, category: 'Data', subcategory: 'Migration' },
    { title: 'Software update causing errors', type: 'incident' as TicketType, category: 'Software', subcategory: 'Updates' },
    { title: 'Request for reporting dashboard access', type: 'service_request' as TicketType, category: 'Application', subcategory: 'BI Tools' },
    { title: 'Recurring server memory issues', type: 'problem' as TicketType, category: 'Infrastructure', subcategory: 'Server' },
    { title: 'Intermittent application timeouts', type: 'problem' as TicketType, category: 'Application', subcategory: 'Performance' },
    { title: 'Frequent printer driver conflicts', type: 'problem' as TicketType, category: 'Hardware', subcategory: 'Printer' },
    { title: 'Recurring VPN authentication failures', type: 'problem' as TicketType, category: 'Network', subcategory: 'VPN' },
    { title: 'Persistent email delivery delays', type: 'problem' as TicketType, category: 'Email', subcategory: 'Exchange' },
  ];

  const statuses: TicketStatus[] = ['new', 'open', 'in_progress', 'pending', 'resolved', 'closed'];
  const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];
  const requesters = ['u5', 'u6', 'u7', 'u10'];
  const assignees = ['u2', 'u3', 'u4', 'u8', null];

  titles.forEach((item, index) => {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const daysAgo = Math.floor(Math.random() * 14);
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - daysAgo);
    
    const prefix = item.type === 'incident' ? 'INC' : item.type === 'service_request' ? 'SR' : 'PRB';
    
    additionalTickets.push({
      id: `${prefix}-${String(100 + index).padStart(3, '0')}`,
      title: item.title,
      description: `Detailed description for: ${item.title}. User reported this issue and needs assistance.`,
      type: item.type,
      status,
      priority,
      category: item.category,
      subcategory: item.subcategory,
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
      dueDate: new Date(createdDate.getTime() + (priority === 'critical' ? 4 : priority === 'high' ? 8 : priority === 'medium' ? 24 : 72) * 60 * 60 * 1000).toISOString(),
      requesterId: requesters[Math.floor(Math.random() * requesters.length)],
      assigneeId: assignees[Math.floor(Math.random() * assignees.length)],
      tags: [item.category.toLowerCase(), item.subcategory.toLowerCase().replace(' ', '-')],
      comments: [],
      attachments: [],
      slaBreached: Math.random() > 0.85,
      resolutionTime: status === 'resolved' || status === 'closed' ? Math.floor(Math.random() * 480) + 30 : undefined,
    });
  });

  return additionalTickets;
}

// Assets (30+)
export const assets: Asset[] = [
  { id: 'AST-001', name: 'Dell OptiPlex 7090', type: 'Desktop', status: 'active', serialNumber: 'DELL7090-001', manufacturer: 'Dell', model: 'OptiPlex 7090', location: 'Building A - Floor 2', assignedTo: 'u5', purchaseDate: '2024-03-15', warrantyExpiry: '2027-03-15', value: 1200, tags: ['desktop', 'dell'] },
  { id: 'AST-002', name: 'MacBook Pro 16"', type: 'Laptop', status: 'active', serialNumber: 'MBP16-2024-001', manufacturer: 'Apple', model: 'MacBook Pro 16" M3', location: 'Building A - Floor 3', assignedTo: 'u4', purchaseDate: '2024-06-01', warrantyExpiry: '2027-06-01', value: 3499, tags: ['laptop', 'apple', 'developer'] },
  { id: 'AST-003', name: 'HP LaserJet Pro MFP', type: 'Printer', status: 'active', serialNumber: 'HPLJ-MFP-001', manufacturer: 'HP', model: 'LaserJet Pro MFP M428fdw', location: 'Building A - Floor 2', assignedTo: null, purchaseDate: '2023-09-20', warrantyExpiry: '2026-09-20', value: 450, tags: ['printer', 'hp', 'shared'] },
  { id: 'AST-004', name: 'Cisco Catalyst 9200', type: 'Network Switch', status: 'active', serialNumber: 'CISCO-9200-001', manufacturer: 'Cisco', model: 'Catalyst 9200-48P', location: 'Server Room A', assignedTo: null, purchaseDate: '2023-01-10', warrantyExpiry: '2028-01-10', value: 5200, tags: ['network', 'cisco', 'infrastructure'] },
  { id: 'AST-005', name: 'Dell PowerEdge R750', type: 'Server', status: 'active', serialNumber: 'DELL-R750-001', manufacturer: 'Dell', model: 'PowerEdge R750', location: 'Data Center', assignedTo: null, purchaseDate: '2024-01-15', warrantyExpiry: '2029-01-15', value: 12500, tags: ['server', 'dell', 'production'] },
  { id: 'AST-006', name: 'Lenovo ThinkPad X1 Carbon', type: 'Laptop', status: 'active', serialNumber: 'LNV-X1C-001', manufacturer: 'Lenovo', model: 'ThinkPad X1 Carbon Gen 11', location: 'Building B - Floor 1', assignedTo: 'u6', purchaseDate: '2024-04-20', warrantyExpiry: '2027-04-20', value: 1899, tags: ['laptop', 'lenovo'] },
  { id: 'AST-007', name: 'Dell UltraSharp U2722D', type: 'Monitor', status: 'active', serialNumber: 'DELL-U2722D-001', manufacturer: 'Dell', model: 'UltraSharp U2722D 27"', location: 'Building A - Floor 2', assignedTo: 'u5', purchaseDate: '2024-03-15', warrantyExpiry: '2027-03-15', value: 550, tags: ['monitor', 'dell'] },
  { id: 'AST-008', name: 'Fortinet FortiGate 100F', type: 'Firewall', status: 'active', serialNumber: 'FGT-100F-001', manufacturer: 'Fortinet', model: 'FortiGate 100F', location: 'Server Room A', assignedTo: null, purchaseDate: '2023-06-01', warrantyExpiry: '2026-06-01', value: 4500, tags: ['security', 'firewall', 'fortinet'] },
  { id: 'AST-009', name: 'APC Smart-UPS 3000VA', type: 'UPS', status: 'active', serialNumber: 'APC-3000-001', manufacturer: 'APC', model: 'Smart-UPS 3000VA', location: 'Server Room A', assignedTo: null, purchaseDate: '2023-03-10', warrantyExpiry: '2026-03-10', value: 1800, tags: ['ups', 'power', 'infrastructure'] },
  { id: 'AST-010', name: 'Poly Studio X50', type: 'Video Conferencing', status: 'active', serialNumber: 'POLY-X50-001', manufacturer: 'Poly', model: 'Studio X50', location: 'Conference Room A', assignedTo: null, purchaseDate: '2024-02-01', warrantyExpiry: '2027-02-01', value: 2500, tags: ['video', 'conferencing', 'poly'] },
  { id: 'AST-011', name: 'iPhone 15 Pro', type: 'Mobile', status: 'active', serialNumber: 'APPL-IP15P-001', manufacturer: 'Apple', model: 'iPhone 15 Pro', location: 'Building A', assignedTo: 'u1', purchaseDate: '2024-09-22', warrantyExpiry: '2025-09-22', value: 1199, tags: ['mobile', 'apple', 'executive'] },
  { id: 'AST-012', name: 'NetApp FAS2750', type: 'Storage', status: 'active', serialNumber: 'NTAP-2750-001', manufacturer: 'NetApp', model: 'FAS2750', location: 'Data Center', assignedTo: null, purchaseDate: '2023-08-15', warrantyExpiry: '2028-08-15', value: 35000, tags: ['storage', 'netapp', 'san'] },
  { id: 'AST-013', name: 'HP ProLiant DL380', type: 'Server', status: 'maintenance', serialNumber: 'HP-DL380-001', manufacturer: 'HP', model: 'ProLiant DL380 Gen10', location: 'Data Center', assignedTo: null, purchaseDate: '2022-05-10', warrantyExpiry: '2025-05-10', value: 8500, tags: ['server', 'hp', 'backup'] },
  { id: 'AST-014', name: 'Cisco Meraki MR46', type: 'Wireless AP', status: 'active', serialNumber: 'MERAKI-MR46-001', manufacturer: 'Cisco', model: 'Meraki MR46', location: 'Building A - Floor 2', assignedTo: null, purchaseDate: '2024-01-20', warrantyExpiry: '2027-01-20', value: 750, tags: ['wireless', 'cisco', 'meraki'] },
  { id: 'AST-015', name: 'Microsoft Surface Pro 9', type: 'Tablet', status: 'active', serialNumber: 'MS-SP9-001', manufacturer: 'Microsoft', model: 'Surface Pro 9', location: 'Building B - Floor 2', assignedTo: 'u7', purchaseDate: '2024-05-15', warrantyExpiry: '2026-05-15', value: 1599, tags: ['tablet', 'microsoft', 'surface'] },
  { id: 'AST-016', name: 'Brother MFC-L8900CDW', type: 'Printer', status: 'active', serialNumber: 'BRO-L8900-001', manufacturer: 'Brother', model: 'MFC-L8900CDW', location: 'Building B - Floor 1', assignedTo: null, purchaseDate: '2023-11-10', warrantyExpiry: '2026-11-10', value: 600, tags: ['printer', 'brother', 'color'] },
  { id: 'AST-017', name: 'Dell Precision 5570', type: 'Laptop', status: 'active', serialNumber: 'DELL-5570-001', manufacturer: 'Dell', model: 'Precision 5570', location: 'Building A - Floor 3', assignedTo: 'u3', purchaseDate: '2024-02-28', warrantyExpiry: '2027-02-28', value: 2800, tags: ['laptop', 'dell', 'workstation'] },
  { id: 'AST-018', name: 'Logitech Rally Plus', type: 'Video Conferencing', status: 'active', serialNumber: 'LOGI-RALLY-001', manufacturer: 'Logitech', model: 'Rally Plus', location: 'Conference Room B', assignedTo: null, purchaseDate: '2023-12-01', warrantyExpiry: '2025-12-01', value: 3000, tags: ['video', 'conferencing', 'logitech'] },
  { id: 'AST-019', name: 'Synology DS1821+', type: 'NAS', status: 'active', serialNumber: 'SYN-DS1821-001', manufacturer: 'Synology', model: 'DS1821+', location: 'Server Room B', assignedTo: null, purchaseDate: '2024-03-01', warrantyExpiry: '2027-03-01', value: 1500, tags: ['storage', 'nas', 'synology'] },
  { id: 'AST-020', name: 'Jabra Evolve2 85', type: 'Headset', status: 'active', serialNumber: 'JAB-E285-001', manufacturer: 'Jabra', model: 'Evolve2 85', location: 'Building A - Floor 2', assignedTo: 'u2', purchaseDate: '2024-06-15', warrantyExpiry: '2026-06-15', value: 380, tags: ['headset', 'jabra', 'audio'] },
  { id: 'AST-021', name: 'Aruba 6300M Switch', type: 'Network Switch', status: 'active', serialNumber: 'ARU-6300M-001', manufacturer: 'Aruba', model: '6300M 48G', location: 'Server Room B', assignedTo: null, purchaseDate: '2024-04-10', warrantyExpiry: '2029-04-10', value: 4800, tags: ['network', 'aruba', 'switch'] },
  { id: 'AST-022', name: 'Dell OptiPlex 7090', type: 'Desktop', status: 'inactive', serialNumber: 'DELL7090-002', manufacturer: 'Dell', model: 'OptiPlex 7090', location: 'Storage', assignedTo: null, purchaseDate: '2024-03-15', warrantyExpiry: '2027-03-15', value: 1200, tags: ['desktop', 'dell', 'spare'] },
  { id: 'AST-023', name: 'Palo Alto PA-440', type: 'Firewall', status: 'active', serialNumber: 'PA-440-001', manufacturer: 'Palo Alto', model: 'PA-440', location: 'Data Center', assignedTo: null, purchaseDate: '2024-01-05', warrantyExpiry: '2027-01-05', value: 3200, tags: ['security', 'firewall', 'paloalto'] },
  { id: 'AST-024', name: 'Samsung Galaxy Tab S9', type: 'Tablet', status: 'active', serialNumber: 'SAM-S9-001', manufacturer: 'Samsung', model: 'Galaxy Tab S9', location: 'Building A', assignedTo: 'u9', purchaseDate: '2024-08-01', warrantyExpiry: '2026-08-01', value: 850, tags: ['tablet', 'samsung', 'android'] },
  { id: 'AST-025', name: 'LG 34WN80C-B Monitor', type: 'Monitor', status: 'active', serialNumber: 'LG-34WN-001', manufacturer: 'LG', model: '34WN80C-B', location: 'Building A - Floor 3', assignedTo: 'u4', purchaseDate: '2024-05-20', warrantyExpiry: '2027-05-20', value: 700, tags: ['monitor', 'lg', 'ultrawide'] },
  { id: 'AST-026', name: 'Cisco IP Phone 8845', type: 'Phone', status: 'active', serialNumber: 'CISCO-8845-001', manufacturer: 'Cisco', model: 'IP Phone 8845', location: 'Building A - Floor 2', assignedTo: 'u5', purchaseDate: '2023-10-15', warrantyExpiry: '2026-10-15', value: 350, tags: ['phone', 'cisco', 'voip'] },
  { id: 'AST-027', name: 'VMware vSphere License', type: 'Software License', status: 'active', serialNumber: 'VMW-VSPH-001', manufacturer: 'VMware', model: 'vSphere Enterprise Plus', location: 'Virtual', assignedTo: null, purchaseDate: '2024-01-01', warrantyExpiry: '2025-01-01', value: 8500, tags: ['software', 'vmware', 'virtualization'] },
  { id: 'AST-028', name: 'Veeam Backup License', type: 'Software License', status: 'active', serialNumber: 'VEEAM-BKP-001', manufacturer: 'Veeam', model: 'Backup & Replication', location: 'Virtual', assignedTo: null, purchaseDate: '2024-02-15', warrantyExpiry: '2025-02-15', value: 3500, tags: ['software', 'veeam', 'backup'] },
  { id: 'AST-029', name: 'HP Z27k G3 Monitor', type: 'Monitor', status: 'retired', serialNumber: 'HP-Z27K-001', manufacturer: 'HP', model: 'Z27k G3', location: 'Storage', assignedTo: null, purchaseDate: '2021-06-01', warrantyExpiry: '2024-06-01', value: 600, tags: ['monitor', 'hp', 'retired'] },
  { id: 'AST-030', name: 'Lenovo ThinkCentre M920', type: 'Desktop', status: 'retired', serialNumber: 'LNV-M920-001', manufacturer: 'Lenovo', model: 'ThinkCentre M920', location: 'Storage', assignedTo: null, purchaseDate: '2020-03-10', warrantyExpiry: '2023-03-10', value: 900, tags: ['desktop', 'lenovo', 'retired'] },
];

// Knowledge Articles (15+)
export const knowledgeArticles: KnowledgeArticle[] = [
  {
    id: 'KB-001',
    title: 'How to Reset Your Password',
    content: `# Password Reset Guide

## Self-Service Password Reset

1. Go to https://password.company.com
2. Click "Forgot Password"
3. Enter your email address
4. Check your email for the reset link
5. Create a new password following the requirements:
   - Minimum 12 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character

## If Self-Service Doesn't Work

Contact the Service Desk at ext. 5555 or submit a ticket through the portal.

**Note:** Password resets may take up to 15 minutes to sync across all systems.`,
    category: 'Account Management',
    tags: ['password', 'reset', 'account', 'self-service'],
    views: 1523,
    helpful: 342,
    createdAt: '2025-06-15T10:00:00Z',
    updatedAt: '2026-01-15T14:30:00Z',
    authorId: 'u2',
  },
  {
    id: 'KB-002',
    title: 'VPN Setup and Troubleshooting',
    content: `# VPN Configuration Guide

## Initial Setup

1. Download the VPN client from the Software Center
2. Install with default settings
3. Launch the application
4. Enter the server address: vpn.company.com
5. Use your network credentials to connect

## Common Issues

### Connection Drops Frequently
- Check your internet connection stability
- Try connecting to a different VPN server
- Disable IPv6 on your network adapter

### Cannot Connect at All
- Verify your credentials are correct
- Check if your account is locked
- Ensure firewall isn't blocking the VPN

### Slow Performance
- Connect to the nearest geographic server
- Close bandwidth-heavy applications
- Check for network congestion`,
    category: 'Network',
    tags: ['vpn', 'remote', 'network', 'troubleshooting'],
    views: 2341,
    helpful: 567,
    createdAt: '2025-04-20T09:00:00Z',
    updatedAt: '2026-01-20T11:00:00Z',
    authorId: 'u3',
  },
  {
    id: 'KB-003',
    title: 'Email Configuration for Mobile Devices',
    content: `# Mobile Email Setup

## iOS Devices

1. Go to Settings > Mail > Accounts
2. Tap "Add Account"
3. Select "Microsoft Exchange"
4. Enter your email and password
5. Server: outlook.office365.com

## Android Devices

1. Open the Gmail app
2. Tap your profile picture
3. Select "Add another account"
4. Choose "Exchange"
5. Enter your credentials

## Troubleshooting

- Ensure your device has the latest OS updates
- Check that your account has mobile access enabled
- Contact IT if you receive certificate errors`,
    category: 'Email',
    tags: ['email', 'mobile', 'outlook', 'configuration'],
    views: 1876,
    helpful: 423,
    createdAt: '2025-05-10T14:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
    authorId: 'u2',
  },
  {
    id: 'KB-004',
    title: 'Printer Installation Guide',
    content: `# Adding Network Printers

## Windows

1. Open Settings > Devices > Printers & Scanners
2. Click "Add a printer or scanner"
3. Select "The printer I want isn't listed"
4. Choose "Select a shared printer by name"
5. Enter: \\\\printserver\\PrinterName

## Mac

1. Open System Preferences > Printers & Scanners
2. Click the + button
3. Select the IP tab
4. Enter the printer's IP address
5. Select the appropriate driver

## Available Printers

| Location | Printer Name | IP Address |
|----------|--------------|------------|
| Floor 2 | HP-F2-Color | 10.0.2.50 |
| Floor 3 | HP-F3-BW | 10.0.3.50 |
| Lobby | Canon-Lobby | 10.0.1.50 |`,
    category: 'Hardware',
    tags: ['printer', 'installation', 'hardware', 'setup'],
    views: 987,
    helpful: 234,
    createdAt: '2025-07-01T11:00:00Z',
    updatedAt: '2025-12-15T16:00:00Z',
    authorId: 'u2',
  },
  {
    id: 'KB-005',
    title: 'Microsoft Teams Best Practices',
    content: `# Getting the Most from Microsoft Teams

## Meeting Tips

- Always test your audio/video before important meetings
- Use the "Raise Hand" feature in large meetings
- Enable background blur for privacy
- Record meetings for absent team members

## Chat Etiquette

- Use @mentions sparingly
- Mark messages as important only when necessary
- Use threads to keep conversations organized
- Set your status to reflect availability

## File Sharing

- Store files in the Files tab, not chat
- Use co-authoring for real-time collaboration
- Set appropriate permissions for sensitive files`,
    category: 'Collaboration',
    tags: ['teams', 'meetings', 'collaboration', 'best-practices'],
    views: 3245,
    helpful: 789,
    createdAt: '2025-03-15T10:00:00Z',
    updatedAt: '2026-01-25T14:00:00Z',
    authorId: 'u4',
  },
  {
    id: 'KB-006',
    title: 'Security Awareness: Phishing Prevention',
    content: `# Identifying and Avoiding Phishing Attacks

## Warning Signs

- Urgent or threatening language
- Requests for personal information
- Suspicious sender addresses
- Generic greetings ("Dear Customer")
- Misspelled URLs or company names

## What to Do

1. **Don't click** any links or attachments
2. **Report** the email using the "Report Phishing" button
3. **Delete** the email from your inbox
4. **Contact IT** if you accidentally clicked something

## Real vs Fake

| Legitimate | Suspicious |
|------------|------------|
| company.com | c0mpany.com |
| support@company.com | support@company-help.com |
| Personalized greeting | "Dear User" |`,
    category: 'Security',
    tags: ['security', 'phishing', 'awareness', 'email'],
    views: 4521,
    helpful: 1023,
    createdAt: '2025-01-10T09:00:00Z',
    updatedAt: '2026-01-28T10:00:00Z',
    authorId: 'u8',
  },
  {
    id: 'KB-007',
    title: 'Software Installation via Software Center',
    content: `# Installing Approved Software

## Accessing Software Center

1. Click Start menu
2. Search for "Software Center"
3. Launch the application

## Installing Software

1. Browse or search for the application
2. Click "Install"
3. Wait for the installation to complete
4. Restart if prompted

## Available Software

- Microsoft Office Suite
- Adobe Acrobat Reader
- Google Chrome
- Zoom Client
- Slack
- Visual Studio Code
- And many more...

## Requesting New Software

If the software you need isn't available, submit a service request through the IT portal.`,
    category: 'Software',
    tags: ['software', 'installation', 'software-center', 'applications'],
    views: 2156,
    helpful: 456,
    createdAt: '2025-08-20T13:00:00Z',
    updatedAt: '2026-01-05T11:00:00Z',
    authorId: 'u4',
  },
  {
    id: 'KB-008',
    title: 'Backup and Recovery Procedures',
    content: `# Data Backup Guide

## Automatic Backups

Your work files are automatically backed up if stored in:
- OneDrive for Business
- SharePoint document libraries
- Network drives (H: and S: drives)

## Recovering Files

### OneDrive
1. Go to onedrive.com
2. Click the gear icon > Restore your OneDrive
3. Select a date to restore from

### Network Drives
Contact IT with:
- File path
- Approximate date of deletion
- File name (if known)

## Best Practices

- Save important files to OneDrive
- Don't store critical data only on local drives
- Regularly verify your backups are working`,
    category: 'Data Management',
    tags: ['backup', 'recovery', 'data', 'onedrive'],
    views: 1432,
    helpful: 312,
    createdAt: '2025-09-05T10:00:00Z',
    updatedAt: '2025-12-20T15:00:00Z',
    authorId: 'u3',
  },
  {
    id: 'KB-009',
    title: 'Remote Desktop Connection Guide',
    content: `# Connecting to Remote Desktops

## Prerequisites

- VPN connection (if outside office)
- Remote Desktop enabled on target machine
- Appropriate permissions

## Windows

1. Press Win + R
2. Type "mstsc" and press Enter
3. Enter the computer name or IP
4. Click Connect
5. Enter your credentials

## Mac

1. Download Microsoft Remote Desktop from App Store
2. Click "Add PC"
3. Enter the PC name
4. Save and double-click to connect

## Troubleshooting

- Verify the target PC is powered on
- Check firewall settings
- Ensure you have RDP permissions`,
    category: 'Remote Access',
    tags: ['rdp', 'remote', 'desktop', 'connection'],
    views: 1789,
    helpful: 398,
    createdAt: '2025-06-25T14:00:00Z',
    updatedAt: '2026-01-18T09:00:00Z',
    authorId: 'u3',
  },
  {
    id: 'KB-010',
    title: 'Multi-Factor Authentication Setup',
    content: `# Setting Up MFA

## Microsoft Authenticator (Recommended)

1. Download Microsoft Authenticator app
2. Go to aka.ms/mfasetup
3. Sign in with your work account
4. Click "Add method" > "Authenticator app"
5. Scan the QR code with the app
6. Enter the verification code

## Alternative Methods

- SMS text messages
- Phone call verification
- Hardware security key

## Troubleshooting

### Lost Phone
1. Use backup codes (if saved)
2. Contact IT for account recovery
3. Set up MFA on new device

### App Not Working
- Ensure phone time is synced
- Try removing and re-adding account
- Update the Authenticator app`,
    category: 'Security',
    tags: ['mfa', 'security', 'authentication', '2fa'],
    views: 2876,
    helpful: 654,
    createdAt: '2025-02-14T11:00:00Z',
    updatedAt: '2026-01-22T16:00:00Z',
    authorId: 'u8',
  },
  {
    id: 'KB-011',
    title: 'SharePoint Site Management',
    content: `# Managing SharePoint Sites

## Creating a New Site

1. Go to sharepoint.company.com
2. Click "Create site"
3. Choose Team site or Communication site
4. Enter site name and description
5. Set privacy settings
6. Add owners and members

## Managing Permissions

- Site owners can manage all settings
- Members can edit content
- Visitors can only view

## Best Practices

- Use consistent naming conventions
- Set up proper folder structure
- Enable versioning for documents
- Regularly review permissions`,
    category: 'Collaboration',
    tags: ['sharepoint', 'collaboration', 'sites', 'permissions'],
    views: 1234,
    helpful: 287,
    createdAt: '2025-10-10T10:00:00Z',
    updatedAt: '2026-01-12T14:00:00Z',
    authorId: 'u4',
  },
  {
    id: 'KB-012',
    title: 'Laptop Docking Station Setup',
    content: `# Docking Station Configuration

## Supported Docks

- Dell WD19TB Thunderbolt
- Lenovo ThinkPad USB-C Dock
- HP USB-C Dock G5

## Setup Steps

1. Connect power to the dock
2. Connect dock to laptop via USB-C/Thunderbolt
3. Connect monitors to dock
4. Connect keyboard, mouse, and other peripherals

## Display Configuration

### Windows
1. Right-click desktop > Display settings
2. Arrange monitors as desired
3. Set resolution and scaling

### Mac
1. System Preferences > Displays
2. Click "Arrangement" tab
3. Drag displays to match physical layout

## Troubleshooting

- Update dock firmware
- Check cable connections
- Try different USB-C port`,
    category: 'Hardware',
    tags: ['docking', 'laptop', 'hardware', 'setup'],
    views: 876,
    helpful: 198,
    createdAt: '2025-11-05T09:00:00Z',
    updatedAt: '2025-12-28T11:00:00Z',
    authorId: 'u2',
  },
  {
    id: 'KB-013',
    title: 'Incident Escalation Procedures',
    content: `# When and How to Escalate

## Escalation Criteria

### Priority 1 (Critical)
- Complete service outage
- Security breach
- Data loss affecting multiple users

### Priority 2 (High)
- Major functionality impaired
- Significant user impact
- SLA at risk

## Escalation Path

1. **Level 1**: Service Desk (initial contact)
2. **Level 2**: Technical specialists
3. **Level 3**: Senior engineers/vendors
4. **Management**: For critical issues

## Contact Information

| Level | Contact | Response Time |
|-------|---------|---------------|
| L1 | servicedesk@company.com | 15 min |
| L2 | techsupport@company.com | 30 min |
| L3 | engineering@company.com | 1 hour |
| Management | it-management@company.com | As needed |`,
    category: 'Processes',
    tags: ['escalation', 'incident', 'procedures', 'support'],
    views: 654,
    helpful: 145,
    createdAt: '2025-04-01T10:00:00Z',
    updatedAt: '2025-11-15T14:00:00Z',
    authorId: 'u1',
  },
  {
    id: 'KB-014',
    title: 'Change Management Process',
    content: `# IT Change Management

## Change Types

### Standard Changes
- Pre-approved, low-risk changes
- No CAB approval needed
- Examples: password resets, software updates

### Normal Changes
- Require CAB review
- Scheduled implementation window
- Examples: server upgrades, network changes

### Emergency Changes
- Immediate implementation needed
- Retrospective CAB review
- Examples: security patches, critical fixes

## Submission Process

1. Create change request in ITSM portal
2. Complete all required fields
3. Attach implementation and rollback plans
4. Submit for approval
5. Await CAB decision

## CAB Meeting Schedule

- Weekly: Tuesdays at 2:00 PM
- Emergency: As needed`,
    category: 'Processes',
    tags: ['change', 'management', 'cab', 'procedures'],
    views: 543,
    helpful: 123,
    createdAt: '2025-05-20T11:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
    authorId: 'u1',
  },
  {
    id: 'KB-015',
    title: 'Network Drive Mapping',
    content: `# Mapping Network Drives

## Windows

### Using File Explorer
1. Open File Explorer
2. Click "This PC"
3. Click "Map network drive"
4. Select drive letter
5. Enter path (e.g., \\\\server\\share)
6. Check "Reconnect at sign-in"

### Using Command Line
\`\`\`
net use Z: \\\\server\\share /persistent:yes
\`\`\`

## Mac

1. Open Finder
2. Press Cmd + K
3. Enter: smb://server/share
4. Click Connect
5. Enter credentials

## Common Shares

| Drive | Path | Purpose |
|-------|------|---------|
| H: | \\\\fileserver\\home$ | Personal files |
| S: | \\\\fileserver\\shared | Department files |
| P: | \\\\fileserver\\projects | Project files |`,
    category: 'Network',
    tags: ['network', 'drives', 'mapping', 'storage'],
    views: 1567,
    helpful: 356,
    createdAt: '2025-07-15T14:00:00Z',
    updatedAt: '2025-12-10T09:00:00Z',
    authorId: 'u3',
  },
];

// Change Requests
export const changeRequests: ChangeRequest[] = [
  {
    id: 'CHG-001',
    title: 'Exchange Server 2019 to Exchange Online Migration',
    description: 'Migrate on-premises Exchange Server 2019 to Microsoft 365 Exchange Online for improved reliability and features.',
    status: 'approved',
    priority: 'high',
    type: 'normal',
    impact: 'high',
    risk: 'medium',
    requesterId: 'u1',
    assigneeId: 'u3',
    approvers: [
      { userId: 'u1', status: 'approved', date: '2026-01-25T10:00:00Z' },
      { userId: 'u9', status: 'approved', date: '2026-01-26T14:00:00Z' },
    ],
    scheduledStart: '2026-02-15T22:00:00Z',
    scheduledEnd: '2026-02-16T06:00:00Z',
    createdAt: '2026-01-20T09:00:00Z',
    affectedServices: ['Email', 'Calendar', 'Contacts'],
    rollbackPlan: 'Restore from backup and repoint MX records to on-premises server.',
  },
  {
    id: 'CHG-002',
    title: 'Network Switch Firmware Update - Building A',
    description: 'Update Cisco Catalyst switches to latest firmware version to address security vulnerabilities.',
    status: 'scheduled',
    priority: 'medium',
    type: 'standard',
    impact: 'medium',
    risk: 'low',
    requesterId: 'u3',
    assigneeId: 'u3',
    approvers: [
      { userId: 'u1', status: 'approved', date: '2026-01-28T11:00:00Z' },
    ],
    scheduledStart: '2026-02-01T02:00:00Z',
    scheduledEnd: '2026-02-01T04:00:00Z',
    createdAt: '2026-01-27T10:00:00Z',
    affectedServices: ['Network - Building A'],
    rollbackPlan: 'Restore previous firmware version from backup.',
  },
  {
    id: 'CHG-003',
    title: 'Windows Server 2022 Security Patches',
    description: 'Apply January 2026 cumulative security updates to all Windows Server 2022 instances.',
    status: 'implementing',
    priority: 'high',
    type: 'standard',
    impact: 'low',
    risk: 'low',
    requesterId: 'u8',
    assigneeId: 'u3',
    approvers: [
      { userId: 'u1', status: 'approved', date: '2026-01-29T09:00:00Z' },
    ],
    scheduledStart: '2026-01-30T01:00:00Z',
    scheduledEnd: '2026-01-30T05:00:00Z',
    createdAt: '2026-01-28T14:00:00Z',
    affectedServices: ['All Windows-based services'],
    rollbackPlan: 'Uninstall patches using WSUS or restore from snapshot.',
  },
  {
    id: 'CHG-004',
    title: 'New Firewall Rule for Partner VPN',
    description: 'Add firewall rules to allow VPN connectivity for new business partner.',
    status: 'submitted',
    priority: 'medium',
    type: 'normal',
    impact: 'low',
    risk: 'medium',
    requesterId: 'u8',
    assigneeId: 'u8',
    approvers: [
      { userId: 'u1', status: 'pending' },
      { userId: 'u9', status: 'pending' },
    ],
    scheduledStart: '2026-02-05T10:00:00Z',
    scheduledEnd: '2026-02-05T11:00:00Z',
    createdAt: '2026-01-29T15:00:00Z',
    affectedServices: ['Firewall', 'VPN'],
    rollbackPlan: 'Remove newly added firewall rules.',
  },
  {
    id: 'CHG-005',
    title: 'Database Server Memory Upgrade',
    description: 'Increase RAM from 64GB to 128GB on production SQL Server to improve performance.',
    status: 'draft',
    priority: 'medium',
    type: 'normal',
    impact: 'high',
    risk: 'medium',
    requesterId: 'u4',
    assigneeId: null,
    approvers: [],
    scheduledStart: '2026-02-20T22:00:00Z',
    scheduledEnd: '2026-02-21T02:00:00Z',
    createdAt: '2026-01-30T08:00:00Z',
    affectedServices: ['Database', 'ERP', 'CRM'],
    rollbackPlan: 'Restore original memory configuration if issues occur.',
  },
  {
    id: 'CHG-006',
    title: 'SSL Certificate Renewal - Public Websites',
    description: 'Renew and install SSL certificates for all public-facing websites before expiration.',
    status: 'completed',
    priority: 'high',
    type: 'standard',
    impact: 'high',
    risk: 'low',
    requesterId: 'u8',
    assigneeId: 'u8',
    approvers: [
      { userId: 'u1', status: 'approved', date: '2026-01-20T10:00:00Z' },
    ],
    scheduledStart: '2026-01-25T09:00:00Z',
    scheduledEnd: '2026-01-25T12:00:00Z',
    createdAt: '2026-01-18T11:00:00Z',
    affectedServices: ['Public Website', 'Customer Portal', 'Partner Portal'],
    rollbackPlan: 'Restore previous certificates from backup.',
  },
];

// Dashboard metrics
export const dashboardMetrics = {
  openTickets: 47,
  resolvedToday: 12,
  avgResolutionTime: 4.2,
  slaCompliance: 94.5,
  criticalIncidents: 3,
  pendingChanges: 4,
  activeProblems: 5,
  totalAssets: 30,
};

// Categories for filtering
export const categories = [
  'Email',
  'Network',
  'Hardware',
  'Software',
  'Access',
  'Application',
  'Security',
  'Database',
  'Infrastructure',
  'Telephony',
  'Mobile',
  'Storage',
  'Training',
  'Data',
];

export const ticketTypes: { value: TicketType; label: string; color: string }[] = [
  { value: 'incident', label: 'Incident', color: '#e74c3c' },
  { value: 'service_request', label: 'Service Request', color: '#3498db' },
  { value: 'problem', label: 'Problem', color: '#9b59b6' },
  { value: 'change', label: 'Change', color: '#f39c12' },
];

export const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'critical', label: 'Critical', color: '#e74c3c' },
  { value: 'high', label: 'High', color: '#f39c12' },
  { value: 'medium', label: 'Medium', color: '#3498db' },
  { value: 'low', label: 'Low', color: '#27ae60' },
];

export const statuses: { value: TicketStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: '#9b59b6' },
  { value: 'open', label: 'Open', color: '#3498db' },
  { value: 'in_progress', label: 'In Progress', color: '#f39c12' },
  { value: 'pending', label: 'Pending', color: '#95a5a6' },
  { value: 'resolved', label: 'Resolved', color: '#27ae60' },
  { value: 'closed', label: 'Closed', color: '#7f8c8d' },
];
