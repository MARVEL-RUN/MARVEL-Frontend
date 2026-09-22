"use client";

import { useAdminConfirm } from "@/components/admin/ConfirmModal";
import { AdminSelect } from "@/components/admin/Select";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { adminToast } from "@/components/admin/Toast";
import { hasAdminApi } from "@/lib/admin/config";
import { adminInquiryDetailHref } from "@/lib/admin/eventLinks";
import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import { fetchAdminEvents } from "@/services/admin/applications";
import {
  deleteAdminQuestion,
  listAdminQuestions,
} from "@/services/admin/boards/inquiries";
import type {
  AdminQuestionListItem,
  AdminQuestionSearchTarget,
} from "@/services/admin/boards/inquiries.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
const PAGE_SIZE = 10;

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const apiEventId = searchParams.get("eventId")?.trim() ?? "";
  const queryClient = useQueryClient();
  const { confirm, modal } = useAdminConfirm();
  const [q, setQ] = useState("");
  const [field, setField] = useState<SearchField>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [applied, setApplied] = useState<Applied>(INITIAL);
  const [page, setPage] = useState(1);

  const eventsQuery = useQuery({
    queryKey: ["admin", "events"],
    queryFn: fetchAdminEvents,
    enabled: hasAdminApi,
  });

  const eventTitle = useMemo(() => {
    const events = eventsQuery.data ?? [];
    return events.find((event) => event.eventId === apiEventId)?.eventName || "문의사항";
  }, [apiEventId, eventsQuery.data]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "inquiries", apiEventId, applied, page],
    queryFn: () =>
      listAdminQuestions({
        eventId: apiEventId,
        target: toTarget(applied.field),
        keyword: applied.q.trim() || undefined,
        isAnswered: toIsAnswered(applied.status),
        page: page - 1,
        size: PAGE_SIZE,
        sort: "LATEST",
      }),
    enabled: hasAdminApi && Boolean(apiEventId),
  });

  useEffect(() => {
    setPage(1);
  }, [apiEventId]);

  const remove = useMutation({
    mutationFn: deleteAdminQuestion,
    onSuccess: () => {
      const remaining = (data?.numberOfElements ?? 1) - 1;
      if (remaining <= 0 && page > 1) setPage((p) => p - 1);
      void queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] });
      adminToast.success("문의가 삭제되었습니다.");
    },
    onError: () => adminToast.error("문의 삭제에 실패했습니다."),
  });

  const rows = data?.content ?? [];
  const totalCount = data?.totalElements ?? 0;
  const pageCount = Math.max(1, data?.totalPages ?? 1);

  const placeholder =
    field === "name" ? "작성자명 검색" : field === "title" ? "게시글명 검색" : "이름 · 제목 검색";

  const runSearch = () => {
    setPage(1);
    setApplied({ q, field, status });
  };

  const resetSearch = () => {
    setQ("");
    setField("all");
    setStatus("all");
    setPage(1);
    setApplied(INITIAL);
  };

  return (
    <div className="admin-page">
      <AdminTableShell<AdminQuestionListItem>
        title={eventTitle}
        rows={rows}
        loading={isLoading}
        empty={
          !hasAdminApi
            ? "관리자 API 주소가 설정되지 않았습니다."
            : "등록된 문의가 없습니다."
        }
        rowKey={(row) => row.questionId}
        page={page}
        pageCount={pageCount}
        totalCount={totalCount}
        onPage={setPage}
        pageUnit="게시물"
        onRowClick={(row) =>
          router.push(
            adminInquiryDetailHref(row.questionId, { apiEventId }),
          )
        }
        tools={
          <>
            <Link href="/admin/boards/inquiry" className="admin-btn admin-btn--ghost">
              대회 목록
            </Link>
            <AdminSelect
              value={field}
              options={FIELD_OPTIONS}
              onChange={(value) => {
                setField(value);
                setPage(1);
                setApplied((prev) => ({ ...prev, field: value }));
              }}
              ariaLabel="검색 대상"
            />
            <AdminSelect
              value={status}
              options={STATUS_OPTIONS}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
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
            render: (row) => row.questionTitle,
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
          {
            key: "actions",
            header: "",
            render: (row) => (
              <button
                type="button"
                className="admin-btn admin-btn--text"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (await confirm("이 문의를 삭제할까요? 답변도 함께 삭제됩니다.")) {
                    remove.mutate(row.questionId);
                  }
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
