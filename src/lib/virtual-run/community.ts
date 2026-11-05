/** 헤더 커뮤니티 드롭다운 — mode.ts BOARD_SECTIONS 와 동일 역할 */
export const VIRTUAL_RUN_BOARD_SECTIONS = [
  { href: "/faq", label: "FAQ" },
  { href: "/notices", label: "공지사항" },
  { href: "/inquiry", label: "문의사항" },
] as const;

export const VIRTUAL_RUN_BOARD_HREF = "/notices";

export type VirtualRunCommunityBannerProps = {
  kicker: string;
  title: string;
  en: string;
};

export type VirtualRunCommunityBoardOptions = {
  eventId?: string;
  toHref?: (path: string) => string;
};

export function communityHref(path: string, toHref?: (path: string) => string) {
  return toHref ? toHref(path) : path;
}
