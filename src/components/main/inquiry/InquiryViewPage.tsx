"use client";

import {
  getInquiry,
  INQUIRY_PUBLIC_TITLE,
  listInquiries,
} from "@/services/admin/inquiries";
import type { AdminInquiry } from "@/types/boards";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { InquirySecretModal } from "./InquirySecretModal";
import { isInquiryUnlocked, orderInquiries, toDateTimeAttr, unlockInquiry } from "./order";

export function InquiryViewPage() {
  const router = useRouter();
  const id = useSearchParams().get("id") ?? "";
  const [post, setPost] = useState<AdminInquiry | null | undefined>(undefined);
  const [prev, setPrev] = useState<AdminInquiry | null>(null);
  const [next, setNext] = useState<AdminInquiry | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      setPost(null);
      setPrev(null);
      setNext(null);
      setUnlocked(false);
      setGateOpen(false);
      return;
    }
    const open = isInquiryUnlocked(id);
    setUnlocked(open);
    setGateOpen(!open);
    void Promise.all([getInquiry(id), listInquiries()]).then(([found, rows]) => {
      const ordered = orderInquiries(rows);
      const i = ordered.findIndex((row) => row.id === id);
      setPost(found);
      setNext(i > 0 ? ordered[i - 1] : null);
      setPrev(i >= 0 && i < ordered.length - 1 ? ordered[i + 1] : null);
    });
  }, [id]);

  function goNeighbor(targetId: string) {
    if (isInquiryUnlocked(targetId)) {
      router.push(`/inquiry/view?id=${targetId}`);
      return;
    }
    router.push(`/inquiry/view?id=${targetId}`);
  }

  return (
    <main className="page page--post">
      <div className="page__body wrap wrap--narrow">
        {post === undefined ? (
          <p className="board__empty">불러오는 중...</p>
        ) : post === null ? (
          <div className="post">
            <p className="board__empty">글을 찾을 수 없습니다.</p>
            <div className="post__foot">
              <Link href="/inquiry" className="btn btn--ghost">
                목록
              </Link>
            </div>
          </div>
        ) : !unlocked ? (
          <div className="post">
            <p className="board__empty">비밀글입니다. 비밀번호를 입력해 주세요.</p>
            <div className="post__foot">
              <Link href="/inquiry" className="btn btn--ghost">
                목록
              </Link>
            </div>
          </div>
        ) : (
          <article className="post">
            <header className="post__head">
              <h2 className="post__title">{post.title}</h2>
              <p className="post__meta">
                <span
                  className={
                    post.answer ? "post__status" : "post__status is-wait"
                  }
                >
                  {post.answer ? "답변완료" : "답변대기"}
                </span>
                <span>{post.name}</span>
                <time dateTime={toDateTimeAttr(post.date)}>{post.date}</time>
              </p>
            </header>
            <div className="post__body">{post.body}</div>
            {post.attachments?.length ? (
              <section className="post__files" aria-label="첨부파일">
                <p className="post__files-label">첨부파일</p>
                <ul className="post__files-list">
                  {post.attachments.map((file) => (
                    <li key={file.id}>
                      <span className="post__files-name">{file.name}</span>
                      <span className="post__files-size">{formatFileSize(file.size)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <section className="post__reply">
              <p className="post__reply-label">답변</p>
              {post.answer ? <p>{post.answer}</p> : <p className="is-wait">답변 준비 중입니다.</p>}
            </section>
            <nav className="post__nav" aria-label="이전·다음 글">
              <NavRow label="다음글" item={next} onOpen={goNeighbor} />
              <NavRow label="이전글" item={prev} onOpen={goNeighbor} />
            </nav>
            <div className="post__foot">
              <Link href="/inquiry" className="btn btn--ghost">
                목록
              </Link>
              {!post.answer ? (
                <Link href={`/inquiry/write?id=${post.id}`} className="btn btn--ghost">
                  수정
                </Link>
              ) : null}
              <Link href="/inquiry/write" className="btn btn--red">
                글쓰기
              </Link>
            </div>
          </article>
        )}
      </div>
      <InquirySecretModal
        open={Boolean(post) && gateOpen}
        onClose={() => {
          setGateOpen(false);
          router.push("/inquiry");
        }}
        onConfirm={() => {
          if (!id) return;
          // 임시: 비밀번호 검증 생략
          unlockInquiry(id);
          setUnlocked(true);
          setGateOpen(false);
        }}
      />
    </main>
  );
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function NavRow({
  label,
  item,
  onOpen,
}: {
  label: string;
  item: AdminInquiry | null;
  onOpen: (id: string) => void;
}) {
  if (!item) {
    return (
      <p className="post__nav-row is-empty">
        <span>{label}</span>
        <span>없음</span>
      </p>
    );
  }

  return (
    <button type="button" className="post__nav-row" onClick={() => onOpen(item.id)}>
      <span>{label}</span>
      <strong>{INQUIRY_PUBLIC_TITLE}</strong>
    </button>
  );
}
