export const NOTICE_CATEGORIES = ["필독", "공지", "이벤트", "일반"] as const;

export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number];

export const NOTICE_CATEGORY_OPTIONS = NOTICE_CATEGORIES.map((value) => ({
  value,
  label: value,
}));

export const NOTICE_CATEGORY_FILTER_OPTIONS = [
  { value: "all" as const, label: "전체" },
  ...NOTICE_CATEGORY_OPTIONS,
];

export function isNoticeCategory(value: string): value is NoticeCategory {
  return (NOTICE_CATEGORIES as readonly string[]).includes(value);
}
