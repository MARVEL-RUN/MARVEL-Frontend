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

export async function resetAdminPassword(id: string, password: string) {
  await delay();
  if (!id) throw new Error("관리자를 찾을 수 없습니다.");
  if (password.trim().length < 4) {
    throw new Error("비밀번호는 4자 이상이어야 합니다.");
  }
}
