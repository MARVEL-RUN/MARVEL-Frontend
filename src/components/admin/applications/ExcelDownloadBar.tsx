"use client";

import { useEffect, useRef } from "react";

export function ExcelPageCheck({
  ids,
  picked,
  onTogglePage,
}: {
  ids: string[];
  picked: Set<string>;
  onTogglePage: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const all = ids.length > 0 && ids.every((id) => picked.has(id));
  const some = ids.some((id) => picked.has(id));

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = some && !all;
  }, [all, some]);

  return (
    <label className="admin-apps-list__check">
      <input
        ref={ref}
        type="checkbox"
        checked={all}
        disabled={ids.length === 0}
        onChange={onTogglePage}
        aria-label="현재 페이지 전체 선택"
      />
    </label>
  );
}

export function ExcelRowCheck({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="admin-apps-list__check" onClick={(event) => event.stopPropagation()}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
      />
    </label>
  );
}

export function ExcelDownloadButtons({
  busy,
  selectedCount,
  disabled,
  onFiltered,
  onSelected,
}: {
  busy: boolean;
  selectedCount: number;
  disabled?: boolean;
  onFiltered: () => void;
  onSelected: () => void;
}) {
  return (
    <>
      <button
        type="button"
        className="admin-btn admin-btn--ghost"
        disabled={disabled || busy}
        onClick={onFiltered}
      >
        엑셀 다운로드
      </button>
      <button
        type="button"
        className="admin-btn admin-btn--ghost"
        disabled={disabled || busy || selectedCount === 0}
        onClick={onSelected}
      >
        {`선택 다운로드${selectedCount ? ` (${selectedCount})` : ""}`}
      </button>
    </>
  );
}
