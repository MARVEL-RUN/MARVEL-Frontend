"use client";

import { noticeCategoryTone } from "@/lib/noticeCategories";
import {
  getPublicNoticeDetail,
  listPublicNotices,
  mergeNoticeList,
} from "@/services/main/notices";
import type { NoticeRow, PublicNoticeDetail } from "@/types/main/notices";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { NoticeBody } from "./NoticeBody";
import { fileNameFromUrl, formatNoticeDate, toDateTimeAttr } from "./order";

export function NoticeDetailPage() {
  const id = useSearchParams().get("id") ?? "";
  const [post, setPost] = useState<PublicNoticeDetail | null | undefined>(
    undefined,
  );
  const [category, setCategory] = useState("");
  const [prev, setPrev] = useState<NoticeRow | null>(null);
  const [next, setNext] = useState<NoticeRow | null>(null);

  useEffect(() => {
    if (!id) {
      setPost(null);
      setPrev(null);
      setNext(null);
      setCategory("");
      return;
    }

    setPost(undefined);

    void getPublicNoticeDetail(id)
      .then((detail) => setPost(detail))
      .catch(() => setPost(null));

    void listPublicNotices({
      page: 0,
      size: 50,
      sort: "LATEST",
    })
      .then((result) => {
        const rows = mergeNoticeList(
          result.pinnedNoticeList,
          result.noticePage.content ?? [],
        );
        const i = rows.findIndex((row) => row.id === id);
        setCategory(i >= 0 ? rows[i].category : "");
        setNext(i > 0 ? rows[i - 1] : null);
        setPrev(i >= 0 && i < rows.length - 1 ? rows[i + 1] : null);
      })
      .catch(() => {
        setPrev(null);
        setNext(null);
      });
  }, [id]);

  return (
    <main className="page page--post">
      <div className="page__body wrap wrap--narrow">
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
                {category ? (
                  <span className={`post__cat is-${noticeCategoryTone(category)}`}>
                    {category}
                  </span>
                ) : null}
                <span>{post.author}</span>
                <time dateTime={toDateTimeAttr(post.createdAt)}>
                  {formatNoticeDate(post.createdAt)}
                </time>
              </p>
            </header>
            <div className="post__body">
              <NoticeBody text={post.content} />
            </div>
            {post.attachmentUrls?.length ? (
              <section className="post__files">
                <p className="post__files-label">첨부파일</p>
                <ul className="post__files-list">
                  {post.attachmentUrls.map((url) => (
                    <li key={url}>
                      <a
                        className="post__files-name"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {fileNameFromUrl(url)}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
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
  item: NoticeRow | null;
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
