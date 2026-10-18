import { MAIN_ASSETS } from "@/lib/assets";

export type DiscountLinkSlug = "inje" | "runable" | "29cm" | "kream";

export type DiscountLinkVariant = "standard" | "run-crew";

export type DiscountLinkEntry = {
  slug: DiscountLinkSlug;
  linkCode: string;
  variant: DiscountLinkVariant;
  /** 외부 사이트 배너·유입 표기용 */
  partnerTag?: string;
  partnerLogo?: string;
  /** 검정 로고를 어두운 배경에서 흰색으로 */
  partnerLogoInvert?: boolean;
  kicker: string;
  title: string;
  en: string;
  lead?: string;
  termsTitle?: string;
  termsLead?: string;
  extraNotices?: string[];
};

export const DISCOUNT_LINK_ENTRIES: DiscountLinkEntry[] = [
  {
    slug: "inje",
    linkCode: "TEST_INJE",
    variant: "standard",
    partnerTag: "INJE",
    kicker: "INJE",
    title: "인제군민 할인 참가신청",
    en: "INJE DISCOUNT",
    termsTitle: "인제군민 할인 링크 참가 동의",
    termsLead:
      "할인 링크로 접속하셨습니다. 아래 유의사항·동의 후 할인 조건에 맞게 신청해 주세요.",
  },
  {
    slug: "runable",
    linkCode: "TEST_RUNNABLE",
    variant: "standard",
    partnerTag: "RUNABLE",
    partnerLogo: MAIN_ASSETS.discountRunable,
    kicker: "RUNABLE",
    title: "러너블 할인 참가신청",
    en: "RUNABLE DISCOUNT",
    termsTitle: "러너블 할인 링크 참가 동의",
    termsLead:
      "티켓사 할인 링크로 접속하셨습니다. 단체 할인 조건을 확인한 뒤 신청해 주세요.",
  },
  {
    slug: "29cm",
    linkCode: "TEST_29CM",
    variant: "run-crew",
    partnerTag: "29CM",
    partnerLogo: MAIN_ASSETS.discount29cm,
    partnerLogoInvert: true,
    kicker: "RUN CREW",
    title: "러닝크루 특별 할인",
    en: "CREW DISCOUNT",
    lead: "5인 이상 러닝크루 단체 전용 할인 접수입니다.",
    termsTitle: "러닝크루 특별 할인 이벤트 링크",
    termsLead:
      "29CM에서 연결된 러닝크루 할인 페이지입니다. 단체(5인 이상)만 접수할 수 있습니다.",
    extraNotices: [
      "개인 접수는 이 페이지에서 받지 않습니다.",
      "최소 인원 미달 시 결제가 진행되지 않습니다.",
    ],
  },
  {
    slug: "kream",
    linkCode: "TEST_KREAM",
    variant: "run-crew",
    partnerTag: "KREAM",
    partnerLogo: MAIN_ASSETS.discountKream,
    kicker: "RUN CREW",
    title: "러닝크루 특별 할인",
    en: "CREW DISCOUNT",
    lead: "5인 이상 러닝크루 단체 전용 할인 접수입니다.",
    termsTitle: "러닝크루 특별 할인 이벤트 링크",
    termsLead:
      "KREAM에서 연결된 러닝크루 할인 페이지입니다. 단체(5인 이상)만 접수할 수 있습니다.",
    extraNotices: [
      "개인 접수는 이 페이지에서 받지 않습니다.",
      "최소 인원 미달 시 결제가 진행되지 않습니다.",
    ],
  },
];

const BY_SLUG = new Map(
  DISCOUNT_LINK_ENTRIES.map((entry) => [entry.slug, entry] as const),
);

export function discountLinkEntry(slug: string): DiscountLinkEntry | undefined {
  return BY_SLUG.get(slug as DiscountLinkSlug);
}

export function isDiscountLinkSlug(slug: string): slug is DiscountLinkSlug {
  return BY_SLUG.has(slug as DiscountLinkSlug);
}
