"use client";

import { DEFAULT_EVENT_ID } from "@/lib/main/config";
import { MainHttpError } from "@/lib/main/fetch";
import {
  getPublicAnswerDetail,
  getPublicQuestionDetail,
  INQUIRY_PUBLIC_TITLE,
  listPublicQuestions,
} from "@/services/main/questions";
import type {
  PublicAnswerDetail,
  PublicQuestionDetail,
  PublicQuestionListItem,
} from "@/types/main/questions";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InquirySecretModal } from "./InquirySecretModal";
import {
  formatInquiryDate,
  getInquiryPassword,
  isInquiryUnlocked,
  toDateTimeAttr,
  unlockInquiry,
} from "./order";

type ViewState = {
  question: PublicQuestionDetail;
  answer: PublicAnswerDetail | null;
};

export function InquiryViewPage() {
  const router = useRouter();
  const id = useSearchParams().get("id") ?? "";
  const [view, setView] = useState<ViewState | null | undefined>(undefined);
  const [neighbors, setNeighbors] = useState<{
    prev: PublicQuestionListItem | null;
    next: PublicQuestionListItem | null;
  }>({ prev: null, next: null });
  const [ready, setReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [secretError, setSecretError] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (!id) {
      setView(null);
      setNeighbors({ prev: null, next: null });
      setUnlocked(false);
      setGateOpen(false);
      setPendingId(null);
      setSecretError("");
      setReady(true);
      return;
    }

    const open = isInquiryUnlocked(id);
    setUnlocked(open);
    setGateOpen(!open);
    setPendingId(null);
    setSecretError("");
    setView(undefined);
    setReady(true);

    void listPublicQuestions({
      eventId: DEFAULT_EVENT_ID,
      page: 0,
      size: 50,
      sort: "LATEST",
    })
      .then((page) => {
        const rows = page.content ?? [];
        const i = rows.findIndex((row) => row.questionHeader.id === id);
        setNeighbors({
          next: i > 0 ? rows[i - 1] : null,
          prev: i >= 0 && i < rows.length - 1 ? rows[i + 1] : null,
        });
      })
      .catch(() => setNeighbors({ prev: null, next: null }));

    if (!open) return;

    const password = getInquiryPassword(id);
    void loadDetail(id, password)
      .then((data) => setView(data))
      .catch(() => {
        setUnlocked(false);
        setGateOpen(true);
        setView(null);
      });
  }, [id]);

  async function loadDetail(questionId: string, password: string) {
    const detail = await getPublicQuestionDetail(questionId, password);
    let answer = detail.answerDetail ?? null;
    if (answer?.isSecret && answer.id) {
      answer = await getPublicAnswerDetail(answer.id, password);
    }
    return {
      question: detail.questionDetail,
      answer,
    };
  }

  function goNeighbor(item: PublicQuestionListItem) {
    const targetId = item.questionHeader.id;
    if (!item.questionHeader.secret) {
      unlockInquiry(targetId, "");
      router.push(`/inquiry/view?id=${targetId}`);
      return;
    }
    setPendingId(targetId);
    setSecretError("");
  }

  const post = view === undefined ? undefined : view?.question ?? null;
  const answer = view?.answer ?? null;
  const answered = Boolean(answer?.content);
  const modalOpen = Boolean(pendingId) || gateOpen;
  const unlockTargetId = pendingId ?? id;
  const loading = !ready || (unlocked && post === undefined);

  return (
    <main className="page page--post">
      <div className="page__body wrap wrap--narrow">
        {loading ? (
          <div className="post post--loading" aria-busy="true">
            <p className="board__empty">불러오는 중...</p>
          </div>
        ) : post === null && !gateOpen ? (
          <div className="post">
            <p className="board__empty">글을 찾을 수 없습니다.</p>
            <div className="post__foot">
              <Link href="/inquiry" className="btn btn--ghost">
                목록
              </Link>
            </div>
          </div>
        ) : !unlocked && !post ? (
          <div className="post post--loading">
            <p className="board__empty">비밀글입니다. 비밀번호를 입력해 주세요.</p>
            <div className="post__foot">
              <Link href="/inquiry" className="btn btn--ghost">
                목록
              </Link>
            </div>
          </div>
        ) : post ? (
          <article className="post">
            <header className="post__head">
              <h2 className="post__title">{post.title}</h2>
              <p className="post__meta">
                <span className={answered ? "post__status" : "post__status is-wait"}>
                  {answered ? "답변완료" : "답변대기"}
                </span>
                <span>{post.author}</span>
                <time dateTime={toDateTimeAttr(post.createdAt)}>
                  {formatInquiryDate(post.createdAt)}
                </time>
              </p>
            </header>
            <div className="post__body">{post.content}</div>
            <section className="post__reply">
              <p className="post__reply-label">답변</p>
              {answered ? (
                <>
                  <p className="post__reply-meta">
                    <span>{answer?.author}</span>
                    <time dateTime={toDateTimeAttr(answer?.createdAt ?? "")}>
                      {formatInquiryDate(answer?.createdAt)}
                    </time>
                  </p>
                  <p className="post__reply-body">{answer?.content}</p>
                </>
              ) : (
                <p className="is-wait">답변 준비 중입니다.</p>
              )}
            </section>
            <nav className="post__nav" aria-label="이전·다음 글">
              <NavRow
                label="다음글"
                item={neighbors.next}
                onOpen={goNeighbor}
              />
              <NavRow
                label="이전글"
                item={neighbors.prev}
                onOpen={goNeighbor}
              />
            </nav>
            <div className="post__foot">
              <Link href="/inquiry" className="btn btn--ghost">
                목록
              </Link>
              {!answered ? (
                <Link href={`/inquiry/write?id=${post.id}`} className="btn btn--ghost">
                  수정
                </Link>
              ) : null}
              <Link href="/inquiry/write" className="btn btn--red">
                글쓰기
              </Link>
            </div>
          </article>
        ) : null}
      </div>
      <InquirySecretModal
        open={modalOpen}
        error={secretError}
        onClearError={() => setSecretError("")}
        onClose={() => {
          setSecretError("");
          if (pendingId) {
            setPendingId(null);
            return;
          }
          setGateOpen(false);
          router.push("/inquiry");
        }}
        onConfirm={(password) => {
          if (!unlockTargetId || unlocking) return;
          setUnlocking(true);
          setSecretError("");
          void loadDetail(unlockTargetId, password)
            .then((data) => {
              unlockInquiry(unlockTargetId, password);
              if (pendingId) {
                const nextId = pendingId;
                setPendingId(null);
                router.push(`/inquiry/view?id=${nextId}`);
                return;
              }
              setView(data);
              setUnlocked(true);
              setGateOpen(false);
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

function NavRow({
  label,
  item,
  onOpen,
}: {
  label: string;
  item: PublicQuestionListItem | null;
  onOpen: (item: PublicQuestionListItem) => void;
}) {
  if (!item) {
    return (
      <p className="post__nav-row is-empty">
        <span>{label}</span>
        <span>없음</span>
      </p>
    );
  }

  const q = item.questionHeader;
  return (
    <button
      type="button"
      className="post__nav-row"
      onClick={() => onOpen(item)}
    >
      <span>{label}</span>
      <strong>{q.secret ? INQUIRY_PUBLIC_TITLE : q.title}</strong>
    </button>
  );
}
