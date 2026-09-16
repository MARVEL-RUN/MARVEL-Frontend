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

type Version = 1 | 2;

const STORAGE_KEY = "register-standby-version";

export function RegisterClosedModal({ open, onClose }: Props) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [version, setVersion] = useState<Version>(2);
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
    const saved = Number(window.localStorage.getItem(STORAGE_KEY));
    if (saved === 1 || saved === 2) setVersion(saved);
  }, []);

  useEffect(() => {
    if (!open) return;
    const saved = Number(window.localStorage.getItem(STORAGE_KEY));
    if (saved === 1 || saved === 2) setVersion(saved);
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

  function pick(next: Version) {
    setVersion(next);
    window.localStorage.setItem(STORAGE_KEY, String(next));
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div className="register-standby" role="presentation">
      <button
        type="button"
        className="register-standby__dim"
        onClick={onClose}
        aria-label="닫기"
      />
      <div className="register-standby__stack">
        <div
          className={`register-standby__panel register-standby__panel--v${version}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <p className="register-standby__ghost" aria-hidden>
            STANDBY
          </p>
          <header className="register-standby__head">
            <p className={version === 1 ? "kicker" : "kicker kicker--on-red"}>
              {version === 1 ? "STANDBY" : "OPEN"}
            </p>
            <span className="register-standby__dday">{dday}</span>
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
            {version === 1 ? (
              <>
                {EVENT.openNoticeDate} · {EVENT.openNoticeTime}
              </>
            ) : (
              <>
                {EVENT.openNoticeDate}
                <br />
                {EVENT.openNoticeTime} {EVENT.openNoticeAction}
              </>
            )}
          </p>
          <p className="register-standby__desc">
            오픈 시각에 개인 또는 단체 신청을 할 수 있습니다.
          </p>
          <div className="register-standby__actions">
            <button
              type="button"
              className={version === 1 ? "btn btn--red" : "btn btn--on-red"}
              onClick={onClose}
            >
              확인
            </button>
          </div>
        </div>
        <div className="register-standby__pick" role="tablist" aria-label="모달 버전">
          <button
            type="button"
            role="tab"
            aria-selected={version === 1}
            className={version === 1 ? "is-on" : ""}
            onClick={() => pick(1)}
          >
            버전 1
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={version === 2}
            className={version === 2 ? "is-on" : ""}
            onClick={() => pick(2)}
          >
            버전 2
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
