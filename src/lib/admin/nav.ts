export type AdminNavChild = {
  name: string;
  href: string;
};

export type AdminNavItem = {
  key: string;
  name: string;
  href: string;
  children: AdminNavChild[];
};

export const ADMIN_NAV: AdminNavItem[] = [
  {
    key: "applications",
    name: "참가신청",
    href: "/admin/applications/individual",
    children: [
      { name: "개인 신청", href: "/admin/applications/individual" },
      { name: "단체 신청", href: "/admin/applications/group" },
    ],
  },
  {
    key: "notices",
    name: "게시판",
    href: "/admin/notices",
    children: [{ name: "공지사항", href: "/admin/notices" }],
  },
  {
    key: "content",
    name: "콘텐츠",
    href: "/admin/content/sponsors",
    children: [{ name: "스폰서", href: "/admin/content/sponsors" }],
  },
];

export function findAdminNav(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const item =
    ADMIN_NAV.find(
      (nav) =>
        path.startsWith(`/admin/${nav.key}`) ||
        nav.children.some((child) => path.startsWith(child.href)),
    ) ?? null;

  if (!item) return { item: null, child: null };

  const child =
    item.children.find((c) => path === c.href) ??
    item.children
      .slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find((c) => path.startsWith(c.href)) ??
    item.children[0];

  return { item, child };
}

export function isAdminLoginPath(pathname: string) {
  return pathname.replace(/\/+$/, "") === "/admin/login";
}
