export const NOTICE_CATEGORIES = ["필독", "공지", "일반"] as const;

export type NoticeCategoryName = (typeof NOTICE_CATEGORIES)[number];

export function isNoticeCategoryName(name: string): name is NoticeCategoryName {
  return (NOTICE_CATEGORIES as readonly string[]).includes(name);
}

export function noticeCategoryTone(name: string) {
  if (name === "필독") return "must";
  if (name === "공지") return "offi";
  return "plain";
}
