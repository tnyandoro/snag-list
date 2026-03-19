// src/hooks/useJobs.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  jobService,
  Job,
  JobPhoto,
  JobComment,
  CreateJobRequest,
  CompleteJobRequest,
} from '@/services/api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const jobQueryKeys = {
  all: ['jobs'] as const,
  lists: () => [...jobQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) =>
    [...jobQueryKeys.lists(), filters] as const,
  details: () => [...jobQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...jobQueryKeys.details(), id] as const,
  byIssue: (issueId: string) =>
    [...jobQueryKeys.all, 'issue', issueId] as const,
  byVendor: (vendorId: string) =>
    [...jobQueryKeys.all, 'vendor', vendorId] as const,
  byProperty: (propertyId: string) =>
    [...jobQueryKeys.all, 'property', propertyId] as const,
  myJobs: () => [...jobQueryKeys.all, 'my-jobs'] as const, // For vendors
};

// ============================================================================
// JOB LIST HOOK
// PRD §11 - Job Assignment Module
// ============================================================================

interface UseJobsOptions {
  status?: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'cancelled';
  vendor_id?: string;
  property_id?: string;
  issue_id?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useJobs = (options: UseJobsOptions = {}) => {
  const { status, vendor_id, property_id, issue_id, page = 1, limit = 10, enabled = true } = options;

  return useQuery({
    queryKey: jobQueryKeys.list({ status, vendor_id, property_id, issue_id, page, limit }),
    queryFn: () =>
      jobService.getAll({ status, vendor_id, property_id, issue_id, page, limit }).then(
        (res) => res.data
      ),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes (jobs change frequently)
  });
};

// ============================================================================
// SINGLE JOB HOOK
// ============================================================================

export const useJob = (jobId: string, enabled = true) => {
  return useQuery({
    queryKey: jobQueryKeys.detail(jobId),
    queryFn: () => jobService.getById(jobId).then((res) => res.data),
    enabled: enabled && !!jobId,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// CREATE JOB MUTATION
// PRD §11 - Job Creation from Issue
// ============================================================================

export const useCreateJob = (
  options?: UseMutationOptions<Job, Error, CreateJobRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateJobRequest) =>
      jobService.create(data).then((res) => res.data),
    onSuccess: (newJob) => {
      queryClient.invalidateQueries({
        queryKey: jobQueryKeys.byIssue(newJob.issue_id),
      });
      queryClient.invalidateQueries({
        queryKey: jobQueryKeys.byProperty(newJob.property_id),
      });
      queryClient.invalidateQueries({
        queryKey: jobQueryKeys.lists(),
      });
      // Invalidate related issue
      queryClient.invalidateQueries({
        queryKey: ['issues', 'detail', newJob.issue_id],
      });
      options?.onSuccess?.(newJob);
    },
    ...options,
  });
};

// ============================================================================
// UPDATE JOB MUTATION
// ============================================================================

export const useUpdateJob = (
  jobId: string,
  options?: UseMutationOptions<Job, Error, Partial<Job>>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Job>) =>
      jobService.update(jobId, data).then((res) => res.data),
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(jobQueryKeys.detail(jobId), updatedJob);
      queryClient.invalidateQueries({
        queryKey: jobQueryKeys.lists(),
      });
      options?.onSuccess?.(updatedJob);
    },
    ...options,
  });
};

// ============================================================================
// UPDATE JOB STATUS MUTATION
// PRD §12 - Job Status Workflow
// ============================================================================

export const useUpdateJobStatus = (
  options?: UseMutationOptions<Job, Error, { jobId: string; status: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, status }) =>
      jobService.updateStatus(jobId, status).then((res) => res.data),
    onSuccess: (updatedJob) => {
      queryClient.setQueryData(jobQueryKeys.detail(updatedJob.id), updatedJob);
      queryClient.invalidateQueries({
        queryKey: jobQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: jobQueryKeys.byVendor(updatedJob.vendor_id),
      });
      options?.onSuccess?.(updatedJob);
    },
    ...options,
  });
};

// ============================================================================
// COMPLETE JOB MUTATION
// PRD §12 - Job Completion Process
// Vendors upload photos, work summaries, and invoices
// ============================================================================

export const useCompleteJob = (
  options?: UseMutationOptions<Job, Error, { jobId: string } & CompleteJobRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, ...data }) =>
      jobService.complete(jobId, data).then((res) => res.data),
    onSuccess: (completedJob) => {
      queryClient.setQueryData(
        jobQueryKeys.detail(completedJob.id),
        completedJob
      );
      queryClient.invalidateQueries({
        queryKey: jobQueryKeys.lists(),
      });
      // Invalidate invoices (new invoice created)
      queryClient.invalidateQueries({
        queryKey: ['invoices'],
      });
      options?.onSuccess?.(completedJob);
    },
    ...options,
  });
};

// ============================================================================
// APPROVE JOB MUTATION
// PRD §13 - Approval Workflow
// Property owners review and approve completed jobs
// ============================================================================

export const useApproveJob = (
  options?: UseMutationOptions<Job, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) =>
      jobService.approve(jobId).then((res) => res.data),
    onSuccess: (approvedJob) => {
      queryClient.setQueryData(jobQueryKeys.detail(approvedJob.id), approvedJob);
      queryClient.invalidateQueries({
        queryKey: jobQueryKeys.lists(),
      });
      // Invalidate payments (payment processing triggered)
      queryClient.invalidateQueries({
        queryKey: ['payments'],
      });
      options?.onSuccess?.(approvedJob);
    },
    ...options,
  });
};

// ============================================================================
// REJECT JOB MUTATION
// PRD §13 - Approval Workflow
// ============================================================================

export const useRejectJob = (
  options?: UseMutationOptions<Job, Error, { jobId: string; reason: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, reason }) =>
      jobService.reject(jobId, reason).then((res) => res.data),
    onSuccess: (rejectedJob) => {
      queryClient.setQueryData(jobQueryKeys.detail(rejectedJob.id), rejectedJob);
      queryClient.invalidateQueries({
        queryKey: jobQueryKeys.lists(),
      });
      options?.onSuccess?.(rejectedJob);
    },
    ...options,
  });
};

// ============================================================================
// UPLOAD JOB PHOTO MUTATION
// PRD §12 - Completion Photos
// ============================================================================

export const useUploadJobPhoto = (
  jobId: string,
  options?: UseMutationOptions<JobPhoto, Error, FormData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      jobService.uploadPhoto(jobId, formData).then((res) => res.data.photo),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobQueryKeys.detail(jobId),
      });
      options?.onSuccess?.(undefined as any);
    },
    ...options,
  });
};

// ============================================================================
// ADD JOB COMMENT MUTATION
// ============================================================================

export const useAddJobComment = (
  jobId: string,
  options?: UseMutationOptions<JobComment, Error, { content: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content }) =>
      jobService.addComment(jobId, content).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: jobQueryKeys.detail(jobId),
      });
      options?.onSuccess?.(undefined as any);
    },
    ...options,
  });
};

// ============================================================================
// DELETE JOB MUTATION (Admin Only)
// ============================================================================

export const useDeleteJob = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => jobService.delete(jobId),
    onSuccess: (data, jobId) => {
      queryClient.removeQueries({
        queryKey: jobQueryKeys.detail(jobId),
      });
      queryClient.invalidateQueries({
        queryKey: jobQueryKeys.lists(),
      });
      options?.onSuccess?.(data, jobId);
    },
    ...options,
  });
};