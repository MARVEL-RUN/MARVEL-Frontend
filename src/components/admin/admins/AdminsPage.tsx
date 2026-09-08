"use client";

import { listAdmins } from "@/services/admin/admins";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { useAdminAuthStore } from "@/stores";
import type { AdminUser } from "@/types/admin";
import { useQuery } from "@tanstack/react-query";

export function AdminsPage() {
  const user = useAdminAuthStore((s) => s.user);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "admins", user?.id],
    queryFn: () => listAdmins(user),
  });

  return (
    <div className="admin-page">
      <AdminTableShell<AdminUser>
        title="관리자 관리"
        rows={data}
        loading={isLoading}
        empty="관리자 계정이 없습니다."
        rowKey={(row) => row.id}
        columns={[
          { key: "account", header: "계정", render: (row) => row.account },
          { key: "role", header: "권한", render: (row) => row.role },
          {
            key: "roles",
            header: "역할",
            render: (row) => (row.roles ?? [row.role]).join(", "),
          },
        ]}
      />
    </div>
  );
}
