"use client";

import type { FormEvent, ReactNode } from "react";

export type BoardSort = "latest" | "oldest";

type Props = {
  query: string;
  sort: BoardSort;
  onQueryChange: (value: string) => void;
  onSortChange: (value: BoardSort) => void;
  onSearch: () => void;
  placeholder?: string;
  children?: ReactNode;
};

export function BoardSearch({
  query,
  sort,
  onQueryChange,
  onSortChange,
  onSearch,
  placeholder = "검색어를 입력하세요",
  children,
}: Props) {
  function submit(e: FormEvent) {
    e.preventDefault();
    onSearch();
  }

  return (
    <form className="board-search" onSubmit={submit} role="search">
      <div className="board-search__find">
        <input
          className="board-search__input"
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          aria-label="검색어"
        />
        <button type="submit" className="board-search__btn">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20 16.5 16.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          검색
        </button>
      </div>
      <select
        className="board-search__sort"
        value={sort}
        aria-label="정렬"
        onChange={(e) => onSortChange(e.target.value as BoardSort)}
      >
        <option value="latest">최신순</option>
        <option value="oldest">과거순</option>
      </select>
      {children}
    </form>
  );
}

export function matchQuery(haystacks: string[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystacks.some((text) => text.toLowerCase().includes(q));
}

export function byDate(sort: BoardSort) {
  const dir = sort === "latest" ? -1 : 1;
  return (a: { date: string; id: string }, b: { date: string; id: string }) =>
    dir * (a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}
