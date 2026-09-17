export const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export type AdminUser = {
  id: string;
  account: string;
  role: string;
  roles?: string[];
};

export type AdminPayStatus =
  | "paid"
  | "pending"
  | "refund_requested"
  | "refunded";
