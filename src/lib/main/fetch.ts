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
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(joinUrl(endpoint), { ...init, headers });
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

  return JSON.parse(text) as T;
}
