"use client";

import { findAdminNav } from "@/lib/admin/nav";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNavigation() {
  const pathname = usePathname();
  const { item, child } = findAdminNav(pathname);
  const isAdmins = pathname.startsWith("/admin/admins");

  if ((!item && !isAdmins) || pathname === "/admin") return null;

  return (
    <nav className="admin-crumb" aria-label="현재 위치">
      <div className="admin-crumb__inner">
        <Link href="/admin">대시보드</Link>
        <span className="admin-crumb__sep">/</span>
        {isAdmins ? (
          <strong>관리자 관리</strong>
        ) : (
          <>
            <span>{item?.name}</span>
            {child ? (
              <>
                <span className="admin-crumb__sep">/</span>
                <strong>{child.name}</strong>
              </>
            ) : null}
          </>
        )}
      </div>
    </nav>
  );
}
