import { mainFetch, mainFetchDetailed, MainHttpError } from "@/lib/main/fetch";
import {
  readLoginSession,
  writeLoginSession,
  clearLoginSession,
  type VirtualRunAuthTokens,
} from "@/lib/virtual-run/login-session";
import type {
  IndividualRegistrationLookupRequest,
  PackageUpgradeOrder,
  RegistrationEntryInput,
} from "./types";

export type ParticipantAuthResult = {
  registrationId: string;
  eventId: string;
  name: string;
  tokens: VirtualRunAuthTokens;
};

function bearer(token: string) {
  const value = token.trim();
  if (!value) return "";
  return /^Bearer\s+/i.test(value) ? value : `Bearer ${value}`;
}

function headerToken(headers: Headers, name: string) {
  const raw = headers.get(name)?.trim() ?? "";
  return raw.replace(/^Bearer\s+/i, "").trim();
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const data = row.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return row;
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asAmount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const amount = Number(value);
    if (Number.isFinite(amount)) return amount;
  }
  return 0;
}

function authFromResponse(data: unknown, headers: Headers): ParticipantAuthResult {
  const row = asRecord(data);
  const accessToken = headerToken(headers, "authorization");
  const refreshToken = headerToken(headers, "refreshToken");
  if (!accessToken || !refreshToken) {
    throw new MainHttpError(200, "로그인 토큰을 받지 못했습니다.");
  }
  return {
    registrationId: asText(row?.registrationId),
    eventId: asText(row?.eventId),
    name: asText(row?.name),
    tokens: { accessToken, refreshToken },
  };
}

function asUpgradeOrder(data: unknown): PackageUpgradeOrder {
  const row = asRecord(data);
  const orderId = asText(row?.orderId);
  const amount = asAmount(row?.amount);
  if (!orderId) throw new MainHttpError(200, "결제 주문번호가 없습니다.");
  return {
    upgradeId: asText(row?.upgradeId),
    targetCategoryId: asText(row?.targetCategoryId),
    targetCategoryName: asText(row?.targetCategoryName),
    paymentId: asText(row?.paymentId),
    orderId,
    orderName: asText(row?.orderName),
    amount,
  };
}

export async function loginParticipant(
  eventId: string,
  body: IndividualRegistrationLookupRequest,
) {
  const { data, headers } = await mainFetchDetailed<unknown>(
    `v1/public/events/${encodeURIComponent(eventId)}/participant-auth/login`,
    { method: "POST", body: JSON.stringify(body) },
  );
  return authFromResponse(data, headers);
}

export async function refreshParticipant(refreshToken: string) {
  const { data, headers } = await mainFetchDetailed<unknown>(
    "v1/public/participant-auth/refresh",
    {
      method: "POST",
      headers: { refreshToken: bearer(refreshToken) },
    },
  );
  return authFromResponse(data, headers);
}

export async function logoutParticipant(accessToken: string) {
  await mainFetch<void>("v1/participant/auth/logout", {
    method: "POST",
    headers: { Authorization: bearer(accessToken) },
  });
}

let refreshLock: Promise<ParticipantAuthResult> | null = null;

function refreshOnce(refreshToken: string) {
  if (!refreshLock) {
    refreshLock = refreshParticipant(refreshToken).finally(() => {
      refreshLock = null;
    });
  }
  return refreshLock;
}

function storeTokens(tokens: VirtualRunAuthTokens, patch?: Partial<ParticipantAuthResult>) {
  const session = readLoginSession();
  if (!session) return;
  writeLoginSession({
    ...session,
    tokens,
    ...(patch?.registrationId ? { registrationId: patch.registrationId } : {}),
  });
}

export async function participantFetch<T>(
  endpoint: string,
  init: RequestInit = {},
  didRefresh = false,
): Promise<T> {
  const session = readLoginSession();
  const accessToken = session?.tokens?.accessToken ?? "";
  if (!accessToken) {
    throw new MainHttpError(401, "로그인이 필요합니다.");
  }
  try {
    return await mainFetch<T>(endpoint, {
      ...init,
      headers: {
        ...Object.fromEntries(new Headers(init.headers).entries()),
        Authorization: bearer(accessToken),
      },
    });
  } catch (error) {
    if (
      !(error instanceof MainHttpError) ||
      error.status !== 401 ||
      didRefresh ||
      error.code === "BLACKLISTED_ACCESS_TOKEN"
    ) {
      if (error instanceof MainHttpError && error.code === "BLACKLISTED_ACCESS_TOKEN") {
        clearLoginSession();
      }
      throw error;
    }
    const refreshToken = session?.tokens?.refreshToken ?? "";
    if (!refreshToken) {
      clearLoginSession();
      throw error;
    }
    try {
      const next = await refreshOnce(refreshToken);
      storeTokens(next.tokens, next);
      return await participantFetch<T>(endpoint, init, true);
    } catch (refreshError) {
      clearLoginSession();
      throw refreshError;
    }
  }
}

export async function logoutParticipantSession() {
  const accessToken = readLoginSession()?.tokens?.accessToken ?? "";
  try {
    if (accessToken) await logoutParticipant(accessToken);
  } catch {
    /* 서버 로그아웃이 실패해도 이 브라우저 세션은 지운다 */
  }
  clearLoginSession();
}

export async function requestPackageUpgrade(entries: RegistrationEntryInput[]) {
  return participantFetch<unknown>("v1/participant/registrations/me/upgrade", {
    method: "POST",
    body: JSON.stringify({ entries }),
  }).then(asUpgradeOrder);
}

export async function reopenPackageUpgradePayment() {
  return participantFetch<unknown>("v1/participant/registrations/me/upgrade/payment", {
    method: "POST",
  }).then(asUpgradeOrder);
}

export async function cancelPackageUpgrade() {
  await participantFetch<void>("v1/participant/registrations/me/upgrade", {
    method: "DELETE",
  });
}
