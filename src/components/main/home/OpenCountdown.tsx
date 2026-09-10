"use client";

import { Fragment, useEffect, useState } from "react";
import { EVENT } from "@/lib/event";

const OPEN_AT = Date.parse(EVENT.openAt);

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

export function OpenCountdown() {
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
