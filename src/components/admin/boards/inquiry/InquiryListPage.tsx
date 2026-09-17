"use client";

import { AdminSelect } from "@/components/admin/Select";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import { DEFAULT_EVENT_ID } from "@/lib/main/config";
import { listAdminQuestions } from "@/services/admin/boards/inquiries";
import type {
  AdminQuestionListItem,
  AdminQuestionSearchTarget,
} from "@/services/admin/boards/inquiries.types";
import { useQuery } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

function toTarget(field: SearchField): AdminQuestionSearchTarget {
  if (field === "name") return "AUTHOR";
  if (field === "title") return "TITLE";
  return "ALL";
}

function toIsAnswered(status: StatusFilter): boolean | undefined {
  if (status === "open") return false;
  if (status === "done") return true;
  return undefined;
}

export function InquiryListPage() {
  const [q, setQ] = useState("");
  const [field, setField] = useState<SearchField>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [applied, setApplied] = useState<Applied>(INITIAL);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "inquiries", applied],
    queryFn: () =>
      listAdminQuestions({
        eventId: DEFAULT_EVENT_ID,
        target: toTarget(applied.field),
        keyword: applied.q.trim() || undefined,
        isAnswered: toIsAnswered(applied.status),
        page: 0,
        size: 50,
        sort: "LATEST",
      }),
  });

  const rows = data?.content ?? [];

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
      <AdminTableShell<AdminQuestionListItem>
        title="문의사항"
        rows={rows}
        loading={isLoading}
        empty="등록된 문의가 없습니다."
        rowKey={(row) => row.questionId}
        tools={
          <>
            <AdminSelect
              value={field}
              options={FIELD_OPTIONS}
              onChange={(value) => {
                setField(value);
                setApplied((prev) => ({ ...prev, field: value }));
              }}
              ariaLabel="검색 대상"
            />
            <AdminSelect
              value={status}
              options={STATUS_OPTIONS}
              onChange={(value) => {
                setStatus(value);
                setApplied((prev) => ({ ...prev, status: value }));
              }}
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
              <Link href={`/admin/boards/inquiry/detail?id=${row.questionId}`}>
                {row.questionTitle}
              </Link>
            ),
          },
          { key: "name", header: "작성자", render: (row) => row.authorName },
          {
            key: "status",
            header: "상태",
            render: (row) => (
              <span
                className={`admin-badge ${row.answered ? "admin-badge--paid" : "admin-badge--pending"}`}
              >
                {row.answered ? "답변" : "미답변"}
              </span>
            ),
          },
          {
            key: "date",
            header: "등록일",
            render: (row) => formatAdminBoardDate(row.questionCreatedAt),
          },
        ]}
      />
    </div>
  );
}
