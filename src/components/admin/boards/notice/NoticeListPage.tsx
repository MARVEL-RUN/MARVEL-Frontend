"use client";

import { useAdminConfirm } from "@/components/admin/ConfirmModal";
import { AdminSelect } from "@/components/admin/Select";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { adminToast } from "@/components/admin/Toast";
import { formatAdminBoardDate } from "@/lib/admin/formatDate";
import { noticeCategoryTone } from "@/lib/noticeCategories";
import {
  deleteAdminNotice,
  listAdminNotices,
} from "@/services/admin/boards/notices";
import { mergeNoticeList } from "@/services/main/notices";
import type { AdminNoticeSearchTarget } from "@/services/admin/boards/notices.types";
import type { NoticeRow } from "@/types/main/notices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type SearchField = "all" | "title" | "content";

const FIELD_OPTIONS = [
  { value: "all" as const, label: "전체" },
  { value: "title" as const, label: "제목" },
  { value: "content" as const, label: "내용" },
];

type Applied = {
  q: string;
  field: SearchField;
};

const INITIAL: Applied = { q: "", field: "all" };
const PAGE_SIZE = 10;

function toTarget(field: SearchField): AdminNoticeSearchTarget {
  if (field === "title") return "TITLE";
  if (field === "content") return "CONTENT";
  return "ALL";
}

export function NoticesAdminPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [field, setField] = useState<SearchField>("all");
  const [applied, setApplied] = useState<Applied>(INITIAL);
  const [page, setPage] = useState(1);
  const { confirm, modal } = useAdminConfirm();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "notices", applied, page],
    queryFn: () =>
      listAdminNotices({
        target: toTarget(applied.field),
        keyword: applied.q.trim() || undefined,
        page: page - 1,
        size: PAGE_SIZE,
        sort: "LATEST",
      }),
  });

  const remove = useMutation({
    mutationFn: deleteAdminNotice,
    onSuccess: () => {
      const remaining = (data?.noticePage.numberOfElements ?? 1) - 1;
      if (remaining <= 0 && page > 1) setPage((p) => p - 1);
      void queryClient.invalidateQueries({ queryKey: ["admin", "notices"] });
      adminToast.success("공지가 삭제되었습니다.");
    },
    onError: () => adminToast.error("공지 삭제에 실패했습니다."),
  });

  const rows = mergeNoticeList(
    data?.pinnedNoticeList,
    data?.noticePage.content,
  );
  const totalCount = data?.noticePage.totalElements ?? 0;
  const pageCount = Math.max(1, data?.noticePage.totalPages ?? 1);

  const placeholder =
    field === "title" ? "제목 검색" : field === "content" ? "내용 검색" : "제목 · 내용 검색";

  const runSearch = () => {
    setPage(1);
    setApplied({ q, field });
  };

  const resetSearch = () => {
    setQ("");
    setField("all");
    setPage(1);
    setApplied(INITIAL);
  };

  return (
    <div className="admin-page">
      <AdminTableShell<NoticeRow>
        title="공지사항"
        rows={rows}
        loading={isLoading}
        empty="등록된 공지가 없습니다."
        rowKey={(row) => row.id}
        page={page}
        pageCount={pageCount}
        totalCount={totalCount}
        onPage={setPage}
        pageUnit="게시물"
        actions={
          <Link href="/admin/boards/notice/write" className="admin-btn admin-btn--red">
            등록하기
          </Link>
        }
        tools={
          <>
            <AdminSelect
              value={field}
              options={FIELD_OPTIONS}
              onChange={(value) => {
                setField(value);
                setPage(1);
                setApplied((prev) => ({ ...prev, field: value }));
              }}
              ariaLabel="검색 대상"
              width={112}
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
          { key: "category", header: "카테고리", render: (row) => (
              <span className={`admin-badge admin-badge--${noticeCategoryTone(row.category)}`}>
                {row.category}
              </span>
            ) },
          {
            key: "title",
            header: "제목",
            render: (row) => (
              <Link href={`/admin/boards/notice/edit?id=${row.id}`}>{row.title}</Link>
            ),
          },
          {
            key: "date",
            header: "등록일",
            render: (row) => formatAdminBoardDate(row.createdAt),
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
                  if (await confirm("이 공지를 삭제할까요?")) remove.mutate(row.id);
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
