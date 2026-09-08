import { ADMIN_API_BASE } from "./config";
import { adminToken } from "./token";

export class AdminHttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "AdminHttpError";
  }
}

function joinUrl(endpoint: string) {
  return `${ADMIN_API_BASE}/${endpoint.replace(/^\/+/, "")}`;
}

export async function adminFetch<T>(
  endpoint: string,
  init: RequestInit = {},
  withAuth = true,
): Promise<T> {
  if (!ADMIN_API_BASE) {
    throw new AdminHttpError(0, "관리자 API 주소가 설정되지 않았습니다.");
  }

  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (withAuth) {
    const token = adminToken.getAccess();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(joinUrl(endpoint), { ...init, headers });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new AdminHttpError(response.status, text || `HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  return (await response.text()) as T;
}
