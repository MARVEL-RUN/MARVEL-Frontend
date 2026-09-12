"use client";

import { useEffect, type ReactNode } from "react";

export function SheetModal({
  title,
  kicker = "PAY",
  onClose,
  children,
}: {
  title: string;
  kicker?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="sheet-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="sheet-modal__dim"
        onClick={onClose}
        aria-label="닫기"
      />
      <div className="sheet-modal__sheet">
        <header className="sheet-modal__bar">
          <p className="sheet-modal__kicker">{kicker}</p>
          <h3>{title}</h3>
          <button type="button" className="sheet-modal__close" onClick={onClose}>
            닫기
          </button>
        </header>
        <div className="sheet-modal__body">{children}</div>
      </div>
    </div>
  );
}
