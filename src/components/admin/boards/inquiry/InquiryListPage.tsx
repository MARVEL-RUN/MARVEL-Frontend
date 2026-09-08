"use client";

import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { deleteInquiry, listInquiries } from "@/services/admin/inquiries";
import type { AdminInquiry } from "@/types/boards";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

export function InquiryListPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "inquiries"],
    queryFn: listInquiries,
  });
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "open" | "done">("all");
  const remove = useMutation({
    mutationFn: deleteInquiry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] }),
  });

  const rows = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    return data.filter((row) => {
      if (status === "open" && row.answer) return false;
      if (status === "done" && !row.answer) return false;
      if (!keyword) return true;
      return [row.name, row.title, row.body].join(" ").toLowerCase().includes(keyword);
    });
  }, [data, q, status]);

  return (
    <div className="admin-page">
      <AdminTableShell<AdminInquiry>
        title="문의사항"
        rows={rows}
        loading={isLoading}
        empty="등록된 문의가 없습니다."
        rowKey={(row) => row.id}
        tools={
          <>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="이름 · 제목 검색"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">전체</option>
              <option value="open">미답변</option>
              <option value="done">답변완료</option>
            </select>
          </>
        }
        columns={[
          {
            key: "title",
            header: "제목",
            render: (row) => (
              <Link href={`/admin/boards/inquiry/detail?id=${row.id}`}>{row.title}</Link>
            ),
          },
          { key: "name", header: "작성자", render: (row) => row.name },
          {
            key: "status",
            header: "상태",
            render: (row) => (
              <span className={`admin-badge ${row.answer ? "admin-badge--paid" : "admin-badge--pending"}`}>
                {row.answer ? "답변" : "미답변"}
              </span>
            ),
          },
          { key: "date", header: "등록일", render: (row) => row.date },
          {
            key: "actions",
            header: "",
            render: (row) => (
              <button
                type="button"
                className="admin-btn admin-btn--text"
                onClick={() => {
                  if (confirm("이 문의를 삭제할까요?")) remove.mutate(row.id);
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
