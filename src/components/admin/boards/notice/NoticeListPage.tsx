"use client";

import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { deleteAdminNotice, listAdminNotices } from "@/services/admin/notices";
import type { AdminNotice } from "@/types/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

export function NoticesAdminPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "notices"],
    queryFn: listAdminNotices,
  });
  const [q, setQ] = useState("");
  const remove = useMutation({
    mutationFn: deleteAdminNotice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "notices"] }),
  });

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
        actions={
          <Link href="/admin/boards/notice/write" className="admin-btn admin-btn--red">
            등록하기
          </Link>
        }
        tools={
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="제목 · 태그 검색"
          />
        }
        columns={[
          { key: "tag", header: "구분", render: (row) => row.tag },
          {
            key: "title",
            header: "제목",
            render: (row) => (
              <Link href={`/admin/boards/notice/edit?id=${row.id}`}>{row.title}</Link>
            ),
          },
          { key: "pinned", header: "고정", render: (row) => (row.pinned ? "Y" : "") },
          { key: "date", header: "등록일", render: (row) => row.date },
          {
            key: "actions",
            header: "",
            render: (row) => (
              <button
                type="button"
                className="admin-btn admin-btn--text"
                onClick={() => {
                  if (confirm("이 공지를 삭제할까요?")) remove.mutate(row.id);
                }}
              >
                삭제
              </button>
            ),
          },
        ]}
      />
    </div>
  );
}
