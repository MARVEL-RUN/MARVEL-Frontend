"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SCRAMBLE_FRAME_MS, scrambleFrame } from "./scramble";

type Props = {
  text: string;
  className?: string;
  duration?: number;
  /** 주면 마운트 후 이만큼 뒤에 한 번 재생 */
  delay?: number;
};

export function ScrambleText({ text, className, duration = 620, delay }: Props) {
  const [shown, setShown] = useState(text);
  const elRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    elRef.current?.style.removeProperty("width");
  }, []);

  const run = useCallback(() => {
    if (timerRef.current !== null) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = elRef.current;
    if (el?.offsetWidth) el.style.width = `${el.offsetWidth}px`;
    const chars = Array.from(text);
    const start = performance.now();
    timerRef.current = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / duration);
      setShown(scrambleFrame(chars, t));
      if (t >= 1) {
        stop();
        setShown(text);
      }
    }, SCRAMBLE_FRAME_MS);
  }, [duration, stop, text]);

  useEffect(() => {
    if (delay === undefined) return;
    const id = window.setTimeout(run, delay);
    return () => window.clearTimeout(id);
  }, [delay, run]);

  useEffect(() => stop, [stop]);

  return (
    <span
      ref={elRef}
      className={`vr-scramble${className ? ` ${className}` : ""}`}
      onPointerEnter={run}
    >
      {shown}
    </span>
  );
}
