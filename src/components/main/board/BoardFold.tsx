"use client";

import { useState } from "react";

export type BoardFoldItem = {
  id: string;
  title: string;
  body: string;
};

export function BoardFold({
  items,
  empty,
}: {
  items: BoardFoldItem[];
  empty: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (items.length === 0) {
    return <p className="board__empty">{empty}</p>;
  }

  return (
    <ul className="board-fold">
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
              <strong className="board-fold__title">{item.title}</strong>
              <span className="board-fold__chev" aria-hidden="true" />
            </button>
            {open ? <p className="board-fold__body">{item.body}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}
