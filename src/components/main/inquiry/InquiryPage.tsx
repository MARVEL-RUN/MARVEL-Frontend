"use client";

import { listInquiries } from "@/services/admin/inquiries";
import type { AdminInquiry } from "@/types/boards";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SideBanner } from "../layout/SideBanner";
import { inquiryNo, orderInquiries } from "./order";

export function InquiryPage() {
  const [items, setItems] = useState<AdminInquiry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void listInquiries().then((rows) => {
      setItems(orderInquiries(rows));
      setReady(true);
    });
  }, []);

  const nos = useMemo(() => inquiryNo(items), [items]);

  return (
    <main className="page">
      <SideBanner kicker="INQUIRY" title="문의사항" en="CONTACT" />
      <div className="page__body wrap">
        <div className="board__tools">
          <Link href="/inquiry/write" className="btn btn--red">
            글쓰기
          </Link>
        </div>
        <div className="board board--qna">
          <div className="board__head">
            <span>번호</span>
            <span>제목</span>
            <span>작성자</span>
            <span>등록일</span>
          </div>
          {!ready ? (
            <p className="board__empty">불러오는 중...</p>
          ) : items.length === 0 ? (
            <p className="board__empty">등록된 문의가 없습니다.</p>
          ) : (
            items.map((item) => (
              <Link
                key={item.id}
                href={`/inquiry/view?id=${item.id}`}
                className="board__row"
              >
                <span className="board__no">{nos.get(item.id)}</span>
                <strong className="board__title">
                  <span className={item.answer ? "board__badge" : "board__badge is-wait"}>
                    {item.answer ? "답변" : "대기"}
                  </span>
                  {item.title}
                </strong>
                <span className="board__name">{item.name}</span>
                <time dateTime={item.date.replaceAll(".", "-")}>{item.date}</time>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
