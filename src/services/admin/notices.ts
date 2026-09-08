import { EVENT } from "@/lib/event";
import type { AdminNotice } from "@/types/admin";

const delay = () => new Promise((r) => setTimeout(r, 120));

export async function listAdminNotices(): Promise<AdminNotice[]> {
  await delay();
  return EVENT.notices.map((item) => ({ ...item }));
}
