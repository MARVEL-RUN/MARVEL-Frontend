"use client";

import { listAdminSponsors } from "@/services/admin/sponsors";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import type { AdminSponsor } from "@/types/admin";
import { useQuery } from "@tanstack/react-query";

export function SponsorsPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "sponsors"],
    queryFn: listAdminSponsors,
  });

  return (
    <div className="admin-page">
      <AdminTableShell<AdminSponsor>
        title="스폰서"
        rows={data}
        loading={isLoading}
        empty="등록된 스폰서가 없습니다."
        rowKey={(row) => row.id}
        columns={[
          { key: "id", header: "번호", render: (row) => row.id },
          { key: "role", header: "역할", render: (row) => row.role },
          { key: "name", header: "이름", render: (row) => row.name },
        ]}
      />
    </div>
  );
}
