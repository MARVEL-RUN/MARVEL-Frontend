"use client";

import { listAdminNotices } from "@/services/admin/notices";
import type { AdminNotice } from "@/types/admin";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BoardSearch,
  byDate,
  matchQuery,
  type BoardSort,
} from "../board/BoardSearch";
import { SideBanner } from "../layout/SideBanner";
import { noticeNo, orderNotices } from "./order";

export function NoticesPage() {
  const [items, setItems] = useState<AdminNotice[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [sort, setSort] = useState<BoardSort>("latest");

  useEffect(() => {
    void listAdminNotices().then((rows) => {
      setItems(orderNotices(rows));
      setReady(true);
    });
  }, []);

  const nos = useMemo(() => noticeNo(items), [items]);
  const shown = useMemo(() => {
    const filtered = items.filter((n) => matchQuery([n.title], applied));
    return [...filtered].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return byDate(sort)(a, b);
    });
  }, [items, applied, sort]);

  return (
    <main className="page">
      <SideBanner kicker="DISPATCH" title="공지사항" en="OFFICIAL BULLETIN" />
      <div className="page__body wrap">
        <BoardSearch
          query={query}
          sort={sort}
          onQueryChange={setQuery}
          onSortChange={setSort}
          onSearch={() => setApplied(query)}
        />
        <div className="board">
          <div className="board__head">
            <span>번호</span>
            <span>제목</span>
            <span>등록일</span>
          </div>
          {!ready ? (
            <p className="board__empty">불러오는 중...</p>
          ) : shown.length === 0 ? (
            <p className="board__empty">
              {applied.trim() ? "검색 결과가 없습니다." : "등록된 공지가 없습니다."}
            </p>
          ) : (
            shown.map((n) => (
              <Link
                key={n.id}
                href={`/notices/view?id=${n.id}`}
                className={n.pinned ? "board__row is-pin" : "board__row"}
              >
                <span className="board__no">{n.pinned ? "공지" : nos.get(n.id)}</span>
                <strong className="board__title">{n.title}</strong>
                <time dateTime={n.date.replaceAll(".", "-")}>{n.date}</time>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
