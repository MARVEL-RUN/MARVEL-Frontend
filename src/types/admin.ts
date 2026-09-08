export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminUser = {
  id: string;
  account: string;
  role: string;
  roles?: string[];
};

export type AdminPayStatus = "paid" | "pending" | "cancelled";

export type AdminNotice = {
  id: string;
  date: string;
  tag: string;
  title: string;
  pinned: boolean;
  body: string;
};

export type AdminSponsor = {
  id: string;
  role: string;
  name: string;
};
