// src/hooks/useInspections.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  inspectionService,
  Inspection,
  InspectionItem,
  InspectionPhoto,
  InspectionNote,
  InspectionSignature,
  UpdateInspectionItemRequest,
} from '@/services/api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const inspectionQueryKeys = {
  all: ['inspections'] as const,
  lists: () => [...inspectionQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) =>
    [...inspectionQueryKeys.lists(), filters] as const,
  details: () => [...inspectionQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inspectionQueryKeys.details(), id] as const,
  byProperty: (propertyId: string) =>
    [...inspectionQueryKeys.all, 'property', propertyId] as const,
};

// ============================================================================
// INSPECTION LIST HOOK
// PRD §6
// ============================================================================

interface UseInspectionsOptions {
  property_id?: string;
  status?: 'draft' | 'in_progress' | 'completed' | 'signed';
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useInspections = (options: UseInspectionsOptions = {}) => {
  const { property_id, status, page = 1, limit = 10, enabled = true } = options;

  return useQuery({
    queryKey: property_id
      ? inspectionQueryKeys.byProperty(property_id)
      : inspectionQueryKeys.list({ status, page, limit }),
    queryFn: () =>
      inspectionService.getAll({ property_id, status, page, limit }).then(
        (res) => res.data
      ),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// SINGLE INSPECTION HOOK
// ============================================================================

export const useInspection = (inspectionId: string, enabled = true) => {
  return useQuery({
    queryKey: inspectionQueryKeys.detail(inspectionId),
    queryFn: () =>
      inspectionService.getById(inspectionId).then((res) => res.data),
    enabled: enabled && !!inspectionId,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// CREATE INSPECTION MUTATION
// PRD §6
// ============================================================================

export const useCreateInspection = (
  options?: UseMutationOptions<Inspection, Error, { property_id: string; inspection_type: string; inspector_id: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      inspectionService.create(data).then((res) => res.data),
    onSuccess: (newInspection) => {
      queryClient.invalidateQueries({
        queryKey: inspectionQueryKeys.byProperty(newInspection.property_id),
      });
      queryClient.invalidateQueries({
        queryKey: inspectionQueryKeys.lists(),
      });
      options?.onSuccess?.(newInspection);
    },
    ...options,
  });
};

// ============================================================================
// UPDATE INSPECTION ITEM MUTATION
// PRD §7 - Item Status Capture
// ============================================================================

export const useUpdateInspectionItem = (
  inspectionId: string,
  options?: UseMutationOptions<InspectionItem, Error, { itemId: string } & UpdateInspectionItemRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, ...data }) =>
      inspectionService.updateItem(inspectionId, itemId, data).then((res) => res.data),
    onSuccess: (updatedItem) => {
      // Update the inspection detail cache
      queryClient.invalidateQueries({
        queryKey: inspectionQueryKeys.detail(inspectionId),
      });
      options?.onSuccess?.(updatedItem);
    },
    ...options,
  });
};

// ============================================================================
// UPLOAD INSPECTION PHOTO MUTATION
// PRD §7, §18 - Mobile Photo Capture
// ============================================================================

export const useUploadInspectionPhoto = (
  inspectionId: string,
  options?: UseMutationOptions<InspectionPhoto, Error, FormData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      inspectionService.uploadPhoto(inspectionId, formData).then((res) => res.data.photo),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inspectionQueryKeys.detail(inspectionId),
      });
      options?.onSuccess?.(undefined as any);
    },
    ...options,
  });
};

// ============================================================================
// ADD INSPECTION NOTE MUTATION
// PRD §18 - Voice Notes Support
// ============================================================================

export const useAddInspectionNote = (
  inspectionId: string,
  options?: UseMutationOptions<InspectionNote, Error, { content: string; voiceNoteUrl?: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ content, voiceNoteUrl }) =>
      inspectionService.addNote(inspectionId, content, voiceNoteUrl).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inspectionQueryKeys.detail(inspectionId),
      });
      options?.onSuccess?.(undefined as any);
    },
    ...options,
  });
};

// ============================================================================
// ADD SIGNATURE MUTATION
// PRD §18, Task 3 - Digital Signature
// ============================================================================

export const useAddInspectionSignature = (
  inspectionId: string,
  options?: UseMutationOptions<InspectionSignature, Error, InspectionSignature>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (signatureData: InspectionSignature) =>
      inspectionService.addSignature(inspectionId, signatureData).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inspectionQueryKeys.detail(inspectionId),
      });
      options?.onSuccess?.(undefined as any);
    },
    ...options,
  });
};

// ============================================================================
// COMPLETE INSPECTION MUTATION
// PRD §6, Task 3 - Step 7
// ============================================================================

export const useCompleteInspection = (
  options?: UseMutationOptions<Inspection, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inspectionId: string) =>
      inspectionService.complete(inspectionId).then((res) => res.data),
    onSuccess: (completedInspection) => {
      queryClient.invalidateQueries({
        queryKey: inspectionQueryKeys.detail(completedInspection.id),
      });
      queryClient.invalidateQueries({
        queryKey: inspectionQueryKeys.byProperty(completedInspection.property_id),
      });
      // Invalidate issues list (auto-created from inspection)
      queryClient.invalidateQueries({
        queryKey: ['issues'],
      });
      options?.onSuccess?.(completedInspection);
    },
    ...options,
  });
};

// ============================================================================
// MOBILE: OFFLINE SYNC MUTATION
// Architecture Task 3 - Offline Capability
// ============================================================================

export const useSyncInspections = (
  options?: UseMutationOptions<void, Error, { inspections: Inspection[] }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => inspectionService.sync(payload),
    onSuccess: () => {
      // Invalidate all inspection queries after sync
      queryClient.invalidateQueries({
        queryKey: inspectionQueryKeys.all,
      });
      options?.onSuccess?.(undefined as any);
    },
    ...options,
  });
};