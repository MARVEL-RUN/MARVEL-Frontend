export const FAQ_CATEGORIES = ["참가 신청", "결제", "행사 운영", "기념품", "보험"] as const;

export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

export const FAQ_CATEGORY_OPTIONS = FAQ_CATEGORIES.map((value) => ({
  value,
  label: value,
}));

export function isFaqCategory(value: string): value is FaqCategory {
  return (FAQ_CATEGORIES as readonly string[]).includes(value);
}
