"use client";

import { CircleAlert, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function RegisterPayCheckModal({ open, onClose }: Props) {
  const titleId = useId();
  const descId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="inquiry-secret" role="presentation">
      <button
        type="button"
        className="inquiry-secret__dim"
        onClick={onClose}
        aria-label="닫기"
      />
      <div
        className="inquiry-secret__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <header className="inquiry-secret__head">
          <span className="inquiry-secret__icon" aria-hidden>
            <CircleAlert size={20} strokeWidth={2.25} />
          </span>
          <h2 id={titleId}>
            아직 <em>결제 전</em>입니다
          </h2>
          <button
            type="button"
            className="inquiry-secret__x"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={20} strokeWidth={2.25} />
          </button>
        </header>
        <p id={descId} className="inquiry-secret__desc">
          아래 접수 내용이 맞는지 확인한 뒤, 결제하기를 눌러야 결제가 진행됩니다.
        </p>
        <div className="inquiry-secret__actions">
          <button type="button" className="btn btn--red" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
