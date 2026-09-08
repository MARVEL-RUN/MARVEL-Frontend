"use client";

import { listFaqs } from "@/services/admin/faqs";
import type { AdminFaq } from "@/types/boards";
import { useEffect, useState } from "react";
import { SideBanner } from "../layout/SideBanner";

export function FaqPage() {
  const [items, setItems] = useState<AdminFaq[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    void listFaqs().then((rows) => {
      setItems(rows);
      setOpenId(rows[0]?.id ?? null);
    });
  }, []);

  return (
    <main className="page">
      <SideBanner kicker="FAQ" title="자주 묻는 질문" en="HELP DESK" />
      <div className="page__body wrap">
        <ul className="bulletin">
          {items.map((item) => {
            const open = openId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  className="bulletin__btn"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  <span className="bulletin__tag">FAQ</span>
                  <strong>{item.question}</strong>
                  <time>{item.date}</time>
                </button>
                {open ? <p className="bulletin__body">{item.answer}</p> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
