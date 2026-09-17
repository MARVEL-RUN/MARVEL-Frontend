"use client";

import { NoticeBody } from "../notices/NoticeBody";
import { useEffect, useState } from "react";

export type BoardFoldItem = {
  id: string;
  title: string;
  body?: string;
};

export function BoardFold({
  items,
  empty,
  mark,
  onExpand,
}: {
  items: BoardFoldItem[];
  empty: string;
  mark?: string;
  onExpand?: (id: string) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(
    items[0]?.body != null ? items[0].id : null,
  );

  useEffect(() => {
    setOpenId((cur) => {
      if (items.length === 0) return null;
      if (cur && items.some((item) => item.id === cur)) return cur;
      const first = items[0];
      return first.body != null ? first.id : null;
    });
  }, [items]);

  if (items.length === 0) {
    return <p className="board__empty">{empty}</p>;
  }

  return (
    <ul className={mark ? "board-fold has-mark" : "board-fold"}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <li key={item.id} className={open ? "is-open" : undefined}>
            <button
              type="button"
              className="board-fold__btn"
              aria-expanded={open}
              onClick={() => {
                const next = open ? null : item.id;
                setOpenId(next);
                if (next && item.body == null) onExpand?.(next);
              }}
            >
              {mark ? <span className="board-fold__mark">{mark}</span> : null}
              <strong className="board-fold__title">{item.title}</strong>
              <span className="board-fold__chev" aria-hidden="true" />
            </button>
            {open ? (
              <div className="board-fold__body">
                {item.body == null ? (
                  <p className="board__empty">불러오는 중...</p>
                ) : (
                  <NoticeBody text={item.body} />
                )}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
