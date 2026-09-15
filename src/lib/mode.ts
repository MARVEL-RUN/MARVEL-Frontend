export type AppMode = "coming-soon" | "main";

/** `coming-soon` | `main` — NEXT_PUBLIC_APP_MODE로 전환 */
export const APP_MODE: AppMode =
  process.env.NEXT_PUBLIC_APP_MODE === "main" ? "main" : "coming-soon";

export const isComingSoon = APP_MODE === "coming-soon";
export const isMain = APP_MODE === "main";

/** 헤더 내비 (본페이지) */
export const GUIDE_SECTIONS = [
  { href: "/guide#overview", label: "한눈에 보기" },
  { href: "/guide#timeline", label: "타임라인" },
  { href: "/guide#course", label: "코스" },
] as const;

export const GUIDE_TABS = GUIDE_SECTIONS.filter((item) => item.href !== "/guide#overview");

export const KIT_HREF = "/kit";
export const PACKAGE_HREF = "/package";

export const BOARD_SECTIONS = [
  { href: "/faq", label: "FAQ" },
  { href: "/notices", label: "공지사항" },
] as const;

export const BOARD_HREF = "/notices";

export const NAV_ITEMS = [
  { href: "/guide", label: "대회안내", children: GUIDE_SECTIONS },
  { href: KIT_HREF, label: "기념품 안내" },
  { href: PACKAGE_HREF, label: "PACKAGE" },
  { href: "/directions", label: "오시는길" },
  { href: BOARD_HREF, label: "게시판", children: BOARD_SECTIONS },
  { href: "/inquiry", label: "문의사항" },
  { href: "/virtual", label: "버추얼런" },
] as const;

/** 참가신청 CTA */
export const REGISTER_HREF = "/register";

/** 신청조회 — 참가신청 오른쪽. 협찬문의는 그 오른쪽 mailto */
export const LOOKUP_HREF = "/lookup";

/** 인스타 — URL 확정 후 채움 */
export const INSTAGRAM_URL = "";

/** 참가신청 UI 오픈. 공식 일정은 9/22 */
export const registrationOpen = true;

/** 퍼블리싱에서 신청 화면을 열어 봄. 배포 빌드에는 넣지 않음. */
export const registerPreview =
  process.env.NEXT_PUBLIC_REGISTER_PREVIEW === "1";

export const registerUiOpen = registrationOpen || registerPreview;
