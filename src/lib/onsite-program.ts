import { MAIN_ASSETS } from "./assets";

export type OnsiteDriveItem = {
  id: string;
  kicker: string;
  title: string;
  lines: readonly string[];
  photo: string;
};

export type OnsiteBoothItem = {
  id: string;
  title: string;
  partner: string;
  body: string;
  photo: string;
  logo?: string;
  /** 검은 로고 PNG — 카드 하단에서 invert */
  logoOnDark?: boolean;
};

/** PPT 카피·자산 SVG 기준 */
export const ONSITE_DRIVE: readonly OnsiteDriveItem[] = [
  {
    id: "leisure-kart",
    kicker: "서킷 위에서 즐기는 짜릿한 레이싱",
    title: "레저카트",
    lines: ["1대당 2인 탑승", "교육 → 탑승 약 20분 소요", "차량 1대당 3만원"],
    photo: MAIN_ASSETS.onsiteDriveLeisureKart,
  },
  {
    id: "offroad",
    kicker: "거친 지형과 장애물을 돌파하는 역동적인 주행 체험",
    title: "오프로드",
    lines: ["최대 3인 동시 참여", "체험시간 20분", "차량 1대당 8만원(인원 추가비 없음)"],
    photo: MAIN_ASSETS.onsiteDriveOffroad,
  },
  {
    id: "drift",
    kicker: "한계를 넘나드는 짜릿한 드리프트",
    title: "드리프트 체험",
    lines: [
      "탑승 15분(준비 포함)",
      "기본 6만원 · 추가 인원 인당 3만원",
      "1인 6만원 / 2인 9만원 / 3인 12만원",
    ],
    photo: MAIN_ASSETS.onsiteDriveDrift,
  },
] as const;

export const ONSITE_BOOTHS: readonly OnsiteBoothItem[] = [
  {
    id: "running-dj",
    title: "공식 러닝 DJ",
    partner: "MSQ RUN CLUB",
    body: "히어로들의 텐션을 끝까지 끌어올려 줄 DJ와 함께 축제를 즐겨 보세요.",
    photo: MAIN_ASSETS.onsiteRunningDjPhoto,
    logo: MAIN_ASSETS.onsiteMsqLogo,
  },
  {
    id: "taping",
    title: "테이핑 부스",
    partner: "움직임컴퍼니",
    body: "전문 스포츠 컨디셔닝팀의 맞춤형 스포츠 테이핑으로 러닝 전·후 컨디션을 챙겨 보세요.",
    photo: MAIN_ASSETS.onsiteTapingPhoto,
    logo: MAIN_ASSETS.onsiteMovementLogo,
    logoOnDark: true,
  },
  {
    id: "tattoo",
    title: "타투 스티커",
    partner: "한국해비타트",
    body: "한국해비타트 타투 스티커로 포인트를 더하고, 즐거운 러닝에 따뜻한 의미를 더해 보세요.",
    photo: MAIN_ASSETS.onsiteTattooPhoto,
  },
  {
    id: "sauna",
    title: "사우나 존",
    partner: "사사사 · SAUNA CREATIVE GROUP",
    body: "「좋은 삶에는 좋은 사우나가 필요하다」는 믿음으로, 누구나 좋은 사우나를 즐길 수 있도록 합니다. 사우나 버스·텐트·콜드플런지 등으로 완주 후 몸과 컨디션을 가볍게 풀어 보세요.",
    photo: MAIN_ASSETS.onsiteSaunaPhoto,
    logo: MAIN_ASSETS.onsiteSasasaLogo,
  },
] as const;
