"use client";

import { NoticeBody } from "../notices/NoticeBody";
import { useState } from "react";

export type BoardFoldItem = {
  id: string;
  title: string;
  body: string;
};

export function BoardFold({
  items,
  empty,
  mark,
}: {
  items: BoardFoldItem[];
  empty: string;
  mark?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

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
              onClick={() => setOpenId(open ? null : item.id)}
            >
              {mark ? <span className="board-fold__mark">{mark}</span> : null}
              <strong className="board-fold__title">{item.title}</strong>
              <span className="board-fold__chev" aria-hidden="true" />
            </button>
            {open ? (
              <div className="board-fold__body">
                <NoticeBody text={item.body} />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
