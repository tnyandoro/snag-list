
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { toast } from '@/components/ui/use-toast';


const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_TIMEOUT = 30000; // 30 seconds

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookie-based auth if needed
});

// ============================================================================
// REQUEST INTERCEPTOR - Attach JWT Token
// ============================================================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ============================================================================
// RESPONSE INTERCEPTOR - Handle Global Errors
// ============================================================================

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle 401 - Unauthorized (Token expired/invalid)
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      toast({
        title: 'Session Expired',
        description: 'Please sign in again',
        variant: 'destructive',
      });
      window.location.href = '/login';
    }

    // Handle 403 - Forbidden (Insufficient permissions)
    if (error.response?.status === 403) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to perform this action',
        variant: 'destructive',
      });
    }

    // Handle 404 - Not Found
    if (error.response?.status === 404) {
      toast({
        title: 'Not Found',
        description: 'The requested resource could not be found',
        variant: 'destructive',
      });
    }

    // Handle 500 - Server Error
    if (error.response?.status === 500) {
      toast({
        title: 'Server Error',
        description: 'Something went wrong. Please try again later',
        variant: 'destructive',
      });
    }

    // Handle Network Errors
    if (!error.response) {
      toast({
        title: 'Network Error',
        description: 'Please check your internet connection',
        variant: 'destructive',
      });
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// TYPES & INTERFACES (Aligned with Architecture Task 2 - PostgreSQL Schema)
// ============================================================================

// --- User Domain (PRD §2, §19) ---
export type UserRole = 'admin' | 'owner' | 'tenant' | 'inspector' | 'vendor';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
}

// --- Property Domain (PRD §3-5) ---
export type PropertyCategory = 'apartment' | 'townhouse' | 'lodge' | 'house';

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  address: string;
  gps_lat?: number;
  gps_lng?: number;
  property_category: PropertyCategory;
  images?: PropertyImage[];
  buildings?: Building[];
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  url: string;
  caption?: string;
  is_primary: boolean;
}

export interface Building {
  id: string;
  property_id: string;
  name: string;
  description?: string;
  floors?: Floor[];
}

export interface Floor {
  id: string;
  building_id: string;
  floor_number: number;
  rooms?: Room[];
}

export interface Room {
  id: string;
  floor_id: string;
  name: string;
  room_type: string;
  items?: RoomItem[];
}

export interface RoomItem {
  id: string;
  room_id: string;
  name: string;
  category: 'structural' | 'electrical' | 'plumbing' | 'appliance' | 'exterior';
  condition?: ItemCondition;
}

export interface PropertyStructure {
  property: Property;
  buildings: Building[];
}

// --- Inspection Domain (PRD §6-7, Architecture Task 3) ---
export type InspectionType = 'move_in' | 'move_out' | 'routine' | 'maintenance';
export type InspectionStatus = 'draft' | 'in_progress' | 'completed' | 'signed';
export type ItemStatus = 'good' | 'needs_repair' | 'broken' | 'missing' | 'replaced';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Inspection {
  id: string;
  property_id: string;
  inspector_id: string;
  inspection_type: InspectionType;
  status: InspectionStatus;
  started_at: string;
  completed_at?: string;
  signed_at?: string;
  items: InspectionItem[];
  notes?: InspectionNote[];
  signatures?: InspectionSignature[];
}

export interface InspectionItem {
  id: string;
  inspection_id: string;
  room_item_id: string;
  room_name?: string;
  item_name?: string;
  status: ItemStatus;
  comment?: string;
  severity?: SeverityLevel;
  repair_recommendation?: string;
  photos: InspectionPhoto[];
  gps_lat?: number;
  gps_lng?: number;
  created_at: string;
}

export interface InspectionPhoto {
  id: string;
  url: string;
  caption?: string;
  timestamp: string;
  gps_lat?: number;
  gps_lng?: number;
}

export interface InspectionNote {
  id: string;
  inspection_id: string;
  content: string;
  voice_note_url?: string;
  created_at: string;
}

export interface InspectionSignature {
  id: string;
  inspection_id: string;
  signer_id: string;
  signer_name: string;
  signer_role: string;
  signature_data: string; // Base64 signature
  signed_at: string;
}

export interface CreateInspectionRequest {
  property_id: string;
  inspection_type: InspectionType;
  inspector_id: string;
}

export interface UpdateInspectionItemRequest {
  status: ItemStatus;
  comment?: string;
  severity?: SeverityLevel;
  repair_recommendation?: string;
  photo_ids?: string[];
  gps_lat?: number;
  gps_lng?: number;
}

// --- Issue Domain (PRD §8) ---
export type IssueStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'awaiting_approval'
  | 'completed'
  | 'closed';

export interface Issue {
  id: string;
  inspection_item_id?: string;
  property_id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  status: IssueStatus;
  assigned_vendor_id?: string;
  assigned_vendor_name?: string;
  created_at: string;
  updated_at: string;
  photos?: IssuePhoto[];
  comments?: IssueComment[];
  status_history?: IssueStatusHistory[];
}

export interface IssuePhoto {
  id: string;
  url: string;
  caption?: string;
  uploaded_at: string;
}

export interface IssueComment {
  id: string;
  issue_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface IssueStatusHistory {
  id: string;
  issue_id: string;
  old_status: IssueStatus;
  new_status: IssueStatus;
  changed_by: string;
  changed_at: string;
}

export interface CreateIssueRequest {
  inspection_item_id?: string;
  property_id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
}

export interface AssignIssueRequest {
  vendor_id: string;
  estimated_cost?: number;
  scheduled_date?: string;
}

// --- Vendor Domain (PRD §9-10) ---
export type ServiceCategory =
  | 'plumbing'
  | 'electrical'
  | 'carpentry'
  | 'appliance_repair'
  | 'painting'
  | 'roofing'
  | 'garden_maintenance'
  | 'pest_control'
  | 'cleaning';

export interface Vendor {
  id: string;
  user_id: string;
  company_name: string;
  contact_email: string;
  contact_phone: string;
  services: VendorService[];
  service_areas: string[];
  rating?: number;
  total_jobs?: number;
  is_verified: boolean;
  created_at: string;
}

export interface VendorService {
  id: string;
  vendor_id: string;
  service_category: ServiceCategory;
  description: string;
  hourly_rate?: number;
  is_active: boolean;
}

export interface VendorProfile {
  id: string;
  vendor_id: string;
  certifications?: string[];
  insurance_details?: string;
  business_license?: string;
  portfolio_images?: string[];
}

export interface RegisterVendorRequest {
  company_name: string;
  contact_email: string;
  contact_phone: string;
  services: {
    service_category: ServiceCategory;
    description: string;
    hourly_rate?: number;
  }[];
  service_areas: string[];
}

// --- Job Domain (PRD §11-13) ---
export type JobStatus =
  | 'pending'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface Job {
  id: string;
  issue_id: string;
  property_id: string;
  vendor_id: string;
  vendor_name?: string;
  service_type: ServiceCategory;
  status: JobStatus;
  scheduled_date?: string;
  completed_date?: string;
  estimated_cost?: number;
  final_cost?: number;
  description: string;
  photos?: JobPhoto[];
  comments?: JobComment[];
  invoice?: Invoice;
  created_at: string;
  updated_at: string;
}

export interface JobPhoto {
  id: string;
  url: string;
  caption?: string;
  uploaded_at: string;
}

export interface JobComment {
  id: string;
  job_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface CreateJobRequest {
  issue_id: string;
  vendor_id: string;
  service_type: ServiceCategory;
  description: string;
  estimated_cost?: number;
  scheduled_date?: string;
}

export interface CompleteJobRequest {
  photos?: string[]; // Photo URLs
  work_summary: string;
  final_cost: number;
  invoice_data?: InvoiceRequest;
}

// --- Invoice & Payment Domain (PRD §14) ---
export interface Invoice {
  id: string;
  job_id: string;
  vendor_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  items: InvoiceItem[];
  created_at: string;
  paid_at?: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface InvoiceRequest {
  items: {
    description: string;
    quantity: number;
    unit_price: number;
  }[];
}

export type PaymentMethod = 'stripe' | 'paystack' | 'paypal' | 'bank_transfer';

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  paid_at?: string;
}

export interface ProcessPaymentRequest {
  invoice_id: string;
  method: PaymentMethod;
  payment_details: any; // Card token, etc.
}

// --- Report Domain (PRD §16-17) ---
export type ReportType =
  | 'inspection'
  | 'maintenance_history'
  | 'vendor_performance'
  | 'financial_summary';

export interface Report {
  id: string;
  type: ReportType;
  title: string;
  generated_at: string;
  file_url: string;
  file_format: 'pdf' | 'excel';
  metadata: Record<string, any>;
}

export interface GenerateReportRequest {
  type: ReportType;
  filters?: {
    property_id?: string;
    date_from?: string;
    date_to?: string;
    vendor_id?: string;
  };
}

// --- Notification Domain (Architecture Task 1) ---
export type NotificationType =
  | 'inspection_assigned'
  | 'issue_created'
  | 'job_assigned'
  | 'job_completed'
  | 'payment_approved'
  | 'payment_received';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

// ============================================================================
// API SERVICE MODULES (Aligned with Architecture Task 1 - Microservices)
// ============================================================================

// --- 1. AUTH SERVICE (User Service) ---
export const authService = {
  login: (credentials: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', credentials),

  register: (userData: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', userData),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<User>('/auth/me'),

  refreshToken: () => api.post<AuthResponse>('/auth/refresh'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

// --- 2. PROPERTY SERVICE (Property Service) ---
export const propertyService = {
  // Property CRUD
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ properties: Property[]; total: number }>('/properties', { params }),

  getById: (id: string) => api.get<Property>(`/properties/${id}`),

  create: (data: Partial<Property>) =>
    api.post<Property>('/properties', data),

  update: (id: string, data: Partial<Property>) =>
    api.patch<Property>(`/properties/${id}`, data),

  delete: (id: string) => api.delete(`/properties/${id}`),

  // Property Structure (Building → Floor → Room → Item)
  getStructure: (propertyId: string) =>
    api.get<PropertyStructure>(`/properties/${propertyId}/structure`),

  updateStructure: (propertyId: string, structure: PropertyStructure) =>
    api.put(`/properties/${propertyId}/structure`, structure),

  // Property Images
  uploadImage: (propertyId: string, formData: FormData) =>
    api.post<{ image: PropertyImage }>(`/properties/${propertyId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteImage: (propertyId: string, imageId: string) =>
    api.delete(`/properties/${propertyId}/images/${imageId}`),
};

// --- 3. INSPECTION SERVICE (Inspection Service) ---
export const inspectionService = {
  // Inspection CRUD
  getAll: (params?: { property_id?: string; status?: InspectionStatus }) =>
    api.get<{ inspections: Inspection[]; total: number }>('/inspections', { params }),

  getById: (id: string) => api.get<Inspection>(`/inspections/${id}`),

  create: (data: CreateInspectionRequest) =>
    api.post<Inspection>('/inspections', data),

  update: (id: string, data: Partial<Inspection>) =>
    api.patch<Inspection>(`/inspections/${id}`, data),

  delete: (id: string) => api.delete(`/inspections/${id}`),

  // Inspection Items
  updateItem: (inspectionId: string, itemId: string, data: UpdateInspectionItemRequest) =>
    api.patch<InspectionItem>(`/inspections/${inspectionId}/items/${itemId}`, data),

  // Inspection Photos (Mobile - supports offline sync)
  uploadPhoto: (inspectionId: string, formData: FormData) =>
    api.post<{ photo: InspectionPhoto }>(`/inspections/${inspectionId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Inspection Notes (Voice-to-text support)
  addNote: (inspectionId: string, content: string, voiceNoteUrl?: string) =>
    api.post<InspectionNote>(`/inspections/${inspectionId}/notes`, {
      content,
      voice_note_url: voiceNoteUrl,
    }),

  // Inspection Signatures (Digital signature)
  addSignature: (inspectionId: string, signatureData: InspectionSignature) =>
    api.post<InspectionSignature>(`/inspections/${inspectionId}/signatures`, signatureData),

  // Complete & Sign Inspection
  complete: (id: string) => api.patch<Inspection>(`/inspections/${id}/complete`),

  // Mobile: Offline Sync (Architecture Task 3)
  sync: (payload: { inspections: Inspection[] }) =>
    api.post('/inspections/sync', payload),
};

// --- 4. ISSUE SERVICE (Issue Management Service) ---
export const issueService = {
  // Issue CRUD
  getAll: (params?: {
    property_id?: string;
    status?: IssueStatus;
    severity?: SeverityLevel;
    assigned_vendor_id?: string;
    page?: number;
    limit?: number;
  }) => api.get<{ issues: Issue[]; total: number }>('/issues', { params }),

  getById: (id: string) => api.get<Issue>(`/issues/${id}`),

  create: (data: CreateIssueRequest) => api.post<Issue>('/issues', data),

  update: (id: string, data: Partial<Issue>) =>
    api.patch<Issue>(`/issues/${id}`, data),

  delete: (id: string) => api.delete(`/issues/${id}`),

  // Status Management
  updateStatus: (id: string, status: IssueStatus, comment?: string) =>
    api.patch<Issue>(`/issues/${id}/status`, { status, comment }),

  // Assignment
  assignToVendor: (issueId: string, data: AssignIssueRequest) =>
    api.post<Issue>(`/issues/${issueId}/assign`, data),

  // Comments
  addComment: (issueId: string, content: string) =>
    api.post<IssueComment>(`/issues/${issueId}/comments`, { content }),

  // Photos
  uploadPhoto: (issueId: string, formData: FormData) =>
    api.post<{ photo: IssuePhoto }>(`/issues/${issueId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// --- 5. VENDOR SERVICE (Vendor Marketplace Service) ---
export const vendorService = {
  // Vendor CRUD
  getAll: (params?: {
    service_category?: ServiceCategory;
    service_area?: string;
    is_verified?: boolean;
    page?: number;
    limit?: number;
  }) => api.get<{ vendors: Vendor[]; total: number }>('/vendors', { params }),

  getById: (id: string) => api.get<Vendor>(`/vendors/${id}`),

  register: (data: RegisterVendorRequest) =>
    api.post<Vendor>('/vendors/register', data),

  update: (id: string, data: Partial<Vendor>) =>
    api.patch<Vendor>(`/vendors/${id}`, data),

  // Vendor Profile
  getProfile: (vendorId: string) =>
    api.get<VendorProfile>(`/vendors/${vendorId}/profile`),

  updateProfile: (vendorId: string, data: Partial<VendorProfile>) =>
    api.patch(`/vendors/${vendorId}/profile`, data),

  // Vendor Ratings & Reviews
  getReviews: (vendorId: string) =>
    api.get(`/vendors/${vendorId}/reviews`),

  addReview: (vendorId: string, rating: number, comment: string) =>
    api.post(`/vendors/${vendorId}/reviews`, { rating, comment }),

  // Service Categories
  getServiceCategories: () =>
    api.get<{ categories: ServiceCategory[] }>('/vendors/service-categories'),
};

// --- 6. JOB SERVICE (Job Management Service) ---
export const jobService = {
  // Job CRUD
  getAll: (params?: {
    status?: JobStatus;
    vendor_id?: string;
    property_id?: string;
    page?: number;
    limit?: number;
  }) => api.get<{ jobs: Job[]; total: number }>('/jobs', { params }),

  getById: (id: string) => api.get<Job>(`/jobs/${id}`),

  create: (data: CreateJobRequest) => api.post<Job>('/jobs', data),

  update: (id: string, data: Partial<Job>) => api.patch<Job>(`/jobs/${id}`, data),

  // Job Status
  updateStatus: (id: string, status: JobStatus) =>
    api.patch<Job>(`/jobs/${id}/status`, { status }),

  // Job Completion (Vendor uploads photos, summary, invoice)
  complete: (id: string, data: CompleteJobRequest) =>
    api.post<Job>(`/jobs/${id}/complete`, data),

  // Job Approval (Owner approves/rejects)
  approve: (id: string) => api.post<Job>(`/jobs/${id}/approve`),

  reject: (id: string, reason: string) =>
    api.post<Job>(`/jobs/${id}/reject`, { reason }),

  // Job Photos
  uploadPhoto: (jobId: string, formData: FormData) =>
    api.post<{ photo: JobPhoto }>(`/jobs/${jobId}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Job Comments
  addComment: (jobId: string, content: string) =>
    api.post<JobComment>(`/jobs/${jobId}/comments`, { content }),
};

// --- 7. PAYMENT SERVICE (Payment Service) ---
export const paymentService = {
  // Invoice Management
  getInvoice: (id: string) => api.get<Invoice>(`/invoices/${id}`),

  approveInvoice: (id: string) => api.post<Invoice>(`/invoices/${id}/approve`),

  rejectInvoice: (id: string, reason: string) =>
    api.post<Invoice>(`/invoices/${id}/reject`, { reason }),

  // Payment Processing
  processPayment: (data: ProcessPaymentRequest) =>
    api.post<Payment>('/payments/process', data),

  getPayment: (id: string) => api.get<Payment>(`/payments/${id}`),

  // Payment Methods
  getPaymentMethods: () =>
    api.get<{ methods: PaymentMethod[] }>('/payments/methods'),

  // Vendor Payouts
  requestPayout: (vendorId: string, amount: number) =>
    api.post(`/vendors/${vendorId}/payouts`, { amount }),
};

// --- 8. REPORT SERVICE (Reporting & Analytics Service) ---
export const reportService = {
  // Generate Reports
  generate: (data: GenerateReportRequest) =>
    api.post<Report>('/reports/generate', data),

  // Get Reports
  getAll: (params?: { type?: ReportType; page?: number; limit?: number }) =>
    api.get<{ reports: Report[]; total: number }>('/reports', { params }),

  getById: (id: string) => api.get<Report>(`/reports/${id}`),

  // Download Report
  download: (id: string) =>
    api.get(`/reports/${id}/download`, {
      responseType: 'blob',
    }),

  // Export Data
  export: (type: ReportType, format: 'pdf' | 'excel', filters?: any) =>
    api.get(`/reports/export`, {
      params: { type, format, ...filters },
      responseType: 'blob',
    }),
};

// --- 9. NOTIFICATION SERVICE (Notification Service) ---
export const notificationService = {
  // Get Notifications
  getAll: (params?: { is_read?: boolean; page?: number; limit?: number }) =>
    api.get<{ notifications: Notification[]; total: number }>('/notifications', {
    params,
  }),

  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),

  // Mark as Read
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),

  markAllAsRead: () => api.patch('/notifications/read-all'),

  // Notification Preferences
  getPreferences: () => api.get('/notifications/preferences'),

  updatePreferences: (data: { email?: boolean; sms?: boolean; push?: boolean }) =>
    api.patch('/notifications/preferences', data),
};

// --- 10. FILE UPLOAD SERVICE (Infrastructure Layer - S3/R2) ---
export const fileService = {
  // Generic file upload (returns URL)
  upload: (formData: FormData, folder?: string) =>
    api.post<{ url: string; file_id: string }>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: folder ? { folder } : undefined,
    }),

  // Delete file
  delete: (fileId: string) => api.delete(`/files/${fileId}`),

  // Get signed URL for download
  getSignedUrl: (fileId: string) =>
    api.get<{ url: string }>(`/files/${fileId}/signed-url`),
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default api;