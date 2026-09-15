import type { AdminInquiry } from "@/types/boards";

export function orderInquiries(rows: AdminInquiry[]) {
  return [...rows].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

export function inquiryNo(rows: AdminInquiry[]) {
  return new Map(rows.map((row, i) => [row.id, String(rows.length - i)]));
}

export function inquiryUnlockKey(id: string) {
  return `mr-inquiry-unlock-${id}`;
}

export function isInquiryUnlocked(id: string) {
  return (
    typeof window !== "undefined" &&
    sessionStorage.getItem(inquiryUnlockKey(id)) === "1"
  );
}

export function unlockInquiry(id: string) {
  sessionStorage.setItem(inquiryUnlockKey(id), "1");
}

/** `2026.09.14 11:36` → `2026-09-14T11:36` */
export function toDateTimeAttr(date: string) {
  const [day, time] = date.split(" ");
  const isoDay = day.replaceAll(".", "-");
  return time ? `${isoDay}T${time}` : isoDay;
}
