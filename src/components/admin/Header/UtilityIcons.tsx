"use client";

import { adminAuthService } from "@/services/admin/auth";
import { adminToken } from "@/lib/admin/token";
import { useAdminAuthStore } from "@/stores";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function UtilityIcons() {
  const router = useRouter();
  const { isLoggedIn, user, accessToken, hasHydrated } = useAdminAuthStore();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const loggedIn =
    (hasHydrated && (isLoggedIn || Boolean(accessToken))) ||
    (mounted && Boolean(adminToken.getAccess()));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const logout = async () => {
    await adminAuthService.logout();
    setOpen(false);
    router.replace("/admin/login");
  };

  if (!loggedIn) {
    return (
      <Link href="/admin/login" className="admin-user__btn">
        로그인
      </Link>
    );
  }

  return (
    <div className="admin-user" ref={boxRef}>
      <button type="button" className="admin-user__btn" onClick={() => setOpen((v) => !v)}>
        {user?.account || "관리자"}님
      </button>
      {open ? (
        <div className="admin-user__menu">
          <div className="admin-user__who">{user?.role || "SUPER_ADMIN"}</div>
          <Link href="/admin/admins" onClick={() => setOpen(false)}>
            관리자 관리
          </Link>
          <button type="button" onClick={logout}>
            로그아웃
          </button>
        </div>
      ) : null}
    </div>
  );
}
