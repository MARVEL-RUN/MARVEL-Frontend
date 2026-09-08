const ACCESS_KEY = "mrAdminAccessToken";
const REFRESH_KEY = "mrAdminRefreshToken";
const LOGOUT_BROADCAST_KEY = "mrAdminLogoutBroadcast";

let memoryAccess: string | null = null;

export const adminToken = {
  setAccess(token: string | null) {
    memoryAccess = token;
    if (typeof window === "undefined") return;
    if (token) localStorage.setItem(ACCESS_KEY, token);
    else localStorage.removeItem(ACCESS_KEY);
  },

  getAccess(): string | null {
    if (typeof window === "undefined") return memoryAccess;
    return localStorage.getItem(ACCESS_KEY) || memoryAccess;
  },

  setRefresh(token: string | null) {
    if (typeof window === "undefined") return;
    if (token) localStorage.setItem(REFRESH_KEY, token);
    else localStorage.removeItem(REFRESH_KEY);
  },

  getRefresh(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  },

  clear() {
    memoryAccess = null;
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.setItem(LOGOUT_BROADCAST_KEY, String(Date.now()));
  },
};
