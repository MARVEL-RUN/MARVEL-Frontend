import { EVENT } from "@/lib/event";
import type { AdminSponsor } from "@/types/admin";

const delay = () => new Promise((r) => setTimeout(r, 120));

export async function listAdminSponsors(): Promise<AdminSponsor[]> {
  await delay();
  return EVENT.sponsors.map((item, index) => ({
    id: String(index + 1),
    role: item.role,
    name: item.name,
  }));
}
