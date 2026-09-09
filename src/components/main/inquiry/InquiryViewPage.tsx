"use client";

import { getInquiry, listInquiries } from "@/services/admin/inquiries";
import type { AdminInquiry } from "@/types/boards";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SideBanner } from "../layout/SideBanner";
import { orderInquiries } from "./order";

export function InquiryViewPage() {
  const id = useSearchParams().get("id") ?? "";
  const [post, setPost] = useState<AdminInquiry | null | undefined>(undefined);
  const [prev, setPrev] = useState<AdminInquiry | null>(null);
  const [next, setNext] = useState<AdminInquiry | null>(null);

  useEffect(() => {
    if (!id) {
      setPost(null);
      setPrev(null);
      setNext(null);
      return;
    }
    void Promise.all([getInquiry(id), listInquiries()]).then(([found, rows]) => {
      const ordered = orderInquiries(rows);
      const i = ordered.findIndex((row) => row.id === id);
      setPost(found);
      setNext(i > 0 ? ordered[i - 1] : null);
      setPrev(i >= 0 && i < ordered.length - 1 ? ordered[i + 1] : null);
    });
  }, [id]);

  return (
    <main className="page">
      <SideBanner kicker="INQUIRY" title="문의사항" en="CONTACT" />
      <div className="page__body wrap">
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
        ) : (
          <article className="post">
            <header className="post__head">
              <h2 className="post__title">{post.title}</h2>
              <p className="post__meta">
                <span>{post.answer ? "답변" : "대기"}</span>
                <span>{post.name}</span>
                <time dateTime={post.date.replaceAll(".", "-")}>{post.date}</time>
              </p>
            </header>
            <div className="post__body">{post.body}</div>
            <section className="post__reply">
              <p className="post__reply-label">답변</p>
              {post.answer ? <p>{post.answer}</p> : <p className="is-wait">답변 준비 중입니다.</p>}
            </section>
            <nav className="post__nav" aria-label="이전·다음 글">
              <NavRow label="다음글" item={next} />
              <NavRow label="이전글" item={prev} />
            </nav>
            <div className="post__foot">
              <Link href="/inquiry" className="btn btn--ghost">
                목록
              </Link>
              <Link href="/inquiry/write" className="btn btn--red">
                글쓰기
              </Link>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}

function NavRow({
  label,
  item,
}: {
  label: string;
  item: AdminInquiry | null;
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
    <Link href={`/inquiry/view?id=${item.id}`} className="post__nav-row">
      <span>{label}</span>
      <strong>{item.title}</strong>
    </Link>
  );
}
