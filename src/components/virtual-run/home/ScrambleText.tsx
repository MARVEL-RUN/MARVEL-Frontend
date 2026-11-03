"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  text: string;
  className?: string;
  autoplayDelay?: number;
  duration?: number;
};

const LATIN = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/<>";
const HANGUL = "마블런버추얼어벤져스엑스맨판타스틱완주인증회차";
const FRAME_MS = 42;

const pick = (set: string) => set[Math.floor(Math.random() * set.length)];

function noise(ch: string) {
  if (ch === " " || /[·.,:()\-–]/.test(ch)) return ch;
  return /[가-힣]/.test(ch) ? pick(HANGUL) : pick(LATIN);
}

export function ScrambleText({ text, className, autoplayDelay, duration = 620 }: Props) {
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
    if (el) el.style.width = `${el.offsetWidth}px`;
    const chars = Array.from(text);
    const start = performance.now();
    timerRef.current = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / duration);
      const settled = Math.floor(t * chars.length);
      setShown(chars.map((ch, i) => (i < settled ? ch : noise(ch))).join(""));
      if (t >= 1) {
        stop();
        setShown(text);
      }
    }, FRAME_MS);
  }, [duration, stop, text]);

  useEffect(() => {
    if (autoplayDelay === undefined) return stop;
    const id = window.setTimeout(run, autoplayDelay);
    return () => {
      window.clearTimeout(id);
      stop();
    };
  }, [autoplayDelay, run, stop]);

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
