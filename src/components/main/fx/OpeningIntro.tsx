"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { COMING_SOON_ASSETS, MAIN_ASSETS } from "@/lib/assets";

const PANELS = [
  { pos: "12% 42%", tint: "rgba(237, 29, 36, 0.35)" },
  { pos: "32% 38%", tint: "rgba(78, 200, 224, 0.28)" },
  { pos: "52% 30%", tint: "rgba(31, 107, 69, 0.32)" },
  { pos: "72% 40%", tint: "rgba(224, 195, 106, 0.28)" },
  { pos: "90% 48%", tint: "rgba(122, 107, 255, 0.32)" },
  { pos: "40% 70%", tint: "rgba(0, 0, 0, 0.15)" },
  { pos: "8% 18%", tint: "rgba(237, 29, 36, 0.22)" },
];

export function OpeningIntro() {
  const [phase, setPhase] = useState<"play" | "out" | "gone">("play");
  const done = useRef(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      document.documentElement.classList.add("is-live");
      setPhase("gone");
      return;
    }

    document.documentElement.classList.add("is-intro");
    const out = window.setTimeout(() => closeIntro(), 4000);
    return () => {
      window.clearTimeout(out);
      document.documentElement.classList.remove("is-intro");
    };
  }, []);

  function closeIntro() {
    if (done.current) return;
    done.current = true;
    document.documentElement.classList.remove("is-intro");
    document.documentElement.classList.add("is-live");
    setPhase("out");
    window.setTimeout(() => setPhase("gone"), 700);
  }

  if (phase === "gone") return null;

  return (
    <div
      className={phase === "out" ? "intro is-out" : "intro"}
      role="dialog"
      aria-label="MARVEL RUN 오프닝"
    >
      <div className="intro__panels">
        {PANELS.map((p, i) => (
          <span
            key={p.pos}
            className={`intro__panel intro__panel--${i + 1}`}
            style={{
              backgroundImage: `linear-gradient(${p.tint}, ${p.tint}), url(${COMING_SOON_ASSETS.hero})`,
              backgroundPosition: p.pos,
            }}
          />
        ))}
      </div>
      <span className="intro__flash" aria-hidden />
      <div className="intro__logo">
        <Image
          src={MAIN_ASSETS.introMarvel}
          alt="MARVEL"
          width={437}
          height={197}
          className="intro__box"
          priority
        />
        <Image
          src={MAIN_ASSETS.introRun}
          alt="RUN"
          width={1188}
          height={197}
          className="intro__run"
          priority
        />
        <Image
          src={MAIN_ASSETS.introKorea}
          alt="2026 KOREA"
          width={564}
          height={56}
          className="intro__sub"
          priority
        />
      </div>
      <button type="button" className="intro__skip" onClick={closeIntro}>
        SKIP
      </button>
    </div>
  );
}
