"use client";

import { useAdminConfirm } from "@/components/admin/ConfirmModal";
import { useAdminPrompt } from "@/components/admin/InputModal";
import { AdminSelect } from "@/components/admin/Select";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { adminToast } from "@/components/admin/Toast";
import { deleteInquiry, listInquiries, resetInquiryPassword } from "@/services/admin/inquiries";
import type { AdminInquiry } from "@/types/boards";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type SearchField = "all" | "name" | "title";
type StatusFilter = "all" | "open" | "done";

const FIELD_OPTIONS = [
  { value: "all" as const, label: "전체" },
  { value: "name" as const, label: "작성자명" },
  { value: "title" as const, label: "게시글명" },
];

const STATUS_OPTIONS = [
  { value: "all" as const, label: "전체" },
  { value: "open" as const, label: "미답변" },
  { value: "done" as const, label: "답변완료" },
];

type Applied = {
  q: string;
  field: SearchField;
  status: StatusFilter;
};

const INITIAL: Applied = { q: "", field: "all", status: "all" };

export function InquiryListPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "inquiries"],
    queryFn: listInquiries,
  });
  const [q, setQ] = useState("");
  const [field, setField] = useState<SearchField>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [applied, setApplied] = useState<Applied>(INITIAL);
  const { confirm, modal } = useAdminConfirm();
  const { prompt, modal: inputModal } = useAdminPrompt();
  const remove = useMutation({
    mutationFn: deleteInquiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      adminToast.success("문의가 삭제되었습니다.");
    },
    onError: () => adminToast.error("문의 삭제에 실패했습니다."),
  });
  const resetPassword = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      resetInquiryPassword(id, password),
    onSuccess: () => adminToast.success("비밀번호가 초기화되었습니다."),
    onError: () => adminToast.error("비밀번호 초기화에 실패했습니다."),
  });

  const handleResetPassword = async (row: AdminInquiry) => {
    const ok = await confirm({
      title: "비밀번호 초기화",
      message: "문의사항 비밀번호를 초기화하시겠습니까?",
    });
    if (!ok) return;
    const password = await prompt({
      title: "비밀번호 초기화",
      description: "새 비밀번호를 입력해주세요.",
      label: "비밀번호",
      placeholder: "비밀번호를 입력해주세요",
      type: "password",
      minLength: 4,
    });
    if (!password) return;
    resetPassword.mutate({ id: row.id, password });
  };

  const rows = useMemo(() => {
    const keyword = applied.q.trim().toLowerCase();
    return data.filter((row) => {
      if (applied.status === "open" && row.answer) return false;
      if (applied.status === "done" && !row.answer) return false;
      if (!keyword) return true;
      if (applied.field === "name") return row.name.toLowerCase().includes(keyword);
      if (applied.field === "title") return row.title.toLowerCase().includes(keyword);
      return [row.name, row.title, row.body].join(" ").toLowerCase().includes(keyword);
    });
  }, [data, applied]);

  const placeholder =
    field === "name" ? "작성자명 검색" : field === "title" ? "게시글명 검색" : "이름 · 제목 검색";

  const runSearch = () => setApplied({ q, field, status });

  const resetSearch = () => {
    setQ("");
    setField("all");
    setStatus("all");
    setApplied(INITIAL);
  };

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
            <AdminSelect
              value={field}
              options={FIELD_OPTIONS}
              onChange={setField}
              ariaLabel="검색 대상"
            />
            <AdminSelect
              value={status}
              options={STATUS_OPTIONS}
              onChange={setStatus}
              ariaLabel="답변 상태"
              width={120}
            />
            <input
              className="admin-toolbar__search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
              placeholder={placeholder}
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
            key: "password",
            header: "비번 초기화",
            render: (row) => (
              <button
                type="button"
                className="admin-btn admin-btn--text"
                disabled={resetPassword.isPending}
                onClick={() => handleResetPassword(row)}
              >
                초기화
              </button>
            ),
          },
          {
            key: "actions",
            header: "",
            render: (row) => (
              <button
                type="button"
                className="admin-btn admin-btn--text"
                onClick={async () => {
                  if (await confirm("이 문의를 삭제할까요?")) remove.mutate(row.id);
                }}
              >
                삭제
              </button>
            ),
          },
        ]}
      />
      {modal}
      {inputModal}
    </div>
  );
}
