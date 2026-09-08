"use client";

import { listAdminNotices } from "@/services/admin/notices";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import type { AdminNotice } from "@/types/admin";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

export function NoticesAdminPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "notices"],
    queryFn: listAdminNotices,
  });
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return data;
    return data.filter((row) =>
      [row.title, row.tag, row.body].join(" ").toLowerCase().includes(keyword),
    );
  }, [data, q]);

  return (
    <div className="admin-page">
      <AdminTableShell<AdminNotice>
        title="공지사항"
        rows={rows}
        loading={isLoading}
        empty="등록된 공지가 없습니다."
        rowKey={(row) => row.id}
        tools={
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제목 · 태그 검색"
          />
        }
        columns={[
          { key: "id", header: "번호", render: (row) => row.id },
          { key: "tag", header: "구분", render: (row) => row.tag },
          { key: "title", header: "제목", render: (row) => row.title },
          { key: "pinned", header: "고정", render: (row) => (row.pinned ? "Y" : "") },
          { key: "date", header: "등록일", render: (row) => row.date },
        ]}
      />
    </div>
  );
}
