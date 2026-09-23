export const ADMIN_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL_ADMIN?.replace(/\/+$/, "") ?? "";

export const hasAdminApi = ADMIN_API_BASE.length > 0;

/** 환불 배치 API. `0`이면 끔 */
export const hasAdminRefundBatch =
  process.env.NEXT_PUBLIC_ADMIN_REFUND_BATCH !== "0";
