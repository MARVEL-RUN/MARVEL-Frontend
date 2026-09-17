import { ADMIN_API_BASE, hasAdminApi } from "@/lib/admin/config";
import { decodeToken, extractRoles } from "@/lib/admin/jwt";
import { adminToken } from "@/lib/admin/token";
import { useAdminAuthStore } from "@/stores";
import type { AdminUser } from "@/types/admin/admin";

type LoginInput = {
  account: string;
  password: string;
};

type LoginResult = {
  accessToken: string;
  refreshToken?: string;
  adminName?: string;
};

function adminUrl(path: string) {
  return `${ADMIN_API_BASE}/${path.replace(/^\/+/, "")}`;
}

function readHeaderToken(response: Response, name: string) {
  const raw = response.headers.get(name);
  if (!raw) return undefined;
  return raw.replace(/^Bearer\s+/i, "").trim() || undefined;
}

function pickTokens(response: Response, body: Record<string, unknown> | null) {
  const data = (body?.data as Record<string, unknown> | undefined) ?? body ?? {};

  const accessToken =
    readHeaderToken(response, "authorization") ||
    (typeof data.accessToken === "string" ? data.accessToken : undefined);

  const refreshToken =
    readHeaderToken(response, "refreshtoken") ||
    readHeaderToken(response, "refreshToken") ||
    (typeof data.refreshToken === "string" ? data.refreshToken : undefined);

  const adminName =
    typeof data.adminName === "string" ? data.adminName : undefined;

  return { accessToken, refreshToken, adminName };
}

async function readJsonBody(response: Response) {
  return (await response.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
}

function applySession(result: LoginResult, account: string) {
  adminToken.setAccess(result.accessToken);
  adminToken.setRefresh(result.refreshToken ?? null);

  const decoded = decodeToken(result.accessToken);
  const roles = extractRoles(decoded);
  const jwtName = typeof decoded?.name === "string" ? decoded.name : "";
  const displayName = result.adminName || jwtName || account;
  const user: AdminUser = {
    id: String(decoded?.sub ?? decoded?.admin_id ?? account),
    account: displayName,
    role: roles[0] || "SUPER_ADMIN",
    roles: roles.length ? roles : ["SUPER_ADMIN"],
  };

  useAdminAuthStore.getState().login(result, user);
}

async function loginWithApi(input: LoginInput): Promise<LoginResult> {
  const response = await fetch(adminUrl("v1/admin/public/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      loginId: input.account,
      password: input.password,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "로그인에 실패했습니다.");
  }

  const body = await readJsonBody(response);
  const { accessToken, refreshToken, adminName } = pickTokens(response, body);

  if (!accessToken) {
    throw new Error("액세스 토큰을 받지 못했습니다.");
  }

  return { accessToken, refreshToken, adminName };
}

async function refreshWithApi(): Promise<LoginResult> {
  const refresh = adminToken.getRefresh();
  if (!refresh) throw new Error("리프레시 토큰이 없습니다.");

  const response = await fetch(adminUrl("v1/admin/public/refresh"), {
    method: "POST",
    headers: {
      Accept: "application/json",
      refreshToken: refresh,
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "세션 갱신에 실패했습니다.");
  }

  const body = await readJsonBody(response);
  const { accessToken, refreshToken, adminName } = pickTokens(response, body);

  if (!accessToken) {
    throw new Error("액세스 토큰을 받지 못했습니다.");
  }

  return {
    accessToken,
    refreshToken: refreshToken ?? refresh,
    adminName,
  };
}

async function logoutWithApi() {
  const access = adminToken.getAccess();
  const refresh = adminToken.getRefresh();
  if (!access && !refresh) return;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (access) headers.Authorization = `Bearer ${access}`;
  if (refresh) headers.refreshToken = refresh;

  await fetch(adminUrl("v1/admin/logout"), {
    method: "POST",
    headers,
  });
}

function loginLocal(): LoginResult {
  return { accessToken: `mr-dev-${Date.now()}`, adminName: "local-admin" };
}

export const adminAuthService = {
  async login(input: LoginInput) {
    const result = hasAdminApi ? await loginWithApi(input) : loginLocal();
    applySession(result, input.account);
    return result;
  },

  async refresh() {
    if (!hasAdminApi) return null;
    const account = useAdminAuthStore.getState().user?.account ?? "admin";
    const result = await refreshWithApi();
    applySession(result, account);
    return result;
  },

  async logout() {
    if (hasAdminApi) {
      try {
        await logoutWithApi();
      } catch {
        /* 로컬 세션은 무조건 정리 */
      }
    }
    adminToken.clear();
    useAdminAuthStore.getState().logout();
  },
};
