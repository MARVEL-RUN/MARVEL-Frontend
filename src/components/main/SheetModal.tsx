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
    <div className="course-preview sheet-modal" role="dialog" aria-modal="true">
      <button
        type="button"
        className="course-preview__dim"
        onClick={onClose}
        aria-label="닫기"
      />
      <div className="course-preview__sheet sheet-modal__sheet">
        <header className="course-preview__bar">
          <p className="course-preview__kicker">{kicker}</p>
          <h3>{title}</h3>
          <button type="button" className="course-preview__close" onClick={onClose}>
            닫기
          </button>
        </header>
        <div className="sheet-modal__body">{children}</div>
      </div>
    </div>
  );
}
