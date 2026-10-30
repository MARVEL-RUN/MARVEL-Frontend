import { MAIN_ASSETS } from "./assets";

export const EVENT = {
  title: "MARVEL RUN 2026 KOREA",
  tagline: "ASSEMBLE. RUN.",
  lead: "RACE TO A HERO",
  openNoticeDate: "2026. 09. 22. 화요일",
  openNoticeTime: "오후 2시",
  openNoticeAction: "접수 OPEN",
  /* 접수 오픈 — 카운트다운 */
  openAt: "2026-09-22T14:00:00+09:00",
  /* 1차 마감 후 ~ 2차(추가) 접수 전 대기 (KST). 신청 CTA·/register 차단 */
  round2PauseFrom: "2026-10-13T00:00:00+09:00",
  round2OpenAt: "2026-10-14T14:00:00+09:00",
  round2OpenNoticeDate: "2026. 10. 14. 수요일",
  round2OpenNoticeTime: "오후 2시",
  round2OpenNoticeAction: "추가 접수 OPEN",
  /* 2차(추가) 접수 종료 — CTA·/register 마감 안내 (KST) */
  registrationCloseAt: "2026-10-26T17:00:00+09:00",
  closeNoticeDate: "2026. 10. 26. 월요일",
  closeNoticeTime: "오후 5시",
  closeNoticeAction: "접수 마감",
  /* 홈 팝업. nextAt(KST)부터 next. 해당 팝업만 끄려면 next.enabled: false */
  popup: {
    enabled: true,
    id: "extra-registration-2026-v3",
    title: "2026 마블런 추가 접수 안내",
    image: MAIN_ASSETS.popupExtraRegistration,
    href: "",
    nextAt: "2026-10-31T13:00:00+09:00",
    next: {
      enabled: true,
      id: "record-inquiry-2026",
      title: "2026 마블런 기록 조회 안내",
      image: MAIN_ASSETS.popupRecordInquiry,
      href: "https://smartchip.co.kr/",
    },
  },
  dateShort: "2026.10.31 SAT",
  dateLong: "2026년 10월 31일 토요일",
  /* 대회일 YYYYMMDD — 만 나이 컷 */
  raceYmd: "20261031",
  venue: "인제스피디움",
  venueEn: "INJE SPEEDIUM",
  venueAddress: "강원 인제군 기린면 상하답로 130 인제스피디움",
  venueLat: 38.00139,
  venueLng: 128.29194,
  mapUrl: "https://map.kakao.com/link/map/인제스피디움,38.00139,128.29194",
  venueAccess: [
    {
      title: "자가용",
      note: "서울·수도권 기준",
      items: [
        {
          badge: "고속",
          text: "서울양양고속도로 인제IC | 기린면 방면 약 20분",
        },
        {
          badge: "국도",
          text: "44번 국도 기린면 | 상하답로 진입",
        },
      ],
    },
    {
      title: "버스",
      note: "인제시외버스터미널 하차",
      items: [
        {
          badge: "시외",
          text: "동서울 · 춘천 → 인제",
        },
        {
          badge: "택시",
          text: "터미널에서 약 25분",
        },
      ],
    },
    {
      title: "주차",
      kicker: "PARKING",
      items: [
        {
          badge: "주차",
          text: "인제스피디움 주차장",
        },
        {
          badge: "셔틀",
          text: "카카오T 셔틀 승·하차존 | 티켓박스",
        },
        {
          badge: "도보",
          text: "행사장까지 도보 이동",
        },
      ],
    },
  ],
  info: [
    {
      label: "대회일시",
      value: "2026년 10월 31일 토요일",
    },
    {
      label: "대회장소",
      value: "인제스피디움",
      note: "강원 인제군 기린면 상하답로 130 인제스피디움",
    },
    {
      label: "접수일정",
      value: "2026년 9월 22일 화요일 오후 2시",
    },
    {
      label: "부문",
      value: "10km / 5km / 2.3km",
    },
  ],
  stats: [
    { value: "3", unit: "", label: "COURSES" },
    { value: "10.31", unit: "SAT", label: "RACE DAY" },
    { value: "10 / 5 / 2.3", unit: "Km", label: "MISSIONS" },
    { value: "INJE", unit: "", label: "SPEEDIUM" },
  ],
  courses: [
    {
      id: "10k",
      distance: "10 Km",
      code: "FULL CIRCUIT",
      tone: "cyan",
      fee: "70,000원",
      start: "13:30",
      desc: "한계를 넘어 서킷을 완주하는 히어로 레이스",
      map: MAIN_ASSETS.course10k,
      medalTurn: MAIN_ASSETS.medal10kTurn,
      medalBack: MAIN_ASSETS.medal10kBack,
      medalRibbon: MAIN_ASSETS.medal10kRibbon,
      figure: MAIN_ASSETS.venueDoom,
    },
    {
      id: "5k",
      distance: "5 Km",
      code: "ACTION COURSE",
      tone: "red",
      fee: "70,000원",
      childFee: "40,000원",
      start: "14:30",
      desc: "스피드와 재미를 함께 즐기는 액션 레이스",
      map: MAIN_ASSETS.course5k,
      medalTurn: MAIN_ASSETS.medal5kTurn,
      medalBack: MAIN_ASSETS.medal5kBack,
      medalRibbon: MAIN_ASSETS.medal5kRibbon,
      figure: MAIN_ASSETS.venueThor,
    },
    {
      id: "2.3k",
      distance: "2.3 Km",
      code: "FAMILY COURSE",
      tone: "gold",
      fee: "55,000원",
      childFee: "40,000원",
      start: "15:00",
      desc: "어린이 히어로와 함께 달리는 패밀리 레이스",
      map: MAIN_ASSETS.course2_3k,
      medalTurn: MAIN_ASSETS.medal2_3kTurn,
      medalBack: MAIN_ASSETS.medal2_3kBack,
      medalRibbon: MAIN_ASSETS.medal2_3kRibbon,
      figure: MAIN_ASSETS.venueFalcon,
    },
  ],
  timeline: [
    {
      from: "11:00",
      to: "",
      rt: "–",
      program: "행사장 공식 오픈",
      note: "",
      mark: "gate",
    },
    {
      from: "11:00",
      to: "13:00",
      rt: "120′",
      program: "배번호 배부",
      note: "",
    },
    {
      from: "13:00",
      to: "13:15",
      rt: "15′",
      program: "대회 소개",
      note: "",
    },
    {
      from: "13:15",
      to: "13:29",
      rt: "14′",
      program: "10K 스트레칭 및 출발지 이동",
      note: "",
    },
    {
      from: "13:30",
      to: "",
      rt: "–",
      program: "10K 출발",
      note: "",
      mark: "10k",
    },
    {
      from: "14:15",
      to: "14:29",
      rt: "14′",
      program: "5K 스트레칭 및 출발지 이동",
      note: "",
    },
    {
      from: "14:30",
      to: "",
      rt: "–",
      program: "5K 출발",
      note: "",
      mark: "5k",
    },
    {
      from: "14:45",
      to: "14:59",
      rt: "14′",
      program: "2.3K 스트레칭 및 출발지 이동",
      note: "",
    },
    {
      from: "15:00",
      to: "",
      rt: "–",
      program: "2.3K 출발",
      note: "",
      mark: "2.3k",
    },
    {
      from: "",
      to: "15:30",
      rt: "–",
      program: "FINISH",
      note: "전 종목 완주",
    },
    {
      from: "16:00",
      to: "",
      rt: "–",
      program: "귀가 셔틀버스 출발",
      note: "",
    },
    {
      from: "15:30",
      to: "17:00",
      rt: "90′",
      program: "경품 시상식 및 퀴즈 이벤트",
      note: "",
    },
  ],
  timelineDisclaimer:
    "※ 현장 운영 상황에 따라 타임테이블은 변경될 수 있습니다",
  kit: [
    "공식 티셔츠",
    "배번호",
    "피니셔 메달",
    "응원스카프",
  ],
  sponsors: [
    { role: "주최", name: "ONEUNIVERSE STUDIO" },
    { role: "주관", name: "FLUX SONIC" },
  ],
  footerPartners: [
    {
      role: "주최",
      items: [{ key: "host", name: "ONEUNIVERSE STUDIO" }],
    },
    {
      role: "주관",
      items: [
        { key: "organizer", name: "FLUX SONIC" },
        { key: "mfriends", name: "엠프렌즈" },
      ],
    },
    {
      role: "미디어파트너",
      items: [{ key: "highcut", name: "하이컷" }],
    },
    {
      role: "공식 러닝 뮤직 파트너",
      items: [{ key: "melon", name: "멜론" }],
    },
  ],
  sponsorMoreNotice: "※ 위 기념품 이미지는 예시이며, 실제품과 상이할 수 있습니다.",
  sponsorMore: "+??",
  sponsorMoreNote: "스폰서 패키지 추후 공개 예정",
  copyright: "ⓒ2026 MARVEL",
} as const;

export const SITE_URL = "https://marvelrunkorea2026.com";
export const SEO_TITLE = "마블런 2026 인제 MARVEL RUN";
export const OG_TITLE = SEO_TITLE;
export const OG_DESCRIPTION = `마블런 2026, MARVEL RUN, ${EVENT.dateLong}, ${EVENT.venue}`;
