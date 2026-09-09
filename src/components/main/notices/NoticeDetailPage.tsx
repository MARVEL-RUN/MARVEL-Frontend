"use client";

import { getAdminNotice, listAdminNotices } from "@/services/admin/notices";
import type { AdminNotice } from "@/types/admin";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SideBanner } from "../layout/SideBanner";
import { orderNotices } from "./order";

export function NoticeDetailPage() {
  const id = useSearchParams().get("id") ?? "";
  const [post, setPost] = useState<AdminNotice | null | undefined>(undefined);
  const [prev, setPrev] = useState<AdminNotice | null>(null);
  const [next, setNext] = useState<AdminNotice | null>(null);

  useEffect(() => {
    if (!id) {
      setPost(null);
      setPrev(null);
      setNext(null);
      return;
    }
    void Promise.all([getAdminNotice(id), listAdminNotices()]).then(([found, rows]) => {
      const ordered = orderNotices(rows);
      const i = ordered.findIndex((row) => row.id === id);
      setPost(found);
      setNext(i > 0 ? ordered[i - 1] : null);
      setPrev(i >= 0 && i < ordered.length - 1 ? ordered[i + 1] : null);
    });
  }, [id]);

  return (
    <main className="page">
      <SideBanner kicker="DISPATCH" title="공지사항" en="OFFICIAL BULLETIN" />
      <div className="page__body wrap">
        {post === undefined ? (
          <p className="board__empty">불러오는 중...</p>
        ) : post === null ? (
          <div className="post">
            <p className="board__empty">글을 찾을 수 없습니다.</p>
            <div className="post__foot">
              <Link href="/notices" className="btn btn--ghost">
                목록
              </Link>
            </div>
          </div>
        ) : (
          <article className="post">
            <header className="post__head">
              <h2 className="post__title">{post.title}</h2>
              <p className="post__meta">
                <span>{post.tag}</span>
                <time dateTime={post.date.replaceAll(".", "-")}>{post.date}</time>
              </p>
            </header>
            <div className="post__body">{post.body}</div>
            <nav className="post__nav" aria-label="이전·다음 글">
              <NavRow label="다음글" item={next} />
              <NavRow label="이전글" item={prev} />
            </nav>
            <div className="post__foot">
              <Link href="/notices" className="btn btn--ghost">
                목록
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
  item: AdminNotice | null;
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
    <Link href={`/notices/view?id=${item.id}`} className="post__nav-row">
      <span>{label}</span>
      <strong>{item.title}</strong>
    </Link>
  );
}
