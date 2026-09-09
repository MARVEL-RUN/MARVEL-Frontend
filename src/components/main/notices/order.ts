import type { AdminNotice } from "@/types/admin";

export function orderNotices(rows: AdminNotice[]) {
  return [...rows].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
  });
}

export function noticeNo(rows: AdminNotice[]) {
  const unpinned = rows.filter((row) => !row.pinned);
  return new Map(unpinned.map((row, i) => [row.id, String(unpinned.length - i)]));
}
