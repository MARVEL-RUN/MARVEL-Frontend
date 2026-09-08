"use client";

import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { deleteFaq, listFaqs } from "@/services/admin/faqs";
import type { AdminFaq } from "@/types/boards";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useMemo, useState } from "react";

export function FaqListPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "faqs"],
    queryFn: listFaqs,
  });
  const [q, setQ] = useState("");
  const remove = useMutation({
    mutationFn: deleteFaq,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "faqs"] }),
  });

  const rows = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return data;
    return data.filter((row) =>
      [row.question, row.answer].join(" ").toLowerCase().includes(keyword),
    );
  }, [data, q]);

  return (
    <div className="admin-page">
      <AdminTableShell<AdminFaq>
        title="FAQ"
        rows={rows}
        loading={isLoading}
        empty="등록된 FAQ가 없습니다."
        rowKey={(row) => row.id}
        actions={
          <Link href="/admin/boards/faq/write" className="admin-btn admin-btn--red">
            등록하기
          </Link>
        }
        tools={
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="질문 · 답변 검색"
          />
        }
        columns={[
          {
            key: "question",
            header: "질문",
            render: (row) => (
              <Link href={`/admin/boards/faq/edit?id=${row.id}`}>{row.question}</Link>
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
                  if (confirm("이 FAQ를 삭제할까요?")) remove.mutate(row.id);
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
