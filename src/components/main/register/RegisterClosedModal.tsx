"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { openLeftNow, useOpenLeft } from "../home/OpenCountdown";
import { RegisterClosedModalV1 } from "./RegisterClosedModalV1";
import { RegisterClosedModalV2 } from "./RegisterClosedModalV2";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Version = 1 | 2;

const STORAGE_KEY = "register-standby-version";

export function RegisterClosedModal({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [version, setVersion] = useState<Version>(2);
  const { left } = useOpenLeft(open);
  const live = left ?? (open ? openLeftNow() : null);
  const slots = live ?? { d: "00", h: "00", m: "00", s: "00" };
  const dday = live ? `D - ${Number(live.d)}` : "OPEN";

  useEffect(() => {
    setMounted(true);
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

  const panel =
    version === 1 ? (
      <RegisterClosedModalV1 dday={dday} slots={slots} onClose={onClose} />
    ) : (
      <RegisterClosedModalV2 dday={dday} slots={slots} onClose={onClose} />
    );

  return createPortal(
    <div className="register-standby" role="presentation">
      <button
        type="button"
        className="register-standby__dim"
        onClick={onClose}
        aria-label="닫기"
      />
      <div className="register-standby__stack">
        {panel}
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
