"use client";

import { listAdminNotices } from "@/services/admin/notices";
import type { AdminNotice } from "@/types/admin";
import { useEffect, useState } from "react";
import { SideBanner } from "../layout/SideBanner";

export function NoticesPage() {
  const [items, setItems] = useState<AdminNotice[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    void listAdminNotices().then((rows) => {
      setItems(rows);
      setOpenId(rows[0]?.id ?? null);
    });
  }, []);

  return (
    <main className="page">
      <SideBanner kicker="DISPATCH" title="공지사항" en="OFFICIAL BULLETIN" />
      <div className="page__body wrap">
        <ul className="bulletin">
          {items.map((n) => {
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
