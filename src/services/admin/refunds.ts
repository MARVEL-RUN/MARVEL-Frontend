import { adminFetch } from "@/lib/admin/fetch";

export const REFUND_REQUEST_ID_MAX = 64;
export const REFUND_REASON_MAX = 200;
export const REFUND_TARGET_MAX = 100;

export type AdminRefundOperation = "FULL" | "PARTIAL";
export type AdminRefundBatchStatus = "PENDING" | "RUNNING" | "COMPLETED";
export type AdminRefundItemStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCEEDED"
  | "BLOCKED"
  | "FAILED"
  | "NEEDS_REVIEW";

export type AdminRefundCounts = Partial<Record<AdminRefundItemStatus, number>>;

export type AdminRefundMemberSnapshot = {
  registrationId?: string;
  previousContractAmount?: number;
  contractAmount?: number;
  paidAmount?: number;
  status?: string;
  reservationStatus?: string;
  participationCanceled?: boolean;
};

export type AdminRefundPreparedCancel = {
  paymentCancelId?: string;
  paymentId?: string;
  amount?: number;
  type?: string;
  status?: string;
};

export type AdminRefundPreparation = {
  requestId?: string;
  correlationId?: string;
  eventId?: string;
  organizationId?: string;
  preparedAt?: string;
  members?: AdminRefundMemberSnapshot[];
  refunds?: AdminRefundPreparedCancel[];
};

export type AdminRefundExternalCancellation = {
  cancelAmount?: number;
  refundableAmount?: number;
  canceledAt?: string;
  paymentStatus?: string;
};

export type AdminRefundExternalOutcome = {
  kind?: string;
  httpStatus?: number | null;
  errorCode?: string;
  message?: string;
  cancellation?: AdminRefundExternalCancellation;
};

export type AdminRefundExecutedCancel = {
  paymentCancelId?: string;
  started?: boolean;
  externalOutcome?: AdminRefundExternalOutcome | null;
  outcomeStored?: boolean;
  unknownStored?: boolean;
  errorCode?: string;
};

export type AdminRefundExecutionResult = {
  requestId?: string;
  correlationId?: string;
  preparedAt?: string;
  finishedAt?: string;
  refunds?: AdminRefundExecutedCancel[];
  members?: unknown;
  orders?: unknown;
  message?: string;
};

export type AdminRefundItem = {
  itemNo?: number;
  registrationId?: string | null;
  organizationId?: string | null;
  status?: string;
  errorCode?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  preparation?: AdminRefundPreparation | null;
  result?: AdminRefundExecutionResult | Record<string, unknown> | null;
};

export type AdminRefundSummary = {
  batchId?: string;
  requestId?: string;
  operation?: string;
  status?: string;
  acceptedAt?: string | null;
  updatedAt?: string | null;
  completedAt?: string | null;
  total?: number;
  counts?: AdminRefundCounts;
};

export type AdminRefundBatchResponse = {
  summary: AdminRefundSummary;
  items: AdminRefundItem[];
  resultsTruncated?: boolean;
};

export type AdminRefundBatchItemsPage = {
  page: number;
  size: number;
  total: number;
  items: AdminRefundItem[];
};

export type AdminFullRefundBody = {
  requestId: string;
  reason: string;
  registrationIds: string[];
  organizationIds: string[];
};

export type AdminPartialRefundTarget = {
  registrationId: string;
  eventCategoryId: string;
  selectedSouvenirList: Array<{
    souvenirId: string;
    selectedSize?: string | null;
  }>;
  birth?: string | null;
  keepParticipationWhenZero?: boolean;
};

export type AdminPartialRefundBody = {
  requestId: string;
  reason: string;
  targets: AdminPartialRefundTarget[];
};

export type AdminRefundEvidence = {
  evidenceId?: string;
  eventId?: string;
  paymentCancelId?: string;
  paymentId?: string;
  checkedBy?: string;
  startedAt?: string;
  checkedAt?: string;
  httpStatus?: number | null;
  errorCode?: string | null;
  verdict?: string;
  reason?: string;
  financialStateChanged?: boolean;
  retryAllowed?: boolean;
};

export type AdminRefundEvidencePage = {
  page: number;
  size: number;
  items: AdminRefundEvidence[];
};

function eventPath(eventId: string, suffix: string) {
  return `v1/admin/events/${encodeURIComponent(eventId)}/${suffix}`;
}

function asCounts(value: unknown): AdminRefundCounts {
  if (!value || typeof value !== "object") return {};
  return value as AdminRefundCounts;
}

function asItems(value: unknown): AdminRefundItem[] {
  return Array.isArray(value) ? (value as AdminRefundItem[]) : [];
}

export function asRefundBatchResponse(data: unknown): AdminRefundBatchResponse {
  const row = data && typeof data === "object" ? (data as AdminRefundBatchResponse) : null;
  return {
    summary: {
      ...(row?.summary ?? {}),
      counts: asCounts(row?.summary?.counts),
    },
    items: asItems(row?.items),
    resultsTruncated: Boolean(row?.resultsTruncated),
  };
}

function asItemsPage(data: unknown): AdminRefundBatchItemsPage {
  const row = data && typeof data === "object" ? (data as AdminRefundBatchItemsPage) : null;
  return {
    page: row?.page ?? 0,
    size: row?.size ?? 20,
    total: row?.total ?? 0,
    items: asItems(row?.items),
  };
}

function asEvidencePage(data: unknown): AdminRefundEvidencePage {
  const row = data && typeof data === "object" ? (data as AdminRefundEvidencePage) : null;
  return {
    page: row?.page ?? 0,
    size: row?.size ?? 20,
    items: Array.isArray(row?.items) ? row.items : [],
  };
}

export function newRefundRequestId() {
  return crypto.randomUUID();
}

export function postFullRefund(eventId: string, body: AdminFullRefundBody) {
  return adminFetch<unknown>(eventPath(eventId, "payment-refunds"), {
    method: "POST",
    body: JSON.stringify({
      requestId: body.requestId,
      reason: body.reason,
      registrationIds: body.registrationIds,
      organizationIds: body.organizationIds,
    }),
  }).then(asRefundBatchResponse);
}

export function postPartialRefund(eventId: string, body: AdminPartialRefundBody) {
  return adminFetch<unknown>(eventPath(eventId, "payment-partial-refunds"), {
    method: "POST",
    body: JSON.stringify({
      requestId: body.requestId,
      reason: body.reason,
      targets: body.targets,
    }),
  }).then(asRefundBatchResponse);
}

export function fetchRefundResult(eventId: string, requestId: string) {
  const query = new URLSearchParams({ requestId });
  return adminFetch<unknown>(
    eventPath(eventId, `payment-refund-results?${query}`),
  ).then(asRefundBatchResponse);
}

function asSummary(data: unknown): AdminRefundSummary {
  const row = data && typeof data === "object" ? (data as AdminRefundSummary) : {};
  return {
    ...row,
    counts: asCounts(row.counts),
  };
}

export function fetchRefundBatch(eventId: string, batchId: string) {
  return adminFetch<unknown>(
    eventPath(eventId, `payment-refund-batches/${encodeURIComponent(batchId)}`),
  ).then(asSummary);
}

export function fetchRefundBatchItems(
  eventId: string,
  batchId: string,
  page = 0,
  size = 20,
  exceptionsOnly = false,
) {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
    exceptionsOnly: String(exceptionsOnly),
  });
  return adminFetch<unknown>(
    eventPath(eventId, `payment-refund-batches/${encodeURIComponent(batchId)}/items?${query}`),
  ).then(asItemsPage);
}

function asEvidence(data: unknown): AdminRefundEvidence {
  return data && typeof data === "object" ? (data as AdminRefundEvidence) : {};
}

export function postRefundEvidence(eventId: string, paymentCancelId: string) {
  return adminFetch<unknown>(
    eventPath(
      eventId,
      `payment-refunds/${encodeURIComponent(paymentCancelId)}/evidence`,
    ),
    { method: "POST" },
  ).then(asEvidence);
}

export function fetchRefundEvidence(
  eventId: string,
  paymentCancelId: string,
  page = 0,
  size = 20,
) {
  const query = new URLSearchParams({ page: String(page), size: String(size) });
  return adminFetch<unknown>(
    eventPath(
      eventId,
      `payment-refunds/${encodeURIComponent(paymentCancelId)}/evidence?${query}`,
    ),
  ).then(asEvidencePage);
}
