// src/hooks/usePayments.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from '@tanstack/react-query';
import {
  paymentService,
  Invoice,
  Payment,
  InvoiceRequest,
  ProcessPaymentRequest,
  PaymentMethod,
} from '@/services/api';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const paymentQueryKeys = {
  all: ['payments'] as const,
  invoices: () => [...paymentQueryKeys.all, 'invoices'] as const,
  invoice: (id: string) => [...paymentQueryKeys.invoices(), id] as const,
  payments: () => [...paymentQueryKeys.all, 'payments'] as const,
  payment: (id: string) => [...paymentQueryKeys.payments(), id] as const,
  byJob: (jobId: string) => [...paymentQueryKeys.all, 'job', jobId] as const,
  byVendor: (vendorId: string) => [...paymentQueryKeys.all, 'vendor', vendorId] as const,
  paymentMethods: () => [...paymentQueryKeys.all, 'methods'] as const,
  vendorPayouts: (vendorId: string) =>
    [...paymentQueryKeys.all, 'vendor', vendorId, 'payouts'] as const,
};

// ============================================================================
// INVOICE LIST HOOK
// PRD §14 - Payment Module
// ============================================================================

interface UseInvoicesOptions {
  job_id?: string;
  vendor_id?: string;
  status?: 'pending' | 'approved' | 'paid' | 'rejected';
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export const useInvoices = (options: UseInvoicesOptions = {}) => {
  const { job_id, vendor_id, status, page = 1, limit = 10, enabled = true } = options;

  return useQuery({
    queryKey: paymentQueryKeys.invoices(),
    queryFn: () =>
      paymentService.getAll({ job_id, vendor_id, status, page, limit }).then(
        (res) => res.data
      ),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// SINGLE INVOICE HOOK
// ============================================================================

export const useInvoice = (invoiceId: string, enabled = true) => {
  return useQuery({
    queryKey: paymentQueryKeys.invoice(invoiceId),
    queryFn: () =>
      paymentService.getInvoice(invoiceId).then((res) => res.data),
    enabled: enabled && !!invoiceId,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// APPROVE INVOICE MUTATION
// PRD §13, §14 - Approval Workflow & Payment Processing
// ============================================================================

export const useApproveInvoice = (
  options?: UseMutationOptions<Invoice, Error, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceId: string) =>
      paymentService.approveInvoice(invoiceId).then((res) => res.data),
    onSuccess: (approvedInvoice) => {
      queryClient.setQueryData(
        paymentQueryKeys.invoice(approvedInvoice.id),
        approvedInvoice
      );
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.invoices(),
      });
      options?.onSuccess?.(approvedInvoice);
    },
    ...options,
  });
};

// ============================================================================
// REJECT INVOICE MUTATION
// ============================================================================

export const useRejectInvoice = (
  options?: UseMutationOptions<Invoice, Error, { invoiceId: string; reason: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId, reason }) =>
      paymentService.rejectInvoice(invoiceId, reason).then((res) => res.data),
    onSuccess: (rejectedInvoice) => {
      queryClient.setQueryData(
        paymentQueryKeys.invoice(rejectedInvoice.id),
        rejectedInvoice
      );
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.invoices(),
      });
      options?.onSuccess?.(rejectedInvoice);
    },
    ...options,
  });
};

// ============================================================================
// PROCESS PAYMENT MUTATION
// PRD §14 - Payment Integrations (Stripe, Paystack, PayPal)
// ============================================================================

export const useProcessPayment = (
  options?: UseMutationOptions<Payment, Error, ProcessPaymentRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProcessPaymentRequest) =>
      paymentService.processPayment(data).then((res) => res.data),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.invoice(payment.invoice_id),
      });
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.payments(),
      });
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.invoices(),
      });
      options?.onSuccess?.(payment);
    },
    ...options,
  });
};

// ============================================================================
// SINGLE PAYMENT HOOK
// ============================================================================

export const usePayment = (paymentId: string, enabled = true) => {
  return useQuery({
    queryKey: paymentQueryKeys.payment(paymentId),
    queryFn: () =>
      paymentService.getPayment(paymentId).then((res) => res.data),
    enabled: enabled && !!paymentId,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// PAYMENT METHODS HOOK
// PRD §14 - Payment Gateway Options
// ============================================================================

export const usePaymentMethods = (enabled = true) => {
  return useQuery({
    queryKey: paymentQueryKeys.paymentMethods(),
    queryFn: () =>
      paymentService.getPaymentMethods().then((res) => res.data.methods),
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hour (payment methods rarely change)
  });
};

// ============================================================================
// VENDOR PAYOUT MUTATION
// Architecture Task 5 - Automated Vendor Payouts
// ============================================================================

export const useRequestVendorPayout = (
  vendorId: string,
  options?: UseMutationOptions<void, Error, { amount: number }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ amount }) =>
      paymentService.requestPayout(vendorId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.vendorPayouts(vendorId),
      });
      options?.onSuccess?.(undefined as any);
    },
    ...options,
  });
};

// ============================================================================
// CREATE INVOICE MUTATION (Vendor Submits)
// PRD §12, §14 - Invoice Submission After Job Completion
// ============================================================================

export const useCreateInvoice = (
  options?: UseMutationOptions<Invoice, Error, { job_id: string } & InvoiceRequest>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ job_id, ...data }) =>
      paymentService.createInvoice(job_id, data).then((res) => res.data),
    onSuccess: (newInvoice) => {
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.invoices(),
      });
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.byJob(newInvoice.job_id),
      });
      options?.onSuccess?.(newInvoice);
    },
    ...options,
  });
};

// ============================================================================
// DOWNLOAD INVOICE MUTATION
// PRD §17 - Document Generation (PDF/Excel)
// ============================================================================

export const useDownloadInvoice = (
  options?: UseMutationOptions<Blob, Error, string>
) => {
  return useMutation({
    mutationFn: (invoiceId: string) =>
      paymentService.downloadInvoice(invoiceId).then((res) => res.data),
    ...options,
  });
};

// ============================================================================
// PAYMENT RECEIPT HOOK
// PRD §17 - Payment Receipts
// ============================================================================

export const usePaymentReceipt = (paymentId: string, enabled = true) => {
  return useQuery({
    queryKey: [...paymentQueryKeys.payment(paymentId), 'receipt'],
    queryFn: () =>
      paymentService.getPaymentReceipt(paymentId).then((res) => res.data),
    enabled: enabled && !!paymentId,
    staleTime: 1000 * 60 * 30,
  });
};