"use client";

import { INQUIRY_PUBLIC_TITLE, listInquiries } from "@/services/admin/inquiries";
import type { AdminInquiry } from "@/types/boards";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BoardSearch,
  byDate,
  matchQuery,
  type BoardSort,
} from "../board/BoardSearch";
import { SideBanner } from "../layout/SideBanner";
import { InquirySecretModal } from "./InquirySecretModal";
import { inquiryNo, orderInquiries, toDateTimeAttr, unlockInquiry } from "./order";

export function InquiryPage() {
  const router = useRouter();
  const [items, setItems] = useState<AdminInquiry[]>([]);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [sort, setSort] = useState<BoardSort>("latest");
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    void listInquiries().then((rows) => {
      setItems(orderInquiries(rows));
      setReady(true);
    });
  }, []);

  const nos = useMemo(() => inquiryNo(items), [items]);
  const shown = useMemo(() => {
    const filtered = items.filter((item) => matchQuery([item.name], applied));
    return [...filtered].sort(byDate(sort));
  }, [items, applied, sort]);

  function openPost(id: string) {
    setPendingId(id);
  }

  return (
    <main className="page">
      <SideBanner kicker="INQUIRY" title="문의사항" en="CONTACT" />
      <div className="page__body wrap">
        <BoardSearch
          query={query}
          sort={sort}
          onQueryChange={setQuery}
          onSortChange={setSort}
          onSearch={() => setApplied(query)}
        >
          <Link href="/inquiry/write" className="btn btn--red">
            글쓰기
          </Link>
        </BoardSearch>
        <div className="board board--qna">
          <div className="board__head">
            <span>번호</span>
            <span>제목</span>
            <span>작성자</span>
            <span>등록일</span>
          </div>
          {!ready ? (
            <p className="board__empty">불러오는 중...</p>
          ) : shown.length === 0 ? (
            <p className="board__empty">
              {applied.trim() ? "검색 결과가 없습니다." : "등록된 문의가 없습니다."}
            </p>
          ) : (
            shown.map((item) => (
              <button
                key={item.id}
                type="button"
                className="board__row"
                onClick={() => openPost(item.id)}
              >
                <span className="board__no">{nos.get(item.id)}</span>
                <span className="board__subject">
                  <span
                    className={
                      item.answer ? "board__badge" : "board__badge is-wait"
                    }
                  >
                    {item.answer ? "답변" : "대기"}
                  </span>
                  <Lock className="board__lock" size={14} aria-hidden />
                  <strong className="board__title">{INQUIRY_PUBLIC_TITLE}</strong>
                </span>
                <span className="board__name">{item.name}</span>
                <time dateTime={toDateTimeAttr(item.date)}>{item.date}</time>
              </button>
            ))
          )}
        </div>
      </div>
      <InquirySecretModal
        open={Boolean(pendingId)}
        onClose={() => setPendingId(null)}
        onConfirm={() => {
          if (!pendingId) return;
          // 임시: 비밀번호 검증 생략
          unlockInquiry(pendingId);
          const id = pendingId;
          setPendingId(null);
          router.push(`/inquiry/view?id=${id}`);
        }}
      />
    </main>
  );
}
