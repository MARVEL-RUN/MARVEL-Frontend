"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { EVENT } from "@/lib/event";
import { openLeftNow, useOpenLeft } from "../home/OpenCountdown";
import { RegisterStandbyCount } from "./RegisterStandbyCount";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function RegisterClosedModal({ open, onClose }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const { left } = useOpenLeft(open);
  const live = left ?? (open ? openLeftNow() : null);
  const slots = live ?? { d: "00", h: "00", m: "00", s: "00" };
  const dday = live ? `D - ${live.n}` : "OPEN";

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
    <div className="register-standby" role="presentation">
      <button
        type="button"
        className="register-standby__dim"
        onClick={onClose}
        aria-label="닫기"
      />
      <div
        className="standby-v1"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="standby-v1__head">
          <p className="kicker">STANDBY</p>
          <button
            type="button"
            className="standby-v1__x"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={20} strokeWidth={2.25} />
          </button>
        </header>
        <h2 id={titleId}>아직 접수 기간이 아닙니다</h2>
        <p className="standby-v1__chip">
          <span>접수 OPEN</span>
          <i aria-hidden />
          <span>{dday}</span>
        </p>
        <RegisterStandbyCount slots={slots} />
        <p className="standby-v1__when">
          {EVENT.openNoticeDate} · {EVENT.openNoticeTime}
        </p>
        <div className="standby-v1__actions">
          <button type="button" className="btn btn--red" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
