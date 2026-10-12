"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { EVENT } from "@/lib/event";
import { RegisterStandbyCount } from "./RegisterStandbyCount";
import { useRound2OpenCountdown } from "./useRegistrationRound2Pause";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function RegisterRound2WaitModal({ open, onClose }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const slots = useRound2OpenCountdown(open);
  const display = slots ?? { d: "00", h: "00", m: "00", s: "00" };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (slots === null) onClose();
  }, [open, slots, onClose]);

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
        <h2 id={titleId}>1차 신청이 마감되었습니다</h2>
        <p className="standby-v1__chip">
          <span>1차 신청 마감</span>
          <i aria-hidden />
          <span>2차 신청 시작까지</span>
        </p>
        <RegisterStandbyCount slots={display} />
        <p className="standby-v1__when" aria-live="polite">
          {display.d !== "00" ? `${Number(display.d)}일 ` : null}
          {Number(display.h)}시 {display.m}분 {display.s}초
        </p>
        <p className="standby-v1__when">
          {EVENT.round2OpenNoticeDate} · {EVENT.round2OpenNoticeTime} {EVENT.round2OpenNoticeAction}
        </p>
        <p className="form__note">
          2차 신청 시작 전까지는 새로 신청할 수 없습니다. 참가비 미결제 건은 홈페이지
          신청조회에서 결제·확인할 수 있습니다. 17시 이후에는 신청 정보 수정 및 환불이
          제한될 수 있습니다.
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
