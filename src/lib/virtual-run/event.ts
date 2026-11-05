export const VIRTUAL_RUN_EVENT = {
  title: "MARVEL 버추얼런 2026",
  planLabel: "버추얼런",
  lead: "러닝이 가능한 전국 원하는 곳 어디서나",
  schedule: "2026.11.11(화) – 2027.1.19(월)",
  scheduleDays: "70일",
  ticketSingle: "싱글 패키지 40,000원 (3종 테마 중 선택)",
  ticketPackage: "어셈블 패키지 80,000원 (3종 테마 전체 패키지)",
  location: "온라인 (전국 어디서나)",
  target: "전 연령",
  content:
    "5K 러닝 기록 인증 · 키트 인증 · 거점 인증 이벤트",
  countdownTarget: "2026-11-11T10:00:00+09:00",
} as const;

export const VIRTUAL_RUN_OG_TITLE = "2026 마블 버추얼런 MARVEL VIRTUAL RUN";
export const VIRTUAL_RUN_OG_DESCRIPTION =
  "전국 어디서나 달리는 마블 버추얼런";

export const VIRTUAL_RUN_EVENT_TABS = [
  { href: "#overview", label: "행사 개요" },
  { href: "#schedule", label: "운영 일정" },
] as const;

export type VirtualRunTimelineRow = {
  from: string;
  to: string;
  program: string;
  note: string;
  key?: boolean;
};

export const VIRTUAL_RUN_TIMELINE: VirtualRunTimelineRow[] = [
  { from: "2026/11/2", to: "", program: "개최 공지, 메달·굿즈 공개", note: "" },
  { from: "2026/11/11", to: "", program: "티켓 오픈 (1·2·3차)", note: "", key: true },
  { from: "2026/11/27", to: "", program: "인증 가이드 · 마이페이지 인증 기능", note: "키트 배송 전" },
  { from: "2026/11/30", to: "", program: "키트 배송 시작", note: "", key: true },
  { from: "2026/12/16", to: "", program: "둠스데이 영화 개봉", note: "" },
  { from: "2027/1/19", to: "", program: "티켓 마감", note: "" },
  { from: "2027/1/20", to: "2027/1/25", program: "이벤트 진행", note: "2027/1/25 상품 전달" },
  { from: "2027/1/29", to: "", program: "행사 종료", note: "" },
];

export const VIRTUAL_RUN_TIMELINE_DISCLAIMER =
  "※ 러닝·키트 인증은 2026/11/30(일)부터 2027/1/19(월)까지 제출 가능합니다. 일정은 협의·운영 상황에 따라 변경될 수 있습니다.";

export type VirtualRunOverviewRow = { label: string; value: string; note?: string };

export const VIRTUAL_RUN_OVERVIEW_ROWS: VirtualRunOverviewRow[] = [
  { label: "행사명", value: VIRTUAL_RUN_EVENT.title },
  {
    label: "일정",
    value: `${VIRTUAL_RUN_EVENT.schedule} (${VIRTUAL_RUN_EVENT.scheduleDays})`,
  },
  { label: "장소", value: VIRTUAL_RUN_EVENT.location },
  { label: "대상", value: VIRTUAL_RUN_EVENT.target },
  {
    label: "티켓 요금",
    value: `${VIRTUAL_RUN_EVENT.ticketSingle} / ${VIRTUAL_RUN_EVENT.ticketPackage}`,
  },
  {
    label: "추가 구매 옵션",
    value: "패키지 테마 : 어벤져스 / 엑스맨 / 판타스틱 4",
  },
  {
    label: "참가 방법",
    value: "티켓 구매 → 키트 수령 → 회차별 5K 러닝 인증",
    note: "키트 인증·거점 이벤트(협업 확정 시)는 선택 참여입니다.",
  },
  { label: "콘텐츠", value: VIRTUAL_RUN_EVENT.content },
  {
    label: "완주 리워드",
    value: "회차별 5K 인증 완료 시 디지털 완주증 발급",
    note: "메달·실물 리워드는 마이페이지에서 확인할 수 있습니다.",
  },
];
