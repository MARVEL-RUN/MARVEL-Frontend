"use client";

import {
  ADMIN_HOME,
  ADMIN_NAV,
  ADMIN_SETTINGS,
  findAdminNav,
} from "@/lib/admin/nav";
import { MAIN_ASSETS } from "@/lib/assets";
import {
  ChevronDown,
  ClipboardList,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const GROUP_ICON = {
  applications: Users,
  boards: ClipboardList,
  content: FileText,
  settings: Settings,
} as const;

const CHILD_ICON: Record<string, typeof FileText> = {
  "/admin/applications/individual": Users,
  "/admin/applications/group": Users,
  "/admin/boards/notice": ClipboardList,
  "/admin/boards/inquiry": MessageSquare,
  "/admin/boards/faq": HelpCircle,
  "/admin/content/sponsors": ImageIcon,
  "/admin/legal/terms": FileText,
  "/admin/legal/privacy": Shield,
  "/admin/admins": Settings,
};

type Props = {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
};

export function AdminSidebar({ collapsed, mobileOpen, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { item } = findAdminNav(pathname);
  const groups = [...ADMIN_NAV, ADMIN_SETTINGS];
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (item) setOpenKeys((prev) => ({ ...prev, [item.key]: true }));
  }, [item]);

  const isHome = pathname.replace(/\/+$/, "") === "/admin";

  return (
    <>
      {mobileOpen ? <button type="button" className="admin-sidebar__dim" onClick={onClose} aria-label="메뉴 닫기" /> : null}
      <aside className={`admin-sidebar${collapsed ? " is-collapsed" : ""}${mobileOpen ? " is-open" : ""}`}>
        <Link href={ADMIN_HOME.href} className="admin-sidebar__brand" onClick={onClose} aria-label="MARVEL RUN 관리자">
          <span className="admin-sidebar__mark">M</span>
          <Image
            src={MAIN_ASSETS.logo}
            alt="MARVEL RUN"
            width={1257}
            height={98}
            className="admin-sidebar__logo"
            priority
          />
          <span className="admin-sidebar__label">관리자</span>
        </Link>

        <nav className="admin-sidebar__nav" aria-label="관리자 메뉴">
          <Link
            href={ADMIN_HOME.href}
            className={`admin-side-link${isHome ? " is-active" : ""}`}
            onClick={onClose}
            title={ADMIN_HOME.name}
          >
            <LayoutDashboard size={16} />
            <span>{ADMIN_HOME.name}</span>
          </Link>

          {groups.map((group) => {
            const Icon = GROUP_ICON[group.key as keyof typeof GROUP_ICON] ?? FileText;
            const open = collapsed ? item?.key === group.key : Boolean(openKeys[group.key]);
            const groupOn = item?.key === group.key;

            return (
              <div key={group.key} className={`admin-side-group${groupOn ? " is-on" : ""}`}>
                <button
                  type="button"
                  className="admin-side-group__btn"
                  onClick={() => {
                    if (collapsed) {
                      router.push(group.href);
                      onClose();
                      return;
                    }
                    setOpenKeys((prev) => ({ ...prev, [group.key]: !prev[group.key] }));
                  }}
                  title={group.name}
                >
                  <Icon size={16} />
                  <span>{group.name}</span>
                  <ChevronDown size={14} className={`admin-side-group__chev${open ? " is-open" : ""}`} />
                </button>
                <div className={`admin-side-group__list${open ? " is-open" : ""}`}>
                  {group.children.map((child) => {
                    const ChildIcon = CHILD_ICON[child.href] ?? FileText;
                    const active = pathname.startsWith(child.href);
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`admin-side-link admin-side-link--sub${active ? " is-active" : ""}`}
                        onClick={onClose}
                        title={child.name}
                      >
                        <ChildIcon size={15} />
                        <span>{child.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
