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
  { href: "/faq", label: "FAQ" },
  { href: "/notices", label: "공지사항" },
  { href: "/inquiry", label: "문의사항" },
  { href: "/virtual", label: "버추얼런" },
] as const;

/** 참가신청 CTA */
export const REGISTER_HREF = "/register";

/** 신청조회 — 참가신청 오른쪽 */
export const LOOKUP_HREF = "/lookup";

/** 인스타 — URL 확정 후 채움 */
export const INSTAGRAM_URL = "";

/** 참가신청 UI 오픈. 공식 일정은 9/22 */
export const registrationOpen = true;

/** 퍼블리싱에서 신청 화면을 열어 봄. 배포 빌드에는 넣지 않음. */
export const registerPreview =
  process.env.NEXT_PUBLIC_REGISTER_PREVIEW === "1";

export const registerUiOpen = registrationOpen || registerPreview;
