"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

type Props = {
  total: number;
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
  /** 총 N개의 {unit} — 기본 "게시물" */
  unit?: string;
};

function pageList(page: number, pageCount: number) {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const end = Math.min(pageCount, start + 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function AdminPagination({
  total,
  page,
  pageCount,
  onPage,
  unit = "게시물",
}: Props) {
  const pages = pageList(page, Math.max(1, pageCount));
  const atFirst = page <= 1;
  const atLast = page >= pageCount;

  return (
    <div className="admin-pagination" role="navigation" aria-label="페이지">
      <p className="admin-pagination__total">
        총 {total.toLocaleString()}개의 {unit}
      </p>

      <div className="admin-pagination__nav">
        <button
          type="button"
          className="admin-pagination__ctrl"
          aria-label="첫 페이지"
          disabled={atFirst}
          onClick={() => onPage(1)}
        >
          <ChevronsLeft size={16} />
        </button>
        <button
          type="button"
          className="admin-pagination__ctrl"
          aria-label="이전 페이지"
          disabled={atFirst}
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((n) => (
          <button
            key={n}
            type="button"
            className={`admin-pagination__page${n === page ? " is-on" : ""}`}
            aria-current={n === page ? "page" : undefined}
            onClick={() => onPage(n)}
          >
            {n}
          </button>
        ))}

        <button
          type="button"
          className="admin-pagination__ctrl"
          aria-label="다음 페이지"
          disabled={atLast}
          onClick={() => onPage(page + 1)}
        >
          <ChevronRight size={16} />
        </button>
        <button
          type="button"
          className="admin-pagination__ctrl"
          aria-label="마지막 페이지"
          disabled={atLast}
          onClick={() => onPage(pageCount)}
        >
          <ChevronsRight size={16} />
        </button>
      </div>

      <p className="admin-pagination__meta">
        페이지 {page}/{Math.max(1, pageCount)}
      </p>
    </div>
  );
}
