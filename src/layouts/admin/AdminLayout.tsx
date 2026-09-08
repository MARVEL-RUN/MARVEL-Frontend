"use client";

import { isAdminLoginPath } from "@/lib/admin/nav";
import { adminToken } from "@/lib/admin/token";
import { useAdminAuthStore } from "@/stores";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminFooter } from "@/components/admin/Footer";
import { AdminHeader } from "@/components/admin/Header";
import { AdminNavigation } from "@/components/admin/Navigation";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { accessToken } = useAdminAuthStore();
  const [mounted, setMounted] = useState(false);
  const loginRoute = isAdminLoginPath(pathname);
  const token = accessToken || (mounted ? adminToken.getAccess() : null);
  const showOverlay = mounted && !loginRoute && !token;

  useEffect(() => {
    setMounted(true);
    document.documentElement.classList.add("admin-mode");
    document.body.classList.add("admin-mode");
    return () => {
      document.documentElement.classList.remove("admin-mode");
      document.body.classList.remove("admin-mode");
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (loginRoute && token) router.replace("/admin");
  }, [loginRoute, mounted, router, token]);

  if (loginRoute) return <>{children}</>;

  return (
    <div className="admin-root" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <AdminHeader />
      <div style={{ paddingTop: 64, flex: 1, display: "flex", flexDirection: "column" }}>
        <AdminNavigation />
        <main className={`admin-main${showOverlay ? " admin-is-blurred" : ""}`}>{children}</main>
        {showOverlay ? (
          <div className="admin-overlay">
            <div className="admin-overlay__box">
              <h2>로그인이 필요합니다</h2>
              <p>관리자 페이지에 접근하려면 로그인해주세요.</p>
              <Link href="/admin/login">로그인하러 가기</Link>
            </div>
          </div>
        ) : null}
      </div>
      <AdminFooter />
    </div>
  );
}
