"use client";

import { useState } from "react";
import { EVENT } from "@/lib/event";
import { PageHero } from "../layout/PageHero";

export function NoticesPage() {
  const [openId, setOpenId] = useState<string | null>(EVENT.notices[0]?.id ?? null);

  return (
    <main className="page">
      <PageHero kicker="DISPATCH" title="공지사항" en="OFFICIAL BULLETIN" />
      <div className="page__body wrap">
        <ul className="bulletin">
          {EVENT.notices.map((n) => {
            const open = openId === n.id;
            return (
              <li key={n.id} className={n.pinned ? "is-pin" : undefined}>
                <button
                  type="button"
                  className="bulletin__btn"
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : n.id)}
                >
                  <span className="bulletin__tag">{n.tag}</span>
                  <strong>{n.title}</strong>
                  <time>{n.date}</time>
                </button>
                {open ? <p className="bulletin__body">{n.body}</p> : null}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}