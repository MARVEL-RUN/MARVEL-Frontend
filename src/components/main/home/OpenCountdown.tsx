"use client";

import { Fragment, useEffect, useState } from "react";
import { EVENT } from "@/lib/event";

const OPEN_AT = Date.parse(EVENT.openAt);

export const OPEN_STAMP = (() => {
  const m = EVENT.openAt.match(/^\d{4}-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return { date: "9.22", time: "14:00" };
  return { date: `${Number(m[1])}.${m[2]}`, time: `${m[3]}:${m[4]}` };
})();

type Left = { d: string; h: string; m: string; s: string };

function parts(now: number): Left | null {
  const ms = OPEN_AT - now;
  if (ms <= 0) return null;
  const sec = Math.floor(ms / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    d: pad(Math.floor(sec / 86400)),
    h: pad(Math.floor((sec % 86400) / 3600)),
    m: pad(Math.floor((sec % 3600) / 60)),
    s: pad(sec % 60),
  };
}

export function useOpenLeft() {
  const [left, setLeft] = useState<Left | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tick = () => {
      setLeft(parts(Date.now()));
      setReady(true);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return { left, ready };
}

export function OpenDday({ className }: { className?: string }) {
  const { left, ready } = useOpenLeft();
  const label = !ready ? "D - --" : left ? `D - ${Number(left.d)}` : "OPEN";

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
