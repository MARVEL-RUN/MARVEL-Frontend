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

export type VirtualRunTimelineItem = {
  date: string;
  dateTime?: string;
  label: string;
};

export const VIRTUAL_RUN_TIMELINE: VirtualRunTimelineItem[] = [
  {
    date: "11/2",
    dateTime: "2026-11-02",
    label: "개최 공지, 메달·굿즈 공개",
  },
  {
    date: "11/11",
    dateTime: "2026-11-11",
    label: "티켓 오픈 (1·2·3차)",
  },
  {
    date: "11/30",
    dateTime: "2026-11-30",
    label: "키트 배송 시작",
  },
  {
    date: "12/16",
    dateTime: "2026-12-16",
    label: "둠스데이 영화 개봉",
  },
  {
    date: "1/19",
    dateTime: "2027-01-19",
    label: "티켓 마감",
  },
  {
    date: "1/20 ~ 1/25",
    dateTime: "2027-01-20/2027-01-25",
    label: "이벤트 진행 · 1/25 상품 전달",
  },
  {
    date: "1/29",
    dateTime: "2027-01-29",
    label: "행사 종료",
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
