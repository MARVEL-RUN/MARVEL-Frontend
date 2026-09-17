"use client";

import { noticeCategoryTone } from "@/lib/noticeCategories";
import {
  listPublicNotices,
  mergeNoticeList,
} from "@/services/main/notices";
import type { NoticeRow } from "@/types/main/notices";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BoardPagination } from "../board/BoardPagination";
import { BoardSearch, type BoardSort } from "../board/BoardSearch";
import { SideBanner } from "../layout/SideBanner";
import { noticeDateParts, toDateTimeAttr } from "./order";

const PAGE_SIZE = 20;

export function NoticesPage() {
  const [items, setItems] = useState<NoticeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [sort, setSort] = useState<BoardSort>("latest");

  useEffect(() => {
    let cancelled = false;
    setError("");

    void (async () => {
      try {
        const result = await listPublicNotices({
          target: "ALL",
          keyword: applied.trim() || undefined,
          page: page - 1,
          size: PAGE_SIZE,
          sort: sort === "oldest" ? "OLDEST" : "LATEST",
        });
        if (cancelled) return;

        setItems(
          mergeNoticeList(
            result.pinnedNoticeList,
            result.noticePage.content ?? [],
          ),
        );
        setTotal(result.noticePage.totalElements ?? 0);
        setPageCount(Math.max(1, result.noticePage.totalPages ?? 1));
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        setItems([]);
        setTotal(0);
        setPageCount(1);
        setReady(true);
        setError(
          err instanceof Error ? err.message : "공지 목록을 불러오지 못했습니다.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applied, sort, page]);

  return (
    <main className="page">
      <SideBanner kicker="DISPATCH" title="공지사항" en="OFFICIAL BULLETIN" />
      <div className="page__body wrap">
        <BoardSearch
          query={query}
          sort={sort}
          onQueryChange={(value) => {
            setQuery(value);
            if (!value.trim() && applied) {
              setApplied("");
              setPage(1);
            }
          }}
          onSortChange={(next) => {
            setSort(next);
            setPage(1);
          }}
          onSearch={() => {
            setApplied(query);
            setPage(1);
          }}
        />
        <div className="board board--notice">
          <div className="board__head">
            <span>카테고리</span>
            <span>제목</span>
            <span>등록일</span>
          </div>
          {!ready ? (
            <p className="board__empty">불러오는 중...</p>
          ) : error ? (
            <p className="board__empty">{error}</p>
          ) : items.length === 0 ? (
            <p className="board__empty">
              {applied.trim() ? "검색 결과가 없습니다." : "등록된 공지가 없습니다."}
            </p>
          ) : (
            items.map((n) => {
              const when = noticeDateParts(n.createdAt);
              return (
                <Link
                  key={n.id}
                  href={`/notices/view?id=${n.id}`}
                  className={n.pinned ? "board__row is-pin" : "board__row"}
                >
                  <span className={`board__no is-${noticeCategoryTone(n.category)}`}>
                    {n.category}
                  </span>
                  <strong className="board__title">{n.title}</strong>
                  <time dateTime={toDateTimeAttr(n.createdAt)}>{when.day}</time>
                </Link>
              );
            })
          )}
        </div>
        {ready && !error ? (
          <BoardPagination
            total={total}
            page={page}
            pageCount={pageCount}
            onPage={setPage}
          />
        ) : null}
      </div>
    </main>
  );
}
