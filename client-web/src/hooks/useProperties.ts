// src/hooks/useProperties.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  propertyService,
  Property,
  PropertyStructure,
  PropertyImage,
} from '@/services/api';

// ============================================================================
// QUERY KEYS (Follow React Query best practices)
// ============================================================================

export const propertyQueryKeys = {
  all: ['properties'] as const,
  lists: () => [...propertyQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) =>
    [...propertyQueryKeys.lists(), filters] as const,
  details: () => [...propertyQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...propertyQueryKeys.details(), id] as const,
  structure: (propertyId: string) =>
    [...propertyQueryKeys.detail(propertyId), 'structure'] as const,
  images: (propertyId: string) =>
    [...propertyQueryKeys.detail(propertyId), 'images'] as const,
};

// ============================================================================
// PROPERTY LIST HOOK
// ============================================================================

interface UsePropertiesOptions {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean;
}

export const useProperties = (options: UsePropertiesOptions = {}) => {
  const { page = 1, limit = 10, search = '', enabled = true } = options;

  return useQuery({
    queryKey: propertyQueryKeys.list({ page, limit, search }),
    queryFn: () =>
      propertyService.getAll({ page, limit, search }).then((res) => res.data),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

// ============================================================================
// SINGLE PROPERTY HOOK
// ============================================================================

export const useProperty = (propertyId: string, enabled = true) => {
  return useQuery({
    queryKey: propertyQueryKeys.detail(propertyId),
    queryFn: () => propertyService.getById(propertyId).then((res) => res.data),
    enabled: enabled && !!propertyId,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// PROPERTY STRUCTURE HOOK (Building → Floor → Room → Item)
// PRD §4, Architecture Task 2
// ============================================================================

export const usePropertyStructure = (propertyId: string, enabled = true) => {
  return useQuery({
    queryKey: propertyQueryKeys.structure(propertyId),
    queryFn: () =>
      propertyService.getStructure(propertyId).then((res) => res.data),
    enabled: enabled && !!propertyId,
    staleTime: 1000 * 60 * 10, // 10 minutes (structure changes less frequently)
  });
};

// ============================================================================
// CREATE PROPERTY MUTATION
// PRD §3
// ============================================================================

export const useCreateProperty = (
  options?: UseMutationOptions<Property, Error, Partial<Property>>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Property>) =>
      propertyService.create(data).then((res) => res.data),
    onSuccess: (newProperty) => {
      // Invalidate property list to refresh
      queryClient.invalidateQueries({
        queryKey: propertyQueryKeys.lists(),
      });
      options?.onSuccess?.(newProperty);
    },
    ...options,
  });
};

// ============================================================================
// UPDATE PROPERTY MUTATION
// ============================================================================

export const useUpdateProperty = (
  propertyId: string,
  options?: UseMutationOptions<Property, Error, Partial<Property>>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Property>) =>
      propertyService.update(propertyId, data).then((res) => res.data),
    onSuccess: (updatedProperty) => {
      // Update the specific property in cache
      queryClient.setQueryData(
        propertyQueryKeys.detail(propertyId),
        updatedProperty
      );
      // Invalidate list to ensure consistency
      queryClient.invalidateQueries({
        queryKey: propertyQueryKeys.lists(),
      });
      options?.onSuccess?.(updatedProperty);
    },
    ...options,
  });
};

// ============================================================================
// DELETE PROPERTY MUTATION
// ============================================================================

export const useDeleteProperty = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => propertyService.delete(propertyId),
    onSuccess: (data, propertyId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: propertyQueryKeys.detail(propertyId),
      });
      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: propertyQueryKeys.lists(),
      });
      options?.onSuccess?.(data, propertyId);
    },
    ...options,
  });
};

// ============================================================================
// UPDATE PROPERTY STRUCTURE MUTATION
// PRD §4 - Building → Floor → Room → Item
// ============================================================================

export const useUpdatePropertyStructure = (
  propertyId: string,
  options?: UseMutationOptions<PropertyStructure, Error, PropertyStructure>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (structure: PropertyStructure) =>
      propertyService.updateStructure(propertyId, structure).then((res) => res.data),
    onSuccess: (updatedStructure) => {
      // Update structure cache
      queryClient.setQueryData(
        propertyQueryKeys.structure(propertyId),
        updatedStructure
      );
      options?.onSuccess?.(updatedStructure);
    },
    ...options,
  });
};

// ============================================================================
// PROPERTY IMAGE UPLOAD MUTATION
// PRD §3 - Property Images
// ============================================================================

export const useUploadPropertyImage = (
  propertyId: string,
  options?: UseMutationOptions<PropertyImage, Error, FormData>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      propertyService.uploadImage(propertyId, formData).then((res) => res.data.image),
    onSuccess: (newImage) => {
      // Update images list in cache
      queryClient.invalidateQueries({
        queryKey: propertyQueryKeys.images(propertyId),
      });
      // Also invalidate property detail to reflect new image
      queryClient.invalidateQueries({
        queryKey: propertyQueryKeys.detail(propertyId),
      });
      options?.onSuccess?.(newImage);
    },
    ...options,
  });
};

// ============================================================================
// DELETE PROPERTY IMAGE MUTATION
// ============================================================================

export const useDeletePropertyImage = (
  propertyId: string,
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) =>
      propertyService.deleteImage(propertyId, imageId),
    onSuccess: (data, imageId) => {
      queryClient.invalidateQueries({
        queryKey: propertyQueryKeys.images(propertyId),
      });
      queryClient.invalidateQueries({
        queryKey: propertyQueryKeys.detail(propertyId),
      });
      options?.onSuccess?.(data, imageId);
    },
    ...options,
  });
};

// ============================================================================
// BULK PROPERTY OPERATIONS (Optional - for Admin)
// ============================================================================

export const useBulkDeleteProperties = (
  options?: UseMutationOptions<void, Error, string[]>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyIds: string[]) => {
      await Promise.all(propertyIds.map((id) => propertyService.delete(id)));
    },
    onSuccess: (data, propertyIds) => {
      // Remove all from cache
      propertyIds.forEach((id) => {
        queryClient.removeQueries({
          queryKey: propertyQueryKeys.detail(id),
        });
      });
      queryClient.invalidateQueries({
        queryKey: propertyQueryKeys.lists(),
      });
      options?.onSuccess?.(data, propertyIds);
    },
    ...options,
  });
};