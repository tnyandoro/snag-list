// src/hooks/useVendors.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  vendorService,
  Vendor,
  VendorService,
  VendorProfile,
  RegisterVendorRequest,
  ServiceCategory,
} from '@/services/api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const vendorQueryKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorQueryKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) =>
    [...vendorQueryKeys.lists(), filters] as const,
  details: () => [...vendorQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorQueryKeys.details(), id] as const,
  profiles: () => [...vendorQueryKeys.all, 'profiles'] as const,
  profile: (vendorId: string) =>
    [...vendorQueryKeys.profiles(), vendorId] as const,
  reviews: (vendorId: string) =>
    [...vendorQueryKeys.detail(vendorId), 'reviews'] as const,
  serviceCategories: () => [...vendorQueryKeys.all, 'service-categories'] as const,
  myVendors: () => [...vendorQueryKeys.all, 'my-vendors'] as const, // For owners
};

// ============================================================================
// VENDOR LIST HOOK
// PRD §9-10, Architecture Task 5 - Vendor Marketplace
// ============================================================================

interface UseVendorsOptions {
  service_category?: ServiceCategory;
  service_area?: string;
  is_verified?: boolean;
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useVendors = (options: UseVendorsOptions = {}) => {
  const {
    service_category,
    service_area,
    is_verified,
    page = 1,
    limit = 10,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: vendorQueryKeys.list({
      service_category,
      service_area,
      is_verified,
      page,
      limit,
    }),
    queryFn: () =>
      vendorService
        .getAll({ service_category, service_area, is_verified, page, limit })
        .then((res) => res.data),
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes (vendor data changes less frequently)
    gcTime: 1000 * 60 * 30,
  });
};

// ============================================================================
// SINGLE VENDOR HOOK
// ============================================================================

export const useVendor = (vendorId: string, enabled = true) => {
  return useQuery({
    queryKey: vendorQueryKeys.detail(vendorId),
    queryFn: () =>
      vendorService.getById(vendorId).then((res) => res.data),
    enabled: enabled && !!vendorId,
    staleTime: 1000 * 60 * 10,
  });
};

// ============================================================================
// VENDOR PROFILE HOOK
// PRD §9 - Vendor Certifications & Documents
// ============================================================================

export const useVendorProfile = (vendorId: string, enabled = true) => {
  return useQuery({
    queryKey: vendorQueryKeys.profile(vendorId),
    queryFn: () =>
      vendorService.getProfile(vendorId).then((res) => res.data),
    enabled: enabled && !!vendorId,
    staleTime: 1000 * 60 * 15,
  });
};

// ============================================================================
// VENDOR REVIEWS HOOK
// Architecture Task 5 - Vendor Ranking Algorithm
// ============================================================================

export const useVendorReviews = (vendorId: string, enabled = true) => {
  return useQuery({
    queryKey: vendorQueryKeys.reviews(vendorId),
    queryFn: () =>
      vendorService.getReviews(vendorId).then((res) => res.data),
    enabled: enabled && !!vendorId,
    staleTime: 1000 * 60 * 30,
  });
};

// ============================================================================
// SERVICE CATEGORIES HOOK
// PRD §10 - Service Categories
// ============================================================================

export const useServiceCategories = (enabled = true) => {
  return useQuery({
    queryKey: vendorQueryKeys.serviceCategories(),
    queryFn: () =>
      vendorService.getServiceCategories().then((res) => res.data.categories),
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour (categories rarely change)
  });
};

// ============================================================================
// REGISTER VENDOR MUTATION
// PRD §9 - Vendor Onboarding
// ============================================================================

export const useRegisterVendor = (
  options?: UseMutationOptions<Vendor, Error, RegisterVendorRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterVendorRequest) =>
      vendorService.register(data).then((res) => res.data),
    onSuccess: (newVendor) => {
      queryClient.invalidateQueries({
        queryKey: vendorQueryKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: vendorQueryKeys.serviceCategories(),
      });
      options?.onSuccess?.(newVendor);
    },
    ...options,
  });
};

// ============================================================================
// UPDATE VENDOR MUTATION
// ============================================================================

export const useUpdateVendor = (
  vendorId: string,
  options?: UseMutationOptions<Vendor, Error, Partial<Vendor>>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Vendor>) =>
      vendorService.update(vendorId, data).then((res) => res.data),
    onSuccess: (updatedVendor) => {
      queryClient.setQueryData(
        vendorQueryKeys.detail(vendorId),
        updatedVendor
      );
      queryClient.invalidateQueries({
        queryKey: vendorQueryKeys.lists(),
      });
      options?.onSuccess?.(updatedVendor);
    },
    ...options,
  });
};

// ============================================================================
// UPDATE VENDOR PROFILE MUTATION
// PRD §9 - Certifications & Documents
// ============================================================================

export const useUpdateVendorProfile = (
  vendorId: string,
  options?: UseMutationOptions<VendorProfile, Error, Partial<VendorProfile>>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<VendorProfile>) =>
      vendorService.updateProfile(vendorId, data).then((res) => res.data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(
        vendorQueryKeys.profile(vendorId),
        updatedProfile
      );
      options?.onSuccess?.(updatedProfile);
    },
    ...options,
  });
};

// ============================================================================
// ADD VENDOR REVIEW MUTATION
// Architecture Task 5 - Vendor Ranking
// ============================================================================

export const useAddVendorReview = (
  vendorId: string,
  options?: UseMutationOptions<void, Error, { rating: number; comment: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rating, comment }) =>
      vendorService.addReview(vendorId, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: vendorQueryKeys.reviews(vendorId),
      });
      queryClient.invalidateQueries({
        queryKey: vendorQueryKeys.detail(vendorId),
      });
      options?.onSuccess?.(undefined as any);
    },
    ...options,
  });
};

// ============================================================================
// VERIFY VENDOR MUTATION (Admin Only)
// Architecture Task 5 - Admin Verification
// ============================================================================

export const useVerifyVendor = (
  options?: UseMutationOptions<Vendor, Error, { vendorId: string; is_verified: boolean }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, is_verified }) =>
      vendorService.update(vendorId, { is_verified }).then((res) => res.data),
    onSuccess: (updatedVendor) => {
      queryClient.setQueryData(
        vendorQueryKeys.detail(updatedVendor.id),
        updatedVendor
      );
      queryClient.invalidateQueries({
        queryKey: vendorQueryKeys.lists(),
      });
      options?.onSuccess?.(updatedVendor);
    },
    ...options,
  });
};

// ============================================================================
// DELETE VENDOR MUTATION (Admin Only)
// ============================================================================

export const useDeleteVendor = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendorId: string) => vendorService.delete(vendorId),
    onSuccess: (data, vendorId) => {
      queryClient.removeQueries({
        queryKey: vendorQueryKeys.detail(vendorId),
      });
      queryClient.invalidateQueries({
        queryKey: vendorQueryKeys.lists(),
      });
      options?.onSuccess?.(data, vendorId);
    },
    ...options,
  });
};