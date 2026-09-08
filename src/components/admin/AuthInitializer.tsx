"use client";

import { isAdminLoginPath } from "@/lib/admin/nav";
import { adminToken } from "@/lib/admin/token";
import { useAdminAuthStore } from "@/stores";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthInitializer() {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken, user, updateUser } = useAdminAuthStore();

  useEffect(() => {
    const existing =
      useAdminAuthStore.getState().accessToken || adminToken.getAccess();
    if (existing) {
      useAdminAuthStore.setState({
        hasHydrated: true,
        isLoggedIn: true,
      });
      return;
    }

    void Promise.resolve(useAdminAuthStore.persist.rehydrate()).then(() => {
      const state = useAdminAuthStore.getState();
      useAdminAuthStore.setState({
        hasHydrated: true,
        isLoggedIn: Boolean(state.accessToken || adminToken.getAccess()),
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

    if (!user) {
      updateUser({
        id: "admin",
        account: "admin",
        role: "SUPER_ADMIN",
        roles: ["SUPER_ADMIN"],
      });
    }
  }, [accessToken, pathname, router, updateUser, user]);

  return null;
}
