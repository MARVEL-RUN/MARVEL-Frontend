"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SCRAMBLE_FRAME_MS, scrambleFrame } from "./scramble";

type Props = {
  text: string;
  className?: string;
  duration?: number;
  /** 주면 마운트 후 이만큼 뒤에 한 번 재생 */
  delay?: number;
  /** 화면에 들어올 때 한 번 재생 */
  inView?: boolean;
  /** false면 호버로는 재생하지 않음 */
  hover?: boolean;
};

export function ScrambleText({
  text,
  className,
  duration = 620,
  delay,
  inView = false,
  hover = true,
}: Props) {
  const [shown, setShown] = useState(text);
  const elRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);
  const textRef = useRef(text);
  textRef.current = text;

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
    const chars = Array.from(textRef.current);
    const start = performance.now();
    timerRef.current = window.setInterval(() => {
      const t = Math.min(1, (performance.now() - start) / duration);
      setShown(scrambleFrame(chars, t));
      if (t >= 1) {
        stop();
        setShown(textRef.current);
      }
    }, SCRAMBLE_FRAME_MS);
  }, [duration, stop]);

  useEffect(() => {
    if (delay === undefined) return;
    const id = window.setTimeout(run, delay);
    return () => window.clearTimeout(id);
  }, [delay, run]);

  useEffect(() => {
    if (!inView) return;
    const el = elRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        io.disconnect();
        run();
      },
      { threshold: 0.6, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, run]);

  useEffect(() => {
    if (timerRef.current !== null) return;
    setShown(text);
  }, [text]);

  useEffect(() => stop, [stop]);

  return (
    <span
      ref={elRef}
      className={`vr-scramble${className ? ` ${className}` : ""}`}
      onPointerEnter={hover ? run : undefined}
    >
      {shown}
    </span>
  );
}
