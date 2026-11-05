import type { IndividualRegistrationLookupRequest } from "@/services/main/types";

/** 개인 신청 조회 본인 확인값. 수정 API도 같은 값을 받는다. 로그아웃 때 지운다 */
const STORAGE_KEY = "marvel-run:vr-login";

export type VirtualRunAuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type VirtualRunLoginSession = {
  access: IndividualRegistrationLookupRequest;
  registrationId: string;
  categoryName: string;
  eventCategoryId?: string;
  eventId?: string;
  tokens?: VirtualRunAuthTokens;
};

export function readLoginSession(): VirtualRunLoginSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VirtualRunLoginSession;
    if (!parsed?.access?.name || !parsed.access.phNum || !parsed.access.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeLoginSession(session: VirtualRunLoginSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearLoginSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
