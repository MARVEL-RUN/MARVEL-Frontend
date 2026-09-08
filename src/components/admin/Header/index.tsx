"use client";

import { ADMIN_HOME, findAdminNav } from "@/lib/admin/nav";
import { Menu, PanelLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtilityIcons } from "./UtilityIcons";

type Props = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
};

export function AdminHeader({ collapsed, onToggleCollapse, onOpenMobile }: Props) {
  const pathname = usePathname();
  const { item, child, home } = findAdminNav(pathname);
  const here = home ? ADMIN_HOME.name : (child?.name ?? item?.name ?? "관리자");

  return (
    <header className="admin-header">
      <div className="admin-header__bar">
        <button
          type="button"
          className="admin-header__iconbtn admin-header__iconbtn--mobile"
          aria-label="메뉴 열기"
          onClick={onOpenMobile}
        >
          <Menu size={18} />
        </button>
        <button
          type="button"
          className="admin-header__iconbtn admin-header__iconbtn--desk"
          aria-label={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
          onClick={onToggleCollapse}
        >
          <PanelLeft size={18} />
        </button>

        <nav className="admin-header__crumb" aria-label="현재 위치">
          <Link href={ADMIN_HOME.href}>홈</Link>
          {item ? (
            <>
              <span className="admin-header__sep">›</span>
              <span>{item.name}</span>
            </>
          ) : null}
          {child ? (
            <>
              <span className="admin-header__sep">›</span>
              <strong>{child.name}</strong>
            </>
          ) : home ? (
            <>
              <span className="admin-header__sep">›</span>
              <strong>{ADMIN_HOME.name}</strong>
            </>
          ) : null}
        </nav>

        <strong className="admin-header__now">{here}</strong>

        <div className="admin-header__right">
          <Link href="/" className="admin-header__site" target="_blank" rel="noreferrer">
            사이트 바로가기
          </Link>
          <UtilityIcons />
        </div>
      </div>
    </header>
  );
}
