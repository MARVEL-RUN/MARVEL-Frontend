"use client";

import { DEFAULT_EVENT_ID } from "@/lib/main/config";
import { MainHttpError } from "@/lib/main/fetch";
import {
  getPublicQuestionDetail,
  INQUIRY_PUBLIC_TITLE,
  listPublicQuestions,
} from "@/services/main/questions";
import type { PublicQuestionListItem } from "@/types/main/questions";
import { Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BoardPagination } from "../board/BoardPagination";
import { BoardSearch, type BoardSort } from "../board/BoardSearch";
import { SideBanner } from "../layout/SideBanner";
import { InquirySecretModal } from "./InquirySecretModal";
import {
  inquiryDateParts,
  toDateTimeAttr,
  unlockInquiry,
} from "./order";

const PAGE_SIZE = 20;

export function InquiryPage() {
  const router = useRouter();
  const [items, setItems] = useState<PublicQuestionListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [page, setPage] = useState(1);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  const [sort, setSort] = useState<BoardSort>("latest");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [secretError, setSecretError] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError("");

    void (async () => {
      try {
        // API OLDEST가 LATEST와 동일하게 내려와서, 과거순은 끝 페이지를 뒤집어 맞춤
        const first = await listPublicQuestions({
          eventId: DEFAULT_EVENT_ID,
          target: "ALL",
          keyword: applied.trim() || undefined,
          page: page - 1,
          size: PAGE_SIZE,
          sort: "LATEST",
        });
        if (cancelled) return;

        const pages = Math.max(1, first.totalPages ?? 1);
        const apiPage = sort === "oldest" ? pages - page : page - 1;
        const result =
          apiPage === page - 1
            ? first
            : await listPublicQuestions({
              eventId: DEFAULT_EVENT_ID,
              target: "ALL",
              keyword: applied.trim() || undefined,
              page: apiPage,
              size: PAGE_SIZE,
              sort: "LATEST",
            });
        if (cancelled) return;

        const rows = result.content ?? [];
        setItems(sort === "oldest" ? [...rows].reverse() : rows);
        setTotal(result.totalElements ?? 0);
        setPageCount(pages);
        setReady(true);
      } catch (err) {
        if (cancelled) return;
        setItems([]);
        setTotal(0);
        setPageCount(1);
        setReady(true);
        setError(
          err instanceof Error ? err.message : "문의 목록을 불러오지 못했습니다.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applied, sort, page]);

  function openPost(item: PublicQuestionListItem) {
    const id = item.questionHeader.id;
    if (!item.questionHeader.secret) {
      unlockInquiry(id, "");
      router.push(`/inquiry/view?id=${id}`);
      return;
    }
    setPendingId(id);
  }

  return (
    <main className="page">
      <SideBanner kicker="INQUIRY" title="문의사항" en="CONTACT" />
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
        >
          <Link href="/inquiry/write" className="btn btn--red">
            글쓰기
          </Link>
        </BoardSearch>
        <p className="board__notice">
          <span className="board__notice-mark">※</span>
          <span className="board__notice-body">
            문의는 비밀글로 등록되어 제목이 [문의]로만 보입니다.{" "}
            <span className="board__notice-break">
              내 글은 작성자 이름으로 검색해 주세요.
            </span>
          </span>
        </p>
        <div className="board board--qna">
          <div className="board__head">
            <span>번호</span>
            <span>상태</span>
            <span>제목</span>
            <span>작성자</span>
            <span>날짜</span>
          </div>
          {!ready ? (
            <p className="board__empty">불러오는 중...</p>
          ) : error ? (
            <p className="board__empty">{error}</p>
          ) : items.length === 0 ? (
            <p className="board__empty">
              {applied.trim() ? "검색 결과가 없습니다." : "등록된 문의가 없습니다."}
            </p>
          ) : (
            items.map((item) => {
              const q = item.questionHeader;
              const answered = q.answered || Boolean(item.answerHeader);
              const when = inquiryDateParts(q.createdAt);
              return (
                <button
                  key={q.id}
                  type="button"
                  className="board__row"
                  onClick={() => openPost(item)}
                >
                  <span className="board__no">{q.no}</span>
                  <span
                    className={
                      answered ? "board__badge" : "board__badge is-wait"
                    }
                  >
                    {answered ? "답변완료" : "답변대기"}
                  </span>
                  <span className="board__subject">
                    {q.secret ? (
                      <Lock className="board__lock" size={14} aria-hidden />
                    ) : null}
                    <strong className="board__title">
                      {q.secret ? INQUIRY_PUBLIC_TITLE : q.title}
                    </strong>
                  </span>
                  <span className="board__meta">
                    <span className="board__name">{q.authorName}</span>
                    <time dateTime={toDateTimeAttr(q.createdAt)}>
                      <span className="board__day">{when.day}</span>
                      {when.time ? (
                        <span className="board__clock"> {when.time}</span>
                      ) : null}
                    </time>
                  </span>
                </button>
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
      <InquirySecretModal
        open={Boolean(pendingId)}
        error={secretError}
        onClose={() => {
          setPendingId(null);
          setSecretError("");
        }}
        onClearError={() => setSecretError("")}
        onConfirm={(password) => {
          if (!pendingId || unlocking) return;
          setUnlocking(true);
          setSecretError("");
          void getPublicQuestionDetail(pendingId, password)
            .then(() => {
              unlockInquiry(pendingId, password);
              const id = pendingId;
              setPendingId(null);
              router.push(`/inquiry/view?id=${id}`);
            })
            .catch((err) => {
              const message =
                err instanceof MainHttpError
                  ? err.message || "비밀번호가 올바르지 않습니다."
                  : err instanceof Error
                    ? err.message
                    : "비밀번호 확인에 실패했습니다.";
              setSecretError(message);
            })
            .finally(() => setUnlocking(false));
        }}
      />
    </main>
  );
}
