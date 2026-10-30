"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { COMING_SOON_ASSETS } from "@/lib/assets";
import { VIRTUAL_RUN_ASSETS } from "@/lib/virtual-run/assets";
import {
  VIRTUAL_RUN_EVENT,
  VIRTUAL_RUN_OVERVIEW_ROWS,
} from "@/lib/virtual-run/event";
import { KeyVisualCopyright } from "../../main/layout/KeyVisualCopyright";
import { VrLink } from "../layout/VrLink";
import { HeroCountdown } from "./HeroCountdown";

const TICKER = [
  "버추얼런",
  "MARVEL RUN 2026",
  "VIRTUAL RUN",
  "5K ANYWHERE",
  "KOREA",
  "ONLINE",
];

const HERO_FIGURE_IN_MS = 380;
const HERO_GLITCH_MS = 980;

export function VirtualRunHomePage() {
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [glitchOn, setGlitchOn] = useState(true);
  const [figureIn, setFigureIn] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setGlitchOn(false);
      setFigureIn(true);
      return;
    }
    const figureTimer = window.setTimeout(() => setFigureIn(true), HERO_FIGURE_IN_MS);
    const glitchTimer = window.setTimeout(() => setGlitchOn(false), HERO_GLITCH_MS);
    return () => {
      window.clearTimeout(figureTimer);
      window.clearTimeout(glitchTimer);
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const root = rootRef.current;
    if (!hero || !root) return;

    const onMove = (e: globalThis.MouseEvent) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", `${e.clientX - r.left}px`);
      hero.style.setProperty("--my", `${e.clientY - r.top}px`);
    };

    const onScroll = () => {
      hero.style.setProperty("--py", `${window.scrollY * 0.22}px`);
    };

    const nodes = root.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -10% 0px" },
    );
    nodes.forEach((n) => io.observe(n));

    hero.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      hero.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  return (
    <main className="home vr-home" ref={rootRef}>
      <section className="hero hero--vr-split" id="hero" ref={heroRef}>
        {glitchOn ? (
          <span className="vr-home__glitch" aria-hidden>
            <span className="vr-home__glitch__rgb vr-home__glitch__rgb--a" />
            <span className="vr-home__glitch__rgb vr-home__glitch__rgb--b" />
            <span className="vr-home__glitch__cut vr-home__glitch__cut--a" />
            <span className="vr-home__glitch__cut vr-home__glitch__cut--b" />
            <span className="vr-home__glitch__cut vr-home__glitch__cut--c" />
            <span className="vr-home__glitch__scan" />
          </span>
        ) : null}
        <div className="vr-home__stage" aria-hidden>
          <div className="vr-home__banner">
            <Image
              src={VIRTUAL_RUN_ASSETS.banner}
              alt=""
              fill
              priority
              sizes="(max-width: 720px) 55vw, 42vw"
              className="vr-home__banner-art"
            />
          </div>
          <div className={figureIn ? "vr-home__figure is-in" : "vr-home__figure"}>
            <Image
              src={VIRTUAL_RUN_ASSETS.heroFigure}
              alt=""
              fill
              priority
              sizes="(max-width: 720px) 50vw, 38vw"
              className="vr-home__figure-art"
            />
          </div>
        </div>
        <span className="hero__shade" aria-hidden />
        <span className="hero__slash" aria-hidden />

        <div className="hero__copy">
          <Image
            src={COMING_SOON_ASSETS.logo}
            alt={VIRTUAL_RUN_EVENT.title}
            width={1057}
            height={514}
            priority
            className="hero__logo"
          />
          <p className="hero__lead vr-home__plan">
            <span>{VIRTUAL_RUN_EVENT.planLabel}</span>
          </p>
          <p className="hero__meta">
            {VIRTUAL_RUN_EVENT.schedule}
            <span aria-hidden> · </span>
            {VIRTUAL_RUN_EVENT.location}
          </p>
          <div className="hero__actions">
            <div className="hero__guide">
              <HeroCountdown />
              <div className="hero__cta-row vr-home__cta">
                <VrLink href="/event" className="btn btn--ghost">
                  행사 안내
                </VrLink>
                <VrLink href="/tickets" className="btn btn--red">
                  티켓 구매
                </VrLink>
              </div>
              <KeyVisualCopyright />
            </div>
          </div>
        </div>
      </section>

      <div className="vr-ticker" aria-hidden>
        <div className="vr-ticker__track">
          {[0, 1].map((copy) => (
            <ul key={copy}>
              {TICKER.map((bit) => (
                <li
                  key={`${copy}-${bit}`}
                  className={/[가-힣]/.test(bit) ? "is-ko" : undefined}
                >
                  {bit}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <section className="sec guide-sec vr-home__overview" id="overview">
        <div className="wrap reveal">
          <p className="kicker">OVERVIEW</p>
          <h2 className="sec__title">
            {VIRTUAL_RUN_EVENT.title}
          </h2>
          <dl className="spec">
            {VIRTUAL_RUN_OVERVIEW_ROWS.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
