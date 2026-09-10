"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "마블런" },
  { id: "courses", label: "코스", pad: 170 },
  { id: "schedule", label: "타임라인", pad: 80 },
  { id: "venue", label: "장소", pad: 170 },
  { id: "assemble", label: "접수", pad: 170 },
] as const;

export function SideDock() {
  const [active, setActive] = useState<string>("hero");
  const jumping = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (jumping.current) return;
      const line = window.innerHeight * 0.32;
      let current = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function jump(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    jumping.current = true;
    setActive(id);

    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    } else {
      let top = 0;
      for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) {
        top += n.offsetTop;
      }
      const zoom = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
      const pad = SECTIONS.find((s) => s.id === id)?.pad ?? 80;
      window.scrollTo({
        top: Math.max(0, (top - pad) * zoom),
        behavior: reduce ? "auto" : "smooth",
      });
    }

    window.setTimeout(() => {
      jumping.current = false;
    }, 1100);
  }

  return (
    <nav className="side-dock" aria-label="바로가기">
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          className={active === s.id ? "is-on" : undefined}
          aria-current={active === s.id ? "true" : undefined}
          onClick={() => jump(s.id)}
        >
          {s.label}
        </button>
      ))}
      <Link href="/virtual" className="side-dock__go">
        버추얼런
      </Link>
      <button
        type="button"
        className="side-dock__top"
        aria-label="맨 위로"
        onClick={() => jump("hero")}
      >
        <span aria-hidden />
      </button>
    </nav>
  );
}
