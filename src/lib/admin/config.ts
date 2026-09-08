export const ADMIN_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL_ADMIN?.replace(/\/+$/, "") ?? "";

export const hasAdminApi = ADMIN_API_BASE.length > 0;
