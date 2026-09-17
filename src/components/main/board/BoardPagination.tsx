"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  total: number;
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
  unit?: string;
  /** 데스크톱에서 한 번에 보이는 페이지 수 (모바일은 5) */
  windowSize?: number;
};

function pageWindow(page: number, pageCount: number, size: number) {
  if (pageCount <= 0) {
    return { start: 1, end: 1, pages: [1] };
  }
  const block = Math.ceil(page / size);
  const start = (block - 1) * size + 1;
  const end = Math.min(pageCount, start + size - 1);
  return {
    start,
    end,
    pages: Array.from({ length: end - start + 1 }, (_, i) => start + i),
  };
}

export function BoardPagination({
  total,
  page,
  pageCount,
  onPage,
  unit = "게시물",
  windowSize = 10,
}: Props) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const size = compact ? 5 : windowSize;
  const safeCount = Math.max(1, pageCount);
  const current = Math.min(Math.max(1, page), safeCount);
  const { start, end, pages } = pageWindow(current, safeCount, size);
  const atFirst = current <= 1;
  const atLast = current >= safeCount;

  return (
    <div className="board-pager" role="navigation" aria-label="페이지">
      <p className="board-pager__total">
        총 {total.toLocaleString()}개의 {unit}
      </p>

      <div className="board-pager__nav">
        <button
          type="button"
          className="board-pager__ctrl"
          aria-label="첫 페이지"
          disabled={atFirst}
          onClick={() => onPage(1)}
        >
          <ChevronsLeft size={16} strokeWidth={2.25} />
        </button>
        <button
          type="button"
          className="board-pager__ctrl"
          aria-label="이전 페이지 묶음"
          disabled={start <= 1}
          onClick={() => onPage(start - 1)}
        >
          <ChevronLeft size={16} strokeWidth={2.25} />
        </button>

        {pages.map((n) => (
          <button
            key={n}
            type="button"
            className={`board-pager__page${n === current ? " is-on" : ""}`}
            aria-current={n === current ? "page" : undefined}
            onClick={() => onPage(n)}
          >
            {n}
          </button>
        ))}

        <button
          type="button"
          className="board-pager__ctrl"
          aria-label="다음 페이지 묶음"
          disabled={end >= safeCount}
          onClick={() => onPage(end + 1)}
        >
          <ChevronRight size={16} strokeWidth={2.25} />
        </button>
        <button
          type="button"
          className="board-pager__ctrl"
          aria-label="마지막 페이지"
          disabled={atLast}
          onClick={() => onPage(safeCount)}
        >
          <ChevronsRight size={16} strokeWidth={2.25} />
        </button>
      </div>

      <p className="board-pager__meta">
        페이지 {current}/{safeCount}
      </p>
    </div>
  );
}
