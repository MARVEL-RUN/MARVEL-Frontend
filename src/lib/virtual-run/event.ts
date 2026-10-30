export const VIRTUAL_RUN_EVENT = {
  title: "MARVEL RUN 2026 버추얼런",
  planLabel: "버추얼런",
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

export type VirtualRunTimelineRow = {
  from: string;
  to: string;
  rt: string;
  program: string;
  note: string;
};

export const VIRTUAL_RUN_TIMELINE: VirtualRunTimelineRow[] = [
  {
    from: "11/2",
    to: "",
    rt: "–",
    program: "개최 공지, 메달·굿즈 공개",
    note: "",
  },
  {
    from: "11/11",
    to: "",
    rt: "–",
    program: "티켓 오픈 (1·2·3차)",
    note: "",
  },
  {
    from: "11/30",
    to: "",
    rt: "–",
    program: "키트 배송 시작",
    note: "",
  },
  {
    from: "12/16",
    to: "",
    rt: "–",
    program: "둠스데이 영화 개봉",
    note: "",
  },
  {
    from: "1/19",
    to: "",
    rt: "–",
    program: "티켓 마감",
    note: "",
  },
  {
    from: "1/20",
    to: "1/25",
    rt: "–",
    program: "이벤트 진행",
    note: "1/25 상품 전달",
  },
  {
    from: "1/29",
    to: "",
    rt: "–",
    program: "행사 종료",
    note: "",
  },
];

export const VIRTUAL_RUN_TIMELINE_DISCLAIMER =
  "※ 러닝·키트 인증은 11/30(일)부터 1/19(월)까지 제출 가능합니다. 일정은 협의·운영 상황에 따라 변경될 수 있습니다.";

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
