"use client";

import { Fragment, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { EVENT } from "@/lib/event";
import { openLeftNow, useOpenLeft } from "../home/OpenCountdown";

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
  const dday = live ? `D - ${Number(live.d)}` : "OPEN";
  const units = [
    [slots.d, "DAY"],
    [slots.h, "HR"],
    [slots.m, "MIN"],
    [slots.s, "SEC"],
  ] as const;

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
        className="register-standby__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="register-standby__head">
          <p className="kicker">STANDBY</p>
          <button
            type="button"
            className="register-standby__x"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={20} strokeWidth={2.25} />
          </button>
        </header>
        <h2 id={titleId}>아직 접수 기간이 아닙니다</h2>
        <p className="register-standby__chip">
          <span>접수 OPEN</span>
          <i aria-hidden />
          <span>{dday}</span>
        </p>
        <div className="register-standby__count" aria-hidden>
          {units.map(([n, u], i) => (
            <Fragment key={u}>
              {i > 0 ? <i className="register-standby__colon">:</i> : null}
              <span className="register-standby__tick">
                <strong className="register-standby__digit" key={n}>
                  {n}
                </strong>
                <em>{u}</em>
              </span>
            </Fragment>
          ))}
        </div>
        <p className="register-standby__when">
          {EVENT.openNoticeDate} · {EVENT.openNoticeTime}
        </p>
        <p className="register-standby__desc">
          오픈 시각에 개인 또는 단체 신청을 할 수 있습니다.
        </p>
        <div className="register-standby__actions">
          <button type="button" className="btn btn--red" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
