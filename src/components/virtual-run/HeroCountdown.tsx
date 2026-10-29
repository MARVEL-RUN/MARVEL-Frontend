"use client";

import { useEffect, useState } from "react";
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
    return <p className="vr-hint">티켓 오픈 일정은 행사 안내를 확인해 주세요.</p>;
  }

  const cells = [
    { label: "DAY", value: slots.d },
    { label: "HOUR", value: slots.h },
    { label: "MIN", value: slots.m },
    { label: "SEC", value: slots.s },
  ];

  return (
    <div className="vr-countdown" aria-live="polite">
      {cells.map((cell) => (
        <div key={cell.label} className="vr-countdown__cell">
          <span className="vr-countdown__num">{cell.value}</span>
          <span className="vr-countdown__label">{cell.label}</span>
        </div>
      ))}
    </div>
  );
}
