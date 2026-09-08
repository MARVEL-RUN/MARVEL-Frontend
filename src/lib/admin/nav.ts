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
    key: "boards",
    name: "게시판",
    href: "/admin/boards/notice",
    children: [
      { name: "공지사항", href: "/admin/boards/notice" },
      { name: "문의사항", href: "/admin/boards/inquiry" },
      { name: "FAQ", href: "/admin/boards/faq" },
    ],
  },
  {
    key: "content",
    name: "콘텐츠",
    href: "/admin/content/sponsors",
    children: [
      { name: "스폰서", href: "/admin/content/sponsors" },
      { name: "이용약관", href: "/admin/legal/terms" },
      { name: "개인정보처리방침", href: "/admin/legal/privacy" },
    ],
  },
];

export function findAdminNav(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const item =
    ADMIN_NAV.find(
      (nav) =>
        path.startsWith(`/admin/${nav.key}`) ||
    (path.startsWith("/admin/legal") && nav.key === "content") ||
    (path.startsWith("/admin/notices") && nav.key === "boards") ||
    nav.children.some((child) => path.startsWith(child.href)),
    ) ?? null;

  if (!item) return { item: null, child: null };

  const child =
    item.children.find((c) => path === c.href) ??
    item.children
      .slice()
      .sort((a, b) => b.href.length - a.href.length)
      .find((c) => path.startsWith(c.href)) ??
    (path.startsWith("/admin/legal/privacy")
      ? item.children.find((c) => c.href.includes("privacy"))
      : path.startsWith("/admin/legal/terms")
        ? item.children.find((c) => c.href.includes("terms"))
        : path.startsWith("/admin/notices")
          ? item.children[0]
          : item.children[0]);

  return { item, child };
}

export function isAdminLoginPath(pathname: string) {
  return pathname.replace(/\/+$/, "") === "/admin/login";
}
