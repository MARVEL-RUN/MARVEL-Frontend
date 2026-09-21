import { adminFetch } from "@/lib/admin/fetch";

export type AdminPaymentLeader = {
  name?: string;
  birth?: string;
  phNum?: string;
};

export type AdminPaymentAllocation = {
  paymentAllocationId?: string;
  registrationId?: string;
  name?: string;
  allocatedAmount?: number;
  allocationPurpose?: string;
  excludedFromCurrentRoster?: boolean;
  registrationMissing?: boolean;
};

export type AdminPaymentCancelAllocation = {
  paymentCancelAllocationId?: string;
  paymentAllocationId?: string;
  registrationId?: string;
  name?: string;
  allocatedAmount?: number;
  excludedFromCurrentRoster?: boolean;
  registrationMissing?: boolean;
  originalAllocationMissing?: boolean;
  originalPaymentMismatch?: boolean;
};

export type AdminPaymentCancel = {
  paymentCancelId?: string;
  cancelType?: string;
  purpose?: string;
  cancelAmount?: number;
  cancelReason?: string;
  status?: string;
  createdAt?: string;
  requestedAt?: string;
  canceledAt?: string;
  errorCode?: string;
  errorMessage?: string;
  refundableAmountAfterCancel?: number;
  allocationMissing?: boolean;
  allocations?: AdminPaymentCancelAllocation[];
};

export type AdminPayment = {
  paymentId?: string;
  orderId?: string;
  orderName?: string;
  amount?: number;
  purpose?: string;
  paymentStatus?: string;
  tossStatus?: string;
  paymentMethod?: string;
  easyPayProvider?: string;
  createdAt?: string;
  approvedAt?: string;
  allocationMissing?: boolean;
  allocations?: AdminPaymentAllocation[];
  cancels?: AdminPaymentCancel[];
};

export type AdminPaymentPage = {
  content: AdminPayment[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type AdminFinance = {
  registrationId?: string;
  organizationId?: string;
  name?: string;
  leader?: AdminPaymentLeader;
  contractAmount?: number;
  registrationStatus?: string;
  paymentStatus?: string;
  refundStatus?: string;
  paymentAction?: string;
  payments?: AdminPaymentPage;
};

export type AdminPaymentLog = {
  createdAt?: string;
  orderId?: string;
  processType?: string;
  source?: string;
  httpStatus?: number;
  errorCode?: string;
  errorMessage?: string;
};

export type AdminPaymentLogPage = {
  content: AdminPaymentLog[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

function emptyPaymentPage(): AdminPaymentPage {
  return { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };
}

function emptyLogPage(): AdminPaymentLogPage {
  return { content: [], page: 0, size: 50, totalElements: 0, totalPages: 0 };
}

function asPaymentPage(data: unknown): AdminPaymentPage {
  if (!data || typeof data !== "object") return emptyPaymentPage();
  const page = data as AdminPaymentPage;
  return {
    content: Array.isArray(page.content) ? page.content : [],
    page: page.page ?? 0,
    size: page.size ?? 20,
    totalElements: page.totalElements ?? 0,
    totalPages: page.totalPages ?? 0,
  };
}

function asLogPage(data: unknown): AdminPaymentLogPage {
  if (!data || typeof data !== "object") return emptyLogPage();
  const page = data as AdminPaymentLogPage;
  return {
    content: Array.isArray(page.content) ? page.content : [],
    page: page.page ?? 0,
    size: page.size ?? 50,
    totalElements: page.totalElements ?? 0,
    totalPages: page.totalPages ?? 0,
  };
}

function asFinance(data: unknown): AdminFinance {
  if (!data || typeof data !== "object") return { payments: emptyPaymentPage() };
  const finance = data as AdminFinance;
  return {
    ...finance,
    payments: asPaymentPage(finance.payments),
  };
}

export function fetchApplicationFinance(
  row: {
    eventId: string;
    id: string;
    kind: string;
    organizationId?: string;
  },
  page = 0,
) {
  if (row.kind === "group") {
    return fetchOrganizationPayments(
      row.eventId,
      row.organizationId || row.id,
      page,
    );
  }
  return fetchPersonalPayments(row.eventId, row.id, page);
}

export function fetchPersonalPayments(
  eventId: string,
  registrationId: string,
  page = 0,
  size = 20,
) {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  return adminFetch<unknown>(
    `v1/admin/events/${encodeURIComponent(eventId)}/registrations/${encodeURIComponent(registrationId)}/payments?${query}`,
  ).then(asFinance);
}

export function fetchOrganizationPayments(
  eventId: string,
  organizationId: string,
  page = 0,
  size = 20,
) {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  return adminFetch<unknown>(
    `v1/admin/events/${encodeURIComponent(eventId)}/organizations/${encodeURIComponent(organizationId)}/payments?${query}`,
  ).then(asFinance);
}

export function fetchPaymentLogs(
  eventId: string,
  paymentId: string,
  page = 0,
  size = 50,
) {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  return adminFetch<unknown>(
    `v1/admin/events/${encodeURIComponent(eventId)}/payments/${encodeURIComponent(paymentId)}/logs?${query}`,
  ).then(asLogPage);
}

export function paymentMethodLabel(payment: AdminPayment) {
  const method = payment.paymentMethod?.trim() ?? "";
  const provider = payment.easyPayProvider?.trim() ?? "";
  if (method && provider) return `${method} · ${provider}`;
  return method || provider || "-";
}
