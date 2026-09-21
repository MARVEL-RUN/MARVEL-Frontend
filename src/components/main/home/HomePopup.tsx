"use client";

import Image from "next/image";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EVENT } from "@/lib/event";
import { MOBILE_MQ } from "@/lib/viewport";

const POP = EVENT.popup;
const STORE = `mr-pop-${POP.id}`;
const EDGE = 8;

function todayStamp() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" });
}

function mutedToday() {
  try {
    return localStorage.getItem(STORE) === todayStamp();
  } catch {
    return false;
  }
}

function siteZoom() {
  const z = Number.parseFloat(getComputedStyle(document.documentElement).zoom);
  return z > 0 ? z : 1;
}

function clamp(left: number, top: number, el: HTMLElement) {
  const z = siteZoom();
  const maxL = window.innerWidth / z - el.offsetWidth - EDGE;
  const maxT = window.innerHeight / z - el.offsetHeight - EDGE;
  return {
    left: Math.min(Math.max(EDGE, left), Math.max(EDGE, maxL)),
    top: Math.min(Math.max(EDGE, top), Math.max(EDGE, maxT)),
  };
}

export function HomePopup() {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mute, setMute] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const muteId = useId();
  const done = useRef(false);
  const muteRef = useRef(false);
  const box = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    muteRef.current = mute;
  }, [mute]);

  useEffect(() => {
    if (!POP.enabled || mutedToday()) {
      done.current = true;
      return;
    }
    const html = document.documentElement;
    const tryShow = () => {
      if (done.current) return;
      if (html.classList.contains("is-live") && !html.classList.contains("is-intro")) {
        setOpen(true);
      }
    };
    tryShow();
    const mo = new MutationObserver(tryShow);
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open || !mobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, mobile]);

  useEffect(() => {
    if (!open || mobile) return;
    const el = box.current;
    if (!el) return;

    let start: { x: number; y: number; left: number; top: number } | null = null;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest("button, input, label, a")) return;
      const z = siteZoom();
      const r = el.getBoundingClientRect();
      start = { x: e.clientX, y: e.clientY, left: r.left / z, top: r.top / z };
      setDragging(true);
    };

    const onMove = (e: PointerEvent) => {
      if (!start) return;
      const z = siteZoom();
      setPos(
        clamp(start.left + (e.clientX - start.x) / z, start.top + (e.clientY - start.y) / z, el),
      );
    };

    const onUp = () => {
      if (!start) return;
      start = null;
      setDragging(false);
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [open, mobile]);

  function close() {
    done.current = true;
    if (muteRef.current) {
      try {
        localStorage.setItem(STORE, todayStamp());
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
  }

  if (!open) return null;

  const sheet = (
    <aside
      ref={box}
      className={["home-pop", mobile ? "home-pop--sheet" : "", dragging ? "is-drag" : ""]
        .filter(Boolean)
        .join(" ")}
      role="dialog"
      aria-modal={mobile ? true : undefined}
      aria-label={POP.title}
      style={!mobile && pos ? { left: pos.left, top: pos.top } : undefined}
    >
      {mobile ? <span className="home-pop__handle" aria-hidden /> : null}
      <div className={POP.image ? "home-pop__shot has-img" : "home-pop__shot"}>
        {POP.image ? (
          <Image
            src={POP.image}
            alt={POP.title}
            fill
            sizes={mobile ? "100vw" : "36rem"}
            draggable={false}
          />
        ) : (
          <span>이미지 영역</span>
        )}
      </div>
      <div className="home-pop__bar">
        <label htmlFor={muteId}>
          <input
            id={muteId}
            type="checkbox"
            checked={mute}
            onChange={(e) => setMute(e.target.checked)}
          />
          오늘 하루 이 창을 열지 않음
        </label>
        <button type="button" className="home-pop__close" onClick={close}>
          CLOSE
        </button>
      </div>
    </aside>
  );

  return createPortal(
    mobile ? (
      <div className="home-pop-root">
        <button
          type="button"
          className="home-pop-root__dim"
          aria-label="닫기"
          onClick={close}
        />
        {sheet}
      </div>
    ) : (
      sheet
    ),
    document.body,
  );
}
