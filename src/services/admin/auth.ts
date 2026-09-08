import { ADMIN_API_BASE, hasAdminApi } from "@/lib/admin/config";
import { adminFetch } from "@/lib/admin/fetch";
import { decodeToken, extractRoles } from "@/lib/admin/jwt";
import { adminToken } from "@/lib/admin/token";
import { useAdminAuthStore } from "@/stores";
import type { AdminUser } from "@/types/admin";

type LoginInput = {
  account: string;
  password: string;
};

type LoginResult = {
  accessToken: string;
  refreshToken?: string;
};

function applySession(result: LoginResult, account: string) {
  adminToken.setAccess(result.accessToken);
  adminToken.setRefresh(result.refreshToken ?? null);

  const decoded = decodeToken(result.accessToken);
  const roles = extractRoles(decoded);
  const user: AdminUser = {
    id: String(decoded?.sub ?? decoded?.admin_id ?? account),
    account: String(decoded?.name ?? account),
    role: roles[0] || "SUPER_ADMIN",
    roles: roles.length ? roles : ["SUPER_ADMIN"],
  };

  useAdminAuthStore.getState().login(result, user);
}

async function loginWithApi(input: LoginInput): Promise<LoginResult> {
  const response = await fetch(
    `${ADMIN_API_BASE}/api/v1/admin/login`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(input),
    },
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "로그인에 실패했습니다.");
  }

  let accessToken =
    response.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || undefined;
  let refreshToken =
    response.headers.get("refreshtoken")?.replace(/^Bearer\s+/i, "") || undefined;

  const body = (await response.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  if (body) {
    const data = (body.data as Record<string, unknown> | undefined) ?? body;
    accessToken =
      accessToken ||
      (typeof data.accessToken === "string" ? data.accessToken : undefined);
    refreshToken =
      refreshToken ||
      (typeof data.refreshToken === "string" ? data.refreshToken : undefined);
  }

  if (!accessToken) throw new Error("액세스 토큰을 받지 못했습니다.");
  return { accessToken, refreshToken };
}

function loginLocal(): LoginResult {
  return { accessToken: `mr-dev-${Date.now()}` };
}

export const adminAuthService = {
  async login(input: LoginInput) {
    const result = hasAdminApi ? await loginWithApi(input) : loginLocal();
    applySession(result, input.account);
    return result;
  },

  async logout() {
    if (hasAdminApi) {
      try {
        await adminFetch("/api/v1/admin/logout", { method: "POST" });
      } catch {
        /* 로컬 세션은 무조건 정리 */
      }
    }
    adminToken.clear();
    useAdminAuthStore.getState().logout();
  },
};
