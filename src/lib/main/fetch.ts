import { MAIN_API_BASE } from "./config";

export class MainHttpError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = "MainHttpError";
  }
}

/** 0은 API 주소 없음. 429·5xx·타임아웃·네트워크만 장애로 본다 */
export function isServerDownError(error: unknown) {
  if (error instanceof MainHttpError) {
    if (error.status === 0) return false;
    return error.status === 408 || error.status === 429 || error.status >= 500;
  }
  if (error instanceof DOMException && error.name === "AbortError") return true;
  return error instanceof TypeError;
}

function joinUrl(endpoint: string) {
  return `${MAIN_API_BASE}/${endpoint.replace(/^\/+/, "")}`;
}

type ApiErrorBody = {
  message?: string;
  code?: string;
};

export async function mainFetch<T>(
  endpoint: string,
  init: RequestInit = {},
): Promise<T> {
  if (!MAIN_API_BASE) {
    throw new MainHttpError(0, "API 주소가 설정되지 않았습니다.");
  }

  const headers = new Headers(init.headers);
  const method = (init.method ?? "GET").toUpperCase();
  if (method !== "GET" && !headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(joinUrl(endpoint), {
    ...init,
    cache: method === "GET" ? "no-store" : init.cache,
    headers,
  });
  const text = await response.text().catch(() => "");

  if (!response.ok) {
    let message = text || `HTTP ${response.status}`;
    let code: string | undefined;
    try {
      const body = JSON.parse(text) as ApiErrorBody;
      if (body.message) message = body.message;
      if (body.code) code = body.code;
    } catch {
      /* plain text */
    }
    throw new MainHttpError(response.status, message, code);
  }

  if (response.status === 204 || !text) return undefined as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}
