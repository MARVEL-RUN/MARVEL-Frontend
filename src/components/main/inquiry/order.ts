import type { AdminInquiry } from "@/types/boards";

export function orderInquiries(rows: AdminInquiry[]) {
  return [...rows].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

export function inquiryNo(rows: AdminInquiry[]) {
  return new Map(rows.map((row, i) => [row.id, String(rows.length - i)]));
}
