"use client";

import { useAdminConfirm } from "@/components/admin/ConfirmModal";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { adminToast } from "@/components/admin/Toast";
import { deleteFaq, listFaqs } from "@/services/admin/faqs";
import type { AdminFaq } from "@/types/boards";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export function FaqListPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "faqs"],
    queryFn: listFaqs,
  });
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const { confirm, modal } = useAdminConfirm();
  const remove = useMutation({
    mutationFn: deleteFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "faqs"] });
      adminToast.success("FAQ가 삭제되었습니다.");
    },
    onError: () => adminToast.error("FAQ 삭제에 실패했습니다."),
  });

  const rows = useMemo(() => {
    const keyword = appliedQ.trim().toLowerCase();
    if (!keyword) return data;
    return data.filter((row) =>
      [row.question, row.answer].join(" ").toLowerCase().includes(keyword),
    );
  }, [data, appliedQ]);

  const runSearch = () => setAppliedQ(q);

  const resetSearch = () => {
    setQ("");
    setAppliedQ("");
  };

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
          <>
            <input
              className="admin-toolbar__search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
              placeholder="질문 · 답변 검색"
            />
            <button type="button" className="admin-btn admin-btn--primary admin-toolbar__btn" onClick={runSearch}>
              검색
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-toolbar__iconbtn"
              aria-label="검색 초기화"
              title="초기화"
              onClick={resetSearch}
            >
              <RotateCcw size={24} strokeWidth={2.5} />
            </button>
          </>
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
                onClick={async () => {
                  if (await confirm("이 FAQ를 삭제할까요?")) remove.mutate(row.id);
                }}
              >
                삭제
              </button>
            ),
          },
        ]}
      />
      {modal}
    </div>
  );
}
