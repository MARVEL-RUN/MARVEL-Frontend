"use client";

import { useAdminConfirm } from "@/components/admin/ConfirmModal";
import { AdminSelect } from "@/components/admin/Select";
import { AdminTableShell } from "@/components/admin/Table/AdminTableShell";
import { adminToast } from "@/components/admin/Toast";
import {
  NOTICE_CATEGORY_FILTER_OPTIONS,
  type NoticeCategory,
} from "@/lib/admin/noticeCategories";
import { deleteAdminNotice, listAdminNotices } from "@/services/admin/notices";
import type { AdminNotice } from "@/types/admin";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type CategoryFilter = "all" | NoticeCategory;

type Applied = {
  q: string;
  category: CategoryFilter;
};

const INITIAL: Applied = { q: "", category: "all" };

export function NoticesAdminPage() {
  const queryClient = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "notices"],
    queryFn: listAdminNotices,
  });
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [applied, setApplied] = useState<Applied>(INITIAL);
  const { confirm, modal } = useAdminConfirm();
  const remove = useMutation({
    mutationFn: deleteAdminNotice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "notices"] });
      adminToast.success("공지가 삭제되었습니다.");
    },
    onError: () => adminToast.error("공지 삭제에 실패했습니다."),
  });

  const rows = useMemo(() => {
    const keyword = applied.q.trim().toLowerCase();
    return data.filter((row) => {
      if (applied.category !== "all" && row.tag !== applied.category) return false;
      if (!keyword) return true;
      return [row.title, row.tag, row.body].join(" ").toLowerCase().includes(keyword);
    });
  }, [data, applied]);

  const runSearch = () => setApplied({ q, category });

  const resetSearch = () => {
    setQ("");
    setCategory("all");
    setApplied(INITIAL);
  };

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
          <>
            <AdminSelect
              value={category}
              options={NOTICE_CATEGORY_FILTER_OPTIONS}
              onChange={(value) => {
                setCategory(value);
                setApplied((prev) => ({ ...prev, category: value }));
              }}
              ariaLabel="카테고리"
              width={112}
            />
            <input
              className="admin-toolbar__search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch();
              }}
              placeholder="제목 · 내용 검색"
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
          { key: "tag", header: "카테고리", render: (row) => row.tag },
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
                onClick={async () => {
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
