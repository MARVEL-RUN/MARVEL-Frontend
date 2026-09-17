import type { AdminNotice } from "@/types/admin/admin";

export function orderNotices(rows: AdminNotice[]) {
  return [...rows].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
  });
}
