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

function errorMessage(status: number, text: string) {
  if (!text) return `HTTP ${status}`;
  try {
    const body = JSON.parse(text) as { message?: string };
    if (body.message) return body.message;
  } catch {
    /* plain text */
  }
  return text;
}

let refreshLock: Promise<void> | null = null;

async function refreshAccess() {
  if (!refreshLock) {
    refreshLock = import("@/services/admin/auth")
      .then(({ adminAuthService }) => adminAuthService.refresh())
      .then(() => undefined)
      .finally(() => {
        refreshLock = null;
      });
  }
  await refreshLock;
}

export async function adminFetch<T>(
  endpoint: string,
  init: RequestInit = {},
  withAuth = true,
): Promise<T> {
  return adminFetchOnce(endpoint, init, withAuth, false);
}

async function adminFetchOnce<T>(
  endpoint: string,
  init: RequestInit,
  withAuth: boolean,
  didRefresh: boolean,
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
    if (response.status === 401 && withAuth && !didRefresh) {
      try {
        await refreshAccess();
        return adminFetchOnce(endpoint, init, withAuth, true);
      } catch {
        /* 원래 401을 그대로 던짐 */
      }
    }
    const text = await response.text().catch(() => "");
    throw new AdminHttpError(response.status, errorMessage(response.status, text));
  }

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  return (await response.text()) as T;
}
