"use client";

import { CircleAlert, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  mode?: "register" | "lookup-modify";
};

const COPY = {
  register: {
    submitLabel: "신청서 제출",
    submitGuide: "참가신청이 등록됩니다. 이후 신청조회에서 결제하시면 참가가 확정됩니다.",
    payGuide: "지금 결제하시면 바로 참가가 확정됩니다.",
  },
  "lookup-modify": {
    submitLabel: "수정된 신청서 제출",
    submitGuide: "변경 내용이 저장됩니다. 이후 신청조회에서 결제하시면 참가가 확정됩니다.",
    payGuide: "변경 내용 저장 후 바로 결제합니다.",
  },
} as const;

export function RegisterPayCheckModal({ open, onClose, mode = "register" }: Props) {
  const copy = COPY[mode];
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
        className="inquiry-secret__panel inquiry-secret__panel--pay-check"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <header className="inquiry-secret__head">
          <span className="inquiry-secret__icon" aria-hidden>
            <CircleAlert size={20} strokeWidth={2.25} />
          </span>
          <h2 id={titleId}>아래 접수 내용을 확인해 주세요.</h2>
          <button
            type="button"
            className="inquiry-secret__x"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={20} strokeWidth={2.25} />
          </button>
        </header>
        <ul id={descId} className="inquiry-secret__guides">
          <li>
            <span className="btn btn--ghost inquiry-secret__chip">{copy.submitLabel}</span>
            <span>{copy.submitGuide}</span>
          </li>
          <li>
            <span className="btn btn--red inquiry-secret__chip">결제하기</span>
            <span>{copy.payGuide}</span>
          </li>
        </ul>
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
