"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MAIN_ASSETS } from "@/lib/assets";
import { EVENT } from "@/lib/event";

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
  const [mute, setMute] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const muteId = useId();
  const done = useRef(false);
  const muteRef = useRef(false);
  const box = useRef<HTMLElement>(null);

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
    if (!open) return;
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
  }, [open]);

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

  return createPortal(
    <aside
      ref={box}
      className={dragging ? "home-pop is-drag" : "home-pop"}
      role="dialog"
      aria-labelledby="home-pop-title"
      style={pos ? { left: pos.left, top: pos.top } : undefined}
    >
      <div className="home-pop__brand">
        <p className="home-pop__tag">NOTICE</p>
        <Image
          src={MAIN_ASSETS.headerLogo}
          alt=""
          width={206}
          height={94}
          draggable={false}
        />
      </div>
      <div className="home-pop__body">
        <h2 id="home-pop-title">{POP.title}</h2>
        {POP.body.map((line) => (
          <p key={line}>{line}</p>
        ))}
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
    </aside>,
    document.body,
  );
}
