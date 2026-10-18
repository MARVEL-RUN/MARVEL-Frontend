"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MAIN_ASSETS } from "@/lib/assets";
import type { DiscountLinkEntry } from "@/lib/discount-link/config";
import { DiscountPartnerMark } from "./DiscountPartnerMark";

/* 응답이 빨라도 한 번은 보여 줌 */
const MIN_SHOW_MS = 1700;
const MIN_SHOW_REDUCED_MS = 500;
const OUT_MS = 650;

const PHASES = ["링크 확인", "할인 조건 불러오기", "접수 준비"] as const;

function phaseOf(pct: number) {
  if (pct < 34) return 0;
  if (pct < 72) return 1;
  return 2;
}

export function DiscountIntro({
  entry,
  settled,
  onDone,
}: {
  entry: DiscountLinkEntry;
  /** 성공·실패 상관없이 응답이 끝났는지 */
  settled: boolean;
  onDone: () => void;
}) {
  const [pct, setPct] = useState(4);
  const [out, setOut] = useState(false);
  const startedAt = useRef(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    startedAt.current = performance.now();
  }, []);

  useEffect(() => {
    if (out) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const minMs = reduced ? MIN_SHOW_REDUCED_MS : MIN_SHOW_MS;
    const id = window.setInterval(() => {
      const elapsed = performance.now() - startedAt.current;
      if (settled && elapsed >= minMs) {
        window.clearInterval(id);
        setPct(100);
        setOut(true);
        return;
      }
      const cap = settled ? 97 : 86;
      setPct((p) => Math.min(cap, p + Math.max(0.6, (cap - p) * 0.07)));
    }, 50);
    return () => window.clearInterval(id);
  }, [settled, out]);

  useEffect(() => {
    if (!out) return;
    const id = window.setTimeout(() => done.current(), OUT_MS);
    return () => window.clearTimeout(id);
  }, [out]);

  const phase = out ? PHASES.length : phaseOf(pct);
  const shown = Math.round(pct);

  return (
    <div
      className={out ? "dl-intro is-out" : "dl-intro"}
      role="status"
      aria-live="polite"
      aria-label={`${entry.title} 할인 링크 확인 중`}
    >
      <span className="dl-intro__grid" aria-hidden />
      <span className="dl-intro__glow" aria-hidden />

      <div className="dl-intro__core">
        <span className="dl-intro__logo" aria-hidden>
          <Image src={MAIN_ASSETS.introMarvel} alt="" width={219} height={99} priority />
          <Image src={MAIN_ASSETS.introRun} alt="" width={594} height={99} priority />
        </span>

        <div className="dl-intro__pass" aria-hidden>
          <span className="dl-intro__scan" />
          <div className="dl-intro__pass-top">
            <span className="dl-intro__label">SPECIAL ACCESS</span>
            {entry.partnerTag || entry.partnerLogo ? (
              <DiscountPartnerMark entry={entry} className="dl-intro__partner" />
            ) : null}
          </div>
          <strong className="dl-intro__title">{entry.title}</strong>
          <span className="dl-intro__en">{entry.en}</span>
          <span className="dl-intro__barcode" />
        </div>

        <ol className="dl-intro__phases">
          {PHASES.map((label, i) => (
            <li
              key={label}
              className={i < phase ? "is-done" : i === phase ? "is-on" : undefined}
            >
              <span className="dl-intro__dot" aria-hidden />
              {label}
            </li>
          ))}
        </ol>

        <div className="dl-intro__meter" aria-hidden>
          <span className="dl-intro__bar">
            <span className="dl-intro__fill" style={{ width: `${pct}%` }} />
          </span>
          <span className="dl-intro__pct">{String(shown).padStart(3, "0")}</span>
        </div>
      </div>
    </div>
  );
}
