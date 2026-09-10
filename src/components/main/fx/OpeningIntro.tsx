"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MAIN_ASSETS } from "@/lib/assets";

/* prev면 이전 패널 5장 */
const INTRO_PANELS = "current" as "prev" | "current";

const SHOTS_PREV = [
  { src: MAIN_ASSETS.introPrevCyclops, name: "cyclops", w: 684, h: 1152 },
  { src: MAIN_ASSETS.introPrevThing, name: "thing", w: 681, h: 1149 },
  { src: MAIN_ASSETS.introPrevThor, name: "thor", w: 679, h: 1146 },
  { src: MAIN_ASSETS.introPrevPanther, name: "panther", w: 679, h: 1146 },
  { src: MAIN_ASSETS.introPrevDoom, name: "doom", w: 684, h: 1151 },
] as const;

const SHOTS_CURRENT = [
  { src: MAIN_ASSETS.introCyclops, name: "cyclops", w: 1201, h: 1631 },
  { src: MAIN_ASSETS.introThing, name: "thing", w: 2140, h: 2122 },
  { src: MAIN_ASSETS.introDoom, name: "doom", w: 1943, h: 1779 },
  { src: MAIN_ASSETS.introThor, name: "thor", w: 2288, h: 2138 },
  { src: MAIN_ASSETS.introFalcon, name: "falcon", w: 2085, h: 2008 },
] as const;

const SHOTS = INTRO_PANELS === "prev" ? SHOTS_PREV : SHOTS_CURRENT;

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
    const out = window.setTimeout(
      () => closeIntro(),
      INTRO_PANELS === "current" ? 4100 : 4000,
    );
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
      className={[
        "intro",
        phase === "out" ? "is-out" : "",
        INTRO_PANELS === "current" ? "intro--overlap" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role="dialog"
      aria-label="MARVEL RUN 오프닝"
    >
      <div className="intro__panels">
        <div className="intro__assemble">
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
