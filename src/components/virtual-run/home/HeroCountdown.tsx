"use client";

import { Fragment, useEffect, useState } from "react";
import { countdownSlotsTo } from "@/lib/register-schedule";
import { VIRTUAL_RUN_EVENT } from "@/lib/virtual-run/event";

const targetMs = Date.parse(VIRTUAL_RUN_EVENT.countdownTarget);

export function HeroCountdown() {
  const [slots, setSlots] = useState(() => countdownSlotsTo(targetMs));

  useEffect(() => {
    const tick = () => setSlots(countdownSlotsTo(targetMs));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!slots) {
    return <p className="vr-form-note">티켓 오픈 일정은 행사 안내를 확인해 주세요.</p>;
  }

  const units = [
    [slots.d, "DAY"],
    [slots.h, "HR"],
    [slots.m, "MIN"],
    [slots.s, "SEC"],
  ] as const;

  return (
    <div className="vr-home__countdown" role="timer" aria-live="polite">
      {units.map(([n, u], i) => (
        <Fragment key={u}>
          {i > 0 ? (
            <span className="vr-home__countdown-sep" aria-hidden>
              :
            </span>
          ) : null}
          <span className="vr-home__countdown-unit">
            <span className="vr-home__countdown-value">{n}</span>
            <span className="vr-home__countdown-label">{u}</span>
          </span>
        </Fragment>
      ))}
    </div>
  );
}
