// src/hooks/index.ts
// Central export for all hooks

// Properties
export {
  useProperties,
  useProperty,
  usePropertyStructure,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  useUpdatePropertyStructure,
  useUploadPropertyImage,
  useDeletePropertyImage,
  useBulkDeleteProperties,
  propertyQueryKeys,
} from './useProperties';

// Inspections
export {
  useInspections,
  useInspection,
  useCreateInspection,
  useUpdateInspectionItem,
  useUploadInspectionPhoto,
  useAddInspectionNote,
  useAddInspectionSignature,
  useCompleteInspection,
  useSyncInspections,
  inspectionQueryKeys,
} from './useInspections';

// Issues
export {
  useIssues,
  useIssue,
  useCreateIssue,
  useUpdateIssueStatus,
  useAssignIssueToVendor,
  useAddIssueComment,
  useUploadIssuePhoto,
  useDeleteIssue,
  issueQueryKeys,
} from './useIssues';

// Vendors (NEW)
export {
  useVendors,
  useVendor,
  useVendorProfile,
  useVendorReviews,
  useServiceCategories,
  useRegisterVendor,
  useUpdateVendor,
  useUpdateVendorProfile,
  useAddVendorReview,
  useVerifyVendor,
  useDeleteVendor,
  vendorQueryKeys,
} from './useVendors';

// Jobs (NEW)
export {
  useJobs,
  useJob,
  useCreateJob,
  useUpdateJob,
  useUpdateJobStatus,
  useCompleteJob,
  useApproveJob,
  useRejectJob,
  useUploadJobPhoto,
  useAddJobComment,
  useDeleteJob,
  jobQueryKeys,
} from './useJobs';

// Auth (NEW)
export {
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  useRefreshToken,
  useForgotPassword,
  useResetPassword,
  useHasRole,
  useIsAdmin,
  useIsOwner,
  useIsInspector,
  useIsVendor,
  useHasPermission,
  authQueryKeys,
} from './useAuth';

// Payments (NEW)
export {
  useInvoices,
  useInvoice,
  useApproveInvoice,
  useRejectInvoice,
  useProcessPayment,
  usePayment,
  usePaymentMethods,
  useRequestVendorPayout,
  useCreateInvoice,
  useDownloadInvoice,
  usePaymentReceipt,
  paymentQueryKeys,
} from './usePayments';