export type DiscountLinkSlug = "inje" | "runnable" | "29cm" | "kream";

export type DiscountLinkEntry = {
  slug: DiscountLinkSlug;
  linkCode: string;
  kicker: string;
  title: string;
  en: string;
  lead?: string;
  extraNotices?: string[];
};

export const DISCOUNT_LINK_ENTRIES: DiscountLinkEntry[] = [
  {
    slug: "inje",
    linkCode: "TEST_INJE",
    kicker: "INJE",
    title: "인제군민 할인 참가신청",
    en: "INJE DISCOUNT",
  },
  {
    slug: "runnable",
    linkCode: "TEST_RUNNABLE",
    kicker: "RUNNABLE",
    title: "러너블 할인 참가신청",
    en: "RUNNABLE DISCOUNT",
  },
  {
    slug: "29cm",
    linkCode: "TEST_29CM",
    kicker: "RUN CREW",
    title: "러닝크루 특별 할인",
    en: "CREW DISCOUNT",
    lead: "5인 이상 러닝크루 단체 전용 할인 접수입니다.",
    extraNotices: [
      "개인 접수는 이 페이지에서 받지 않습니다.",
      "최소 인원 미달 시 결제가 진행되지 않습니다.",
    ],
  },
  {
    slug: "kream",
    linkCode: "TEST_KREAM",
    kicker: "RUN CREW",
    title: "러닝크루 특별 할인",
    en: "CREW DISCOUNT",
    lead: "5인 이상 러닝크루 단체 전용 할인 접수입니다.",
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
