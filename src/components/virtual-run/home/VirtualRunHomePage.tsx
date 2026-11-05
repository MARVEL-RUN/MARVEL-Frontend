"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { COMING_SOON_ASSETS, MAIN_ASSETS } from "@/lib/assets";
import { VIRTUAL_RUN_ASSETS } from "@/lib/virtual-run/assets";
import { VR_HOME_CURSOR_FX } from "@/lib/virtual-run/home-fx";
import {
  VIRTUAL_RUN_EVENT,
  VIRTUAL_RUN_OVERVIEW_ROWS,
} from "@/lib/virtual-run/event";
import { MOBILE_WIDTH_MQ } from "@/lib/viewport";
import { KeyVisualCopyright } from "../../main/layout/KeyVisualCopyright";
import { VirtualRunTicketsCta } from "../layout/VirtualRunTicketsCta";
import { VrLink } from "../layout/VrLink";
import { HeroCountdown } from "./HeroCountdown";
import { HomeCursors } from "./HomeCursors";
import { ScrambleText } from "../fx/ScrambleText";

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
        </div>
        <span className="hero__shade" aria-hidden />
        <div
          className={figureIn ? "vr-home__figure is-in" : "vr-home__figure"}
          aria-hidden
        >
          <picture className="vr-home__figure-picture">
            <source
              media={MOBILE_WIDTH_MQ}
              srcSet={VIRTUAL_RUN_ASSETS.heroFigureMobile}
              type="image/webp"
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- picture로 모바일/PC 분기 */}
            <img
              src={VIRTUAL_RUN_ASSETS.heroFigure}
              alt=""
              width={3039}
              height={3459}
              draggable={false}
              className="vr-home__figure-art"
            />
          </picture>
        </div>
        <span className="hero__slash" aria-hidden />

        <div className={glitchOn ? "hero__copy is-held" : "hero__copy"}>
          <Image
            src={COMING_SOON_ASSETS.logo}
            alt={VIRTUAL_RUN_EVENT.title}
            width={1057}
            height={514}
            priority
            className="hero__logo"
            data-vr-pick="LOGO"
          />
          <p className="hero__lead vr-home__plan">
            <span data-vr-pick="TEXT">
              <ScrambleText text={VIRTUAL_RUN_EVENT.planLabel} delay={glitchOn ? undefined : 40} hover={false} />
            </span>
          </p>
          <p className="hero__meta">
            <span className="vr-home__meta-text" data-vr-pick="TEXT">
              <ScrambleText
                text={`${VIRTUAL_RUN_EVENT.schedule} · ${VIRTUAL_RUN_EVENT.location}`}
                delay={glitchOn ? undefined : 110}
                hover={false}
              />
            </span>
          </p>
          <div className="hero__actions">
            <div className="hero__guide">
              <HeroCountdown reveal={!glitchOn} />
              <div className="hero__cta-row vr-home__cta" data-vr-pick="BUTTON">
                <VrLink href="/event" className="btn btn--ghost">
                  <ScrambleText text="행사 안내" delay={glitchOn ? undefined : 180} hover={false} />
                </VrLink>
                <VirtualRunTicketsCta />
              </div>
              <KeyVisualCopyright />
            </div>
          </div>
        </div>
      </section>
      {VR_HOME_CURSOR_FX ? <HomeCursors startDelay={HERO_GLITCH_MS} /> : null}

      <div className="vr-ticker" aria-hidden>
        <div className="vr-ticker__track">
          {[0, 1].map((copy) => (
            <ul key={copy}>
              {TICKER.map((bit) => (
                <li
                  key={`${copy}-${bit}`}
                  className={/[가-힣]/.test(bit) ? "is-ko" : undefined}
                >
                  <ScrambleText text={bit} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <section className="sec guide-sec vr-home__trailer" id="trailer">
        <div className="wrap reveal">
          <p className="kicker">TRAILER</p>
          <h2 className="sec__title">
            [어벤져스: 둠스데이] <em>&apos;둠의 심판&apos; 예고편</em>
          </h2>
          <div className="vr-home__trailer-stage">
            <figure className="vr-home__poster">
              <Image
                src={VIRTUAL_RUN_ASSETS.doomsdayPoster}
                alt="어벤져스: 둠스데이, 12월 16일 극장 대개봉"
                width={1978}
                height={2835}
              />
            </figure>
            <div className="vr-home__trailer-frame">
              <video
                className="vr-home__trailer-video"
                src={MAIN_ASSETS.doomsdayTrailer}
                autoPlay
                muted
                controls
                playsInline
                preload="auto"
                aria-label="어벤져스: 둠스데이 둠의 심판 예고편"
              />
            </div>
          </div>
        </div>
      </section>

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
