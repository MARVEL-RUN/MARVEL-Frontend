"use client";

import { FAQ_CATEGORIES, type FaqCategory } from "@/lib/admin/faqCategories";
import { listFaqs } from "@/services/admin/faqs";
import type { AdminFaq } from "@/types/boards";
import { useEffect, useMemo, useState } from "react";

export function FaqPage() {
  const [items, setItems] = useState<AdminFaq[]>([]);
  const [cat, setCat] = useState<FaqCategory>(FAQ_CATEGORIES[0]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    void listFaqs().then(setItems);
  }, []);

  const shown = useMemo(
    () => items.filter((item) => item.category === cat),
    [items, cat],
  );

  useEffect(() => {
    const first = items.find((item) => item.category === cat);
    setOpenId(first?.id ?? null);
  }, [cat, items]);

  return (
    <main className="page page--faq">
      <div className="page__body wrap wrap--narrow">
        <h1 className="faq__title">자주 묻는 질문</h1>
        <div className="faq__tabs" role="tablist" aria-label="FAQ 분류">
          {FAQ_CATEGORIES.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={cat === item}
              className={cat === item ? "faq__tab is-on" : "faq__tab"}
              onClick={() => setCat(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <p className="faq__count">총 게시물 {shown.length}건</p>
        {shown.length === 0 ? (
          <p className="board__empty">등록된 FAQ가 없습니다.</p>
        ) : (
          <ul className="faq">
            {shown.map((item) => {
              const open = openId === item.id;
              return (
                <li key={item.id} className={open ? "is-open" : undefined}>
                  <button
                    type="button"
                    className="faq__btn"
                    aria-expanded={open}
                    onClick={() => setOpenId(open ? null : item.id)}
                  >
                    <span className="faq__mark">Q.</span>
                    <strong className="faq__question">{item.question}</strong>
                    <span className="faq__chev" aria-hidden="true" />
                  </button>
                  {open ? <p className="faq__a">{item.answer}</p> : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
