import { MAIN_ASSETS } from "./assets";

export type OnsiteTone = "red" | "gold" | "cyan" | "violet";

export type OnsiteSpec = {
  label: string;
  value: string;
  note?: string;
  price?: boolean;
};

export type OnsiteDriveItem = {
  id: string;
  tone: OnsiteTone;
  en: string;
  title: string;
  lead: string;
  photo: string;
  specs: readonly OnsiteSpec[];
  tiers?: readonly { people: string; price: string }[];
};

export type OnsiteBoothItem = {
  id: string;
  tone: OnsiteTone;
  en: string;
  title: string;
  tagline: string;
  partner: string;
  about?: string;
  body: string;
  photo: string;
  /* 열린 와이드 컷에서 사진 초점 (object-position) */
  focus?: string;
  logo?: { src: string; width: number; height: number };
};

export const ONSITE_DRIVE: readonly OnsiteDriveItem[] = [
  {
    id: "leisure-kart",
    tone: "red",
    en: "LEISURE KART",
    title: "레저카트",
    lead: "서킷 위에서 즐기는 짜릿한 레이싱",
    photo: MAIN_ASSETS.onsiteDriveLeisureKart,
    specs: [
      { label: "탑승", value: "1대당 2인" },
      { label: "소요시간", value: "약 20분", note: "교육 후 탑승" },
      { label: "요금", value: "차량 1대당 3만원", price: true },
    ],
  },
  {
    id: "offroad",
    tone: "cyan",
    en: "OFF-ROAD",
    title: "오프로드",
    lead: "거친 지형과 장애물을 돌파하는 역동적인 주행 체험",
    photo: MAIN_ASSETS.onsiteDriveOffroad,
    specs: [
      { label: "탑승", value: "최대 3인 동시 참여" },
      { label: "체험시간", value: "20분" },
      {
        label: "요금",
        value: "차량 1대당 8만원",
        note: "인원 추가비 없음",
        price: true,
      },
    ],
  },
  {
    id: "drift",
    tone: "gold",
    en: "DRIFT",
    title: "드리프트 체험",
    lead: "한계를 넘나드는 짜릿한 드리프트",
    photo: MAIN_ASSETS.onsiteDriveDrift,
    specs: [
      { label: "탑승시간", value: "15분", note: "준비 과정 포함" },
      {
        label: "요금",
        value: "기본 6만원",
        note: "인원 추가 시 인당 3만원",
        price: true,
      },
    ],
    tiers: [
      { people: "1인", price: "6만원" },
      { people: "2인", price: "9만원" },
      { people: "3인", price: "12만원" },
    ],
  },
] as const;

export const ONSITE_BOOTHS: readonly OnsiteBoothItem[] = [
  {
    id: "running-dj",
    tone: "violet",
    en: "RUNNING DJ",
    title: "공식 러닝 DJ",
    tagline: "음악과 함께 달리는 러닝크루",
    partner: "모스키토 런클럽",
    body: "히어로들의 텐션을 끝까지 끌어올려줄 DJ '뮤직방구차'와 함께 서킷을 달려보세요!",
    photo: MAIN_ASSETS.onsiteRunningDjPhoto,
    logo: { src: MAIN_ASSETS.onsiteMsqLogo, width: 2445, height: 585 },
  },
  {
    id: "taping",
    tone: "red",
    en: "TAPING BOOTH",
    title: "테이핑 부스",
    tagline: "전문 스포츠 컨디셔닝",
    partner: "움직임컴퍼니",
    body: "전문 스포츠 컨디셔닝팀의 맞춤형 스포츠 테이핑으로 러닝 전 후 컨디션까지 탄탄하게 챙겨보세요!",
    photo: MAIN_ASSETS.onsiteTapingPhoto,
    logo: { src: MAIN_ASSETS.onsiteMovementLogo, width: 2721, height: 648 },
  },
  {
    id: "tattoo",
    tone: "cyan",
    en: "TATTOO STICKER",
    title: "타투 스티커",
    tagline: "모든 사람에게 안락한 집이 있는 세상",
    partner: "한국해비타트",
    body: "한국해비타트만의 타투 스티커로 포인트를 더하고 즐거운 러닝에 따뜻한 의미까지 함께해 보세요!",
    photo: MAIN_ASSETS.onsiteTattooPhoto,
    logo: { src: MAIN_ASSETS.onsiteHabitatLogo, width: 820, height: 333 },
  },
  {
    id: "sauna",
    tone: "gold",
    en: "SAUNA ZONE",
    title: "사우나 존",
    tagline: "좋은 삶에는 좋은 사우나가 필요하다.",
    partner: "사사사(SASASA)",
    about: "사우나 문화를 만드는 브랜드, SAUNA CREATIVE GROUP",
    body: "사우나 텐트부터 짜릿한 콜드 플런지까지, 완주 후 몸과 컨디션을 가볍게 풀어보세요.",
    photo: MAIN_ASSETS.onsiteSaunaPhoto,
    focus: "30% 90%",
    logo: { src: MAIN_ASSETS.onsiteSasasaLogo, width: 1235, height: 270 },
  },
] as const;
