// src/hooks/useIssues.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  issueService,
  Issue,
  IssueComment,
  IssuePhoto,
  CreateIssueRequest,
  AssignIssueRequest,
} from '@/services/api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const issueQueryKeys = {
  all: ['issues'] as const,
  lists: () => [...issueQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) =>
    [...issueQueryKeys.lists(), filters] as const,
  details: () => [...issueQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...issueQueryKeys.details(), id] as const,
  byProperty: (propertyId: string) =>
    [...issueQueryKeys.all, 'property', propertyId] as const,
  byVendor: (vendorId: string) =>
    [...issueQueryKeys.all, 'vendor', vendorId] as const,
};

// ============================================================================
// ISSUE LIST HOOK
// PRD §8
// ============================================================================

interface UseIssuesOptions {
  property_id?: string;
  status?: 'open' | 'assigned' | 'in_progress' | 'awaiting_approval' | 'completed' | 'closed';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  assigned_vendor_id?: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useIssues = (options: UseIssuesOptions = {}) => {
  const { property_id, status, severity, assigned_vendor_id, page = 1, limit = 10, enabled = true } = options;

  return useQuery({
    queryKey: issueQueryKeys.list({ property_id, status, severity, assigned_vendor_id, page, limit }),
    queryFn: () =>
      issueService.getAll({ property_id, status, severity, assigned_vendor_id, page, limit }).then(
        (res) => res.data
      ),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes (issues change frequently)
  });
};

// ============================================================================
// SINGLE ISSUE HOOK
// ============================================================================

export const useIssue = (issueId: string, enabled = true) => {
  return useQuery({
    queryKey: issueQueryKeys.detail(issueId),
    queryFn: () => issueService.getById(issueId).then((res) => res.data),
    enabled: enabled && !!issueId,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// CREATE ISSUE MUTATION
// PRD §8 - Auto-created from inspection
// ============================================================================

export const useCreateIssue = (
  options?: UseMutationOptions<Issue, Error, CreateIssueRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIssueRequest) =>
      issueService.create(data).then((res) => res.data),
    onSuccess: (newIssue) => {
      queryClient.invalidateQueries({
        queryKey: issueQueryKeys.byProperty(newIssue.property_id),
      });
      queryClient.invalidateQueries({
        queryKey: issueQueryKeys.lists(),
      });
      options?.onSuccess?.(newIssue);
    },
    ...options,
  });
};

// ============================================================================
// UPDATE ISSUE STATUS MUTATION
// PRD §8 - Issue Status Workflow
// ============================================================================

export const useUpdateIssueStatus = (
  options?: UseMutationOptions<Issue, Error, { issueId: string; status: string; comment?: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, status, comment }) =>
      issueService.updateStatus(issueId, status, comment).then((res) => res.data),
    onSuccess: (updatedIssue) => {
      queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(updatedIssue.id),
      });
      queryClient.invalidateQueries({
        queryKey: issueQueryKeys.lists(),
      });
      options?.onSuccess?.(updatedIssue);
    },
    ...options,
  });
};

// ============================================================================
// ASSIGN ISSUE TO VENDOR MUTATION
// PRD §11 - Job Assignment
// ============================================================================

export const useAssignIssueToVendor = (
  options?: UseMutationOptions<Issue, Error, { issueId: string } & AssignIssueRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ issueId, ...data }) =>
      issueService.assignToVendor(issueId, data).then((res) => res.data),
    onSuccess: (updatedIssue) => {
      queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(updatedIssue.id),
      });
      queryClient.invalidateQueries({
        queryKey: issueQueryKeys.lists(),
      });
      // Invalidate jobs list (new job created)
      queryClient.invalidateQueries({
        queryKey: ['jobs'],
      });
      options?.onSuccess?.(updatedIssue);
    },
    ...options,
  });
};

// ============================================================================
// ADD ISSUE COMMENT MUTATION
// ============================================================================

export const useAddIssueComment = (
  issueId: string,
  options?: UseMutationOptions<IssueComment, Error, { content: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content }) =>
      issueService.addComment(issueId, content).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(issueId),
      });
      options?.onSuccess?.(undefined as any);
    },
    ...options,
  });
};

// ============================================================================
// UPLOAD ISSUE PHOTO MUTATION
// ============================================================================

export const useUploadIssuePhoto = (
  issueId: string,
  options?: UseMutationOptions<IssuePhoto, Error, FormData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      issueService.uploadPhoto(issueId, formData).then((res) => res.data.photo),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: issueQueryKeys.detail(issueId),
      });
      options?.onSuccess?.(undefined as any);
    },
    ...options,
  });
};

// ============================================================================
// DELETE ISSUE MUTATION
// ============================================================================

export const useDeleteIssue = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueId: string) => issueService.delete(issueId),
    onSuccess: (data, issueId) => {
      queryClient.removeQueries({
        queryKey: issueQueryKeys.detail(issueId),
      });
      queryClient.invalidateQueries({
        queryKey: issueQueryKeys.lists(),
      });
      options?.onSuccess?.(data, issueId);
    },
    ...options,
  });
};