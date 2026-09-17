"use client";

import { Fragment, useEffect, useState } from "react";
import { EVENT } from "@/lib/event";

const OPEN_AT = Date.parse(EVENT.openAt);

type Left = { n: number; d: string; h: string; m: string; s: string };

function kstYmd(ms: number) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(ms);
}

function calendarDaysLeft(now: number) {
  const from = Date.parse(`${kstYmd(now)}T00:00:00+09:00`);
  const to = Date.parse(`${kstYmd(OPEN_AT)}T00:00:00+09:00`);
  return Math.max(0, Math.round((to - from) / 86_400_000));
}

function parts(now: number): Left | null {
  const ms = OPEN_AT - now;
  if (ms <= 0) return null;
  const sec = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    n: calendarDaysLeft(now),
    d: pad(Math.floor(sec / 86400)),
    h: pad(Math.floor((sec % 86400) / 3600)),
    m: pad(Math.floor((sec % 3600) / 60)),
    s: pad(sec % 60),
  };
}

export function openLeftNow() {
  return parts(Date.now());
}

export function useOpenLeft(enabled = true) {
  const [left, setLeft] = useState<Left | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const tick = () => {
      setLeft(parts(Date.now()));
      setReady(true);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [enabled]);

  return { left, ready };
}

export function OpenDday({ className }: { className?: string }) {
  const { left, ready } = useOpenLeft();
  const label = !ready ? "D - --" : left ? `D - ${left.n}` : "OPEN";

  return <span className={className}>{label}</span>;
}

export function OpenCountdown() {
  const { left, ready } = useOpenLeft();
  if (ready && !left) return null;

  const slots = left ?? { d: "--", h: "--", m: "--", s: "--" };
  const units = [
    [slots.d, "DAY"],
    [slots.h, "HR"],
    [slots.m, "MIN"],
    [slots.s, "SEC"],
  ] as const;

  return (
    <div className="assemble__count" aria-hidden={!left}>
      {units.map(([n, u], i) => (
        <Fragment key={u}>
          {i > 0 ? <i aria-hidden>:</i> : null}
          <span className="assemble__tick">
            <strong>{n}</strong>
            <em>{u}</em>
          </span>
        </Fragment>
      ))}
    </div>
  );
}
