"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MAIN_ASSETS } from "@/lib/assets";

const SHOTS = [
  { src: MAIN_ASSETS.introCyclops, name: "cyclops", w: 684, h: 1152 },
  { src: MAIN_ASSETS.introThing, name: "thing", w: 681, h: 1149 },
  { src: MAIN_ASSETS.introThor, name: "thor", w: 679, h: 1146 },
  { src: MAIN_ASSETS.introPanther, name: "panther", w: 679, h: 1146 },
  { src: MAIN_ASSETS.introDoom, name: "doom", w: 684, h: 1151 },
] as const;

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
    const out = window.setTimeout(() => closeIntro(), 4200);
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
        {SHOTS.map((shot) => (
          <span
            key={shot.name}
            className={`intro__shot intro__shot--${shot.name}`}
            aria-hidden
          >
            <Image
              src={shot.src}
              alt=""
              width={shot.w}
              height={shot.h}
              className="intro__shot-img"
              priority
            />
          </span>
        ))}
      </div>

      <span className="intro__flash" aria-hidden />
      <div className="intro__logo">
        <Image
          src={MAIN_ASSETS.introMarvel}
          alt="MARVEL"
          width={219}
          height={99}
          className="intro__box"
          priority
        />
        <Image
          src={MAIN_ASSETS.introRun}
          alt="RUN"
          width={594}
          height={99}
          className="intro__run"
          priority
        />
        <Image
          src={MAIN_ASSETS.introKorea}
          alt="2026 KOREA"
          width={282}
          height={28}
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
