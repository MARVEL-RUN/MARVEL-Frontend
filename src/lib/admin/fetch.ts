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
    const body = JSON.parse(text) as { message?: string; code?: string };
    if (body.message) return body.message;
    if (body.code) return body.code;
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

export type AdminFile = {
  blob: Blob;
  filename: string;
};

export async function adminFetch<T>(
  endpoint: string,
  init: RequestInit = {},
  withAuth = true,
): Promise<T> {
  const response = await adminRequest(endpoint, init, withAuth, false);
  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }
  return (await response.text()) as T;
}

export async function adminFetchBlob(
  endpoint: string,
  init: RequestInit = {},
  fallbackName = "download.bin",
): Promise<{ blob: Blob; filename: string }> {
  const headers = new Headers(init.headers);
  if (!headers.has("Accept")) {
    headers.set(
      "Accept",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream",
    );
  }

  const response = await adminRequest(endpoint, { ...init, headers }, true, false);
  const blob = await response.blob();
  return {
    blob,
    filename: filenameFromDisposition(response.headers.get("content-disposition"), fallbackName),
  };
}

export function saveAdminDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function adminRequest(
  endpoint: string,
  init: RequestInit,
  withAuth: boolean,
  didRefresh: boolean,
): Promise<Response> {
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
        return adminRequest(endpoint, init, withAuth, true);
      } catch {
        /* 원래 401을 그대로 던짐 */
      }
    }
    const text = await response.text().catch(() => "");
    throw new AdminHttpError(response.status, errorMessage(response.status, text));
  }
  return response;
}

function filenameFromDisposition(header: string | null, fallback: string) {
  if (!header) return fallback;

  const encoded = header.match(/filename\*\s*=\s*(?:UTF-8''|utf-8'')([^;]+)/i);
  if (encoded?.[1]) {
    try {
      const name = decodeURIComponent(encoded[1].trim().replace(/^["']|["']$/g, ""));
      if (name) return name;
    } catch {
      /* 헤더 깨지면 fallback */
    }
  }

  const plain = header.match(/filename\s*=\s*("(?:\\.|[^"])*"|[^;]+)/i);
  if (plain?.[1]) {
    const name = plain[1].trim().replace(/^["']|["']$/g, "").replace(/\\"/g, '"');
    if (name) return name;
  }

  return fallback;
}

export function isAdminHttp(error: unknown, status?: number): error is AdminHttpError {
  if (!(error instanceof AdminHttpError)) return false;
  return status === undefined || error.status === status;
}
