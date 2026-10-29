export const VIRTUAL_RUN_EVENT = {
  title: "MARVEL RUN 2026 버추얼런",
  planLabel: "버추얼런 플랜",
  lead: "러닝이 가능한 전국 원하는 곳 어디서나",
  schedule: "11.11(화) – 1.19(월)",
  scheduleDays: "70일",
  ticketSingle: "1회차 55,000원",
  ticketPackage: "3회차 패키지 110,000원",
  location: "온라인 (전국 어디서나)",
  target: "전 연령",
  content:
    "5K 러닝 기록 인증 · 키트 인증 · 거점 인증 이벤트",
  countdownTarget: "2026-11-11T10:00:00+09:00",
} as const;

export type VirtualRunOverviewRow = { label: string; value: string };

export const VIRTUAL_RUN_OVERVIEW_ROWS: VirtualRunOverviewRow[] = [
  { label: "행사명", value: VIRTUAL_RUN_EVENT.title },
  {
    label: "일정",
    value: `${VIRTUAL_RUN_EVENT.schedule} (${VIRTUAL_RUN_EVENT.scheduleDays})`,
  },
  {
    label: "티켓 요금",
    value: `${VIRTUAL_RUN_EVENT.ticketSingle} / ${VIRTUAL_RUN_EVENT.ticketPackage}`,
  },
  { label: "장소", value: VIRTUAL_RUN_EVENT.location },
  { label: "대상", value: VIRTUAL_RUN_EVENT.target },
  { label: "콘텐츠", value: VIRTUAL_RUN_EVENT.content },
];
