"use client";

import { useEffect, useRef } from "react";

type CursorTextMode = "repel" | "glow";

type Props = {
  text: string;
  mode: CursorTextMode;
  radius?: number;
  className?: string;
};

const PUSH_PX = 34;

export function CursorText({ text, mode, radius = 140, className }: Props) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const chars = Array.from(root.querySelectorAll<HTMLElement>(".vr-ctext__char"));
    let pointer: { x: number; y: number } | null = null;
    let frame = 0;
    let active = false;

    const reset = () => {
      if (!active) return;
      active = false;
      for (const el of chars) {
        el.style.removeProperty("--p");
        el.style.removeProperty("--tx");
        el.style.removeProperty("--ty");
        el.style.removeProperty("--rot");
      }
    };

    const tick = () => {
      frame = 0;
      if (!pointer) return reset();
      // html zoom이 걸리면 rect는 zoom 전 좌표, 마우스는 화면 좌표
      const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
      const px = pointer.x / zoom;
      const py = pointer.y / zoom;
      const box = root.getBoundingClientRect();
      if (
        px < box.left - radius ||
        px > box.right + radius ||
        py < box.top - radius ||
        py > box.bottom + radius
      ) {
        return reset();
      }
      active = true;
      for (const el of chars) {
        const cx = box.left + el.offsetLeft + el.offsetWidth / 2;
        const cy = box.top + el.offsetTop + el.offsetHeight / 2;
        const dx = cx - px;
        const dy = cy - py;
        const d = Math.hypot(dx, dy) || 1;
        const p = Math.max(0, 1 - d / radius);
        if (mode === "glow") {
          el.style.setProperty("--p", p.toFixed(3));
          continue;
        }
        const push = p * p * PUSH_PX;
        el.style.setProperty("--tx", `${((dx / d) * push).toFixed(1)}px`);
        el.style.setProperty("--ty", `${((dy / d) * push).toFixed(1)}px`);
        el.style.setProperty("--rot", `${((dx / d) * p * 18).toFixed(1)}deg`);
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY };
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", schedule);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [mode, radius]);

  const words = text.split(" ");

  return (
    <span
      ref={rootRef}
      className={`vr-ctext vr-ctext--${mode}${className ? ` ${className}` : ""}`}
    >
      <span className="vr-ctext__sr">{text}</span>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden>
          <span className="vr-ctext__word">
            {Array.from(word).map((ch, ci) => (
              <span key={ci} className="vr-ctext__char">
                {ch}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
