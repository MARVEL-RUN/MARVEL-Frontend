export type AppMode = "coming-soon" | "main";

/** `coming-soon` | `main` — NEXT_PUBLIC_APP_MODE로 전환 */
export const APP_MODE: AppMode =
  process.env.NEXT_PUBLIC_APP_MODE === "main" ? "main" : "coming-soon";

export const isComingSoon = APP_MODE === "coming-soon";
export const isMain = APP_MODE === "main";

/** 헤더 내비 (본페이지) */
export const NAV_ITEMS = [
  { href: "/guide", label: "대회안내" },
  { href: "/directions", label: "오시는길" },
  { href: "/precautions", label: "대회유의사항" },
  { href: "/lookup", label: "신청조회" },
  { href: "/notices", label: "공지사항" },
] as const;

/** 티켓 예매 CTA */
export const TICKET_HREF = "/register";

/** 인스타 — URL 확정 후 채움 */
export const INSTAGRAM_URL = "";

/** 9/22 접수 오픈 전까지 false */
export const registrationOpen = false;
