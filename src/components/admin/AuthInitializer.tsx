"use client";

import { decodeToken, extractRoles } from "@/lib/admin/jwt";
import { isAdminLoginPath } from "@/lib/admin/nav";
import { adminToken } from "@/lib/admin/token";
import { useAdminAuthStore } from "@/stores";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

function userFromToken(token: string) {
  const decoded = decodeToken(token);
  const roles = extractRoles(decoded);
  const name =
    (typeof decoded?.name === "string" && decoded.name.trim()) ||
    (typeof decoded?.adminName === "string" && decoded.adminName.trim()) ||
    "관리자";

  return {
    id: String(decoded?.sub ?? decoded?.admin_id ?? "admin"),
    account: name,
    role: roles[0] || "SUPER_ADMIN",
    roles: roles.length ? roles : ["SUPER_ADMIN"],
  };
}

export function AuthInitializer() {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, user, updateUser } = useAdminAuthStore();

  useEffect(() => {
    void Promise.resolve(useAdminAuthStore.persist.rehydrate()).then(() => {
      const state = useAdminAuthStore.getState();
      const token = state.accessToken || adminToken.getAccess();
      useAdminAuthStore.setState({
        hasHydrated: true,
        isLoggedIn: Boolean(token),
      });
    });
  }, []);

  useEffect(() => {
    if (isAdminLoginPath(pathname)) return;

    const token = accessToken || adminToken.getAccess();
    if (!token) {
      router.replace("/admin/login");
      return;
    }

    if (!user || user.account === "admin") {
      updateUser(userFromToken(token));
    }
  }, [accessToken, pathname, router, updateUser, user]);

  return null;
}
