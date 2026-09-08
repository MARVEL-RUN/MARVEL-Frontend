import type { AdminUser } from "@/types/admin";

const delay = () => new Promise((r) => setTimeout(r, 80));

export async function listAdmins(current: AdminUser | null): Promise<AdminUser[]> {
  await delay();
  if (current) return [current];
  return [
    {
      id: "admin",
      account: "admin",
      role: "SUPER_ADMIN",
      roles: ["SUPER_ADMIN"],
    },
  ];
}
