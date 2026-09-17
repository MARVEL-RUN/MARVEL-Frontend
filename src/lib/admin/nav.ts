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

export const ADMIN_HOME = { name: "운영 홈", href: "/admin" } as const;

export const ADMIN_NAV: AdminNavItem[] = [
  {
    key: "applications",
    name: "참가신청",
    href: "/admin/applications",
    children: [{ name: "신청자관리", href: "/admin/applications" }],
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
    href: "/admin/content/popups",
    children: [
      { name: "팝업", href: "/admin/content/popups" },
      { name: "이용약관", href: "/admin/legal/terms" },
      { name: "개인정보처리방침", href: "/admin/legal/privacy" },
    ],
  },
];

export const ADMIN_SETTINGS: AdminNavItem = {
  key: "settings",
  name: "설정",
  href: "/admin/admins",
  children: [{ name: "관리자 관리", href: "/admin/admins" }],
};

export function findAdminNav(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const groups: AdminNavItem[] = [...ADMIN_NAV, ADMIN_SETTINGS];

  if (path === "/admin") {
    return { item: null, child: null, home: true as const };
  }

  if (path.startsWith("/admin/applications")) {
    const applications = groups.find((nav) => nav.key === "applications") ?? null;
    return {
      item: applications,
      child: applications?.children[0] ?? null,
      home: false as const,
    };
  }

  const item =
    groups.find(
      (nav) =>
        path.startsWith(`/admin/${nav.key}`) ||
        (path.startsWith("/admin/legal") && nav.key === "content") ||
        (path.startsWith("/admin/notices") && nav.key === "boards") ||
        nav.children.some((child) => path.startsWith(child.href)),
    ) ?? null;

  if (!item) return { item: null, child: null, home: false as const };

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

  return { item, child, home: false as const };
}

export function isAdminLoginPath(pathname: string) {
  return pathname.replace(/\/+$/, "") === "/admin/login";
}
