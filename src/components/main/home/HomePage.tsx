"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { EVENT } from "@/lib/event";
import { COMING_SOON_ASSETS } from "@/lib/assets";
import { REGISTER_HREF, registerUiOpen } from "@/lib/mode";
import type { CourseId } from "@/lib/register";
import { CoursePreview } from "../guide/CoursePreview";
import { OpeningIntro } from "../fx/OpeningIntro";
import { OpenCountdown, OpenDday } from "./OpenCountdown";
import { HomePopup } from "./HomePopup";
import { SideDock } from "./SideDock";

const TICKER = [
  "MARVEL RUN 2026",
  "9.22 14:00 OPEN",
  "INJE SPEEDIUM",
  "10.31 SAT",
  "ASSEMBLE",
  "KOREA",
];

export function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const [previewId, setPreview] = useState<CourseId | null>(null);
  const [venueCourse, setVenueCourse] = useState(0);
  const [venuePrev, setVenuePrev] = useState(0);
  const [venueFx, setVenueFx] = useState(0);
  const preview = EVENT.courses.find((c) => c.id === previewId);
  const cta = registerUiOpen ? "참가신청" : "9.22 접수 OPEN";

  function goAssemble(e: MouseEvent<HTMLAnchorElement>) {
    const el = document.getElementById("assemble");
    if (!el) return;
    e.preventDefault();
    let top = 0;
    for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) {
      top += n.offsetTop;
    }
    const zoom = Number.parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: Math.max(0, (top - 170) * zoom),
      behavior: reduce ? "auto" : "smooth",
    });
  }

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

  useEffect(() => {
    const id = window.setInterval(() => {
      setVenueCourse((i) => {
        setVenuePrev(i);
        return (i + 1) % EVENT.courses.length;
      });
      setVenueFx((n) => n + 1);
    }, 6500);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main className="home" ref={rootRef}>
      <OpeningIntro />

      <section className="hero" id="hero" ref={heroRef}>
        <div className="hero__art" aria-hidden>
          <Image
            src={COMING_SOON_ASSETS.hero}
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero__img"
          />
        </div>
        <span className="hero__shade" aria-hidden />
        <span className="hero__halftone" aria-hidden />
        <span className="hero__lines" aria-hidden />
        <span className="hero__bloom" aria-hidden />
        <span className="hero__spot" aria-hidden />
        <span className="hero__sweep" aria-hidden />
        <span className="hero__slash" aria-hidden />

        <div className="hero__copy">
          <p className="kicker">{EVENT.kicker}</p>
          <Image
            src={COMING_SOON_ASSETS.logo}
            alt={EVENT.title}
            width={1057}
            height={514}
            priority
            className="hero__logo"
          />
          <a
            href="#assemble"
            className="hero__dday"
            onClick={goAssemble}
            aria-label={`${EVENT.openNoticeDate} ${EVENT.openNoticeTime} ${EVENT.openNoticeAction}`}
          >
            <span className="hero__open">
              <span>접수</span>
              <span>OPEN</span>
            </span>
            <OpenDday />
          </a>
          <p className="hero__lead">{EVENT.lead}</p>
          <p className="hero__meta">
            {EVENT.dateShort}
            <span aria-hidden> · </span>
            {EVENT.venueEn}
          </p>
          <div className="hero__actions">
            <Link href="/guide" className="btn btn--ghost">
              대회안내
            </Link>
            <Link href={REGISTER_HREF} className="btn btn--red">
              {cta}
            </Link>
          </div>
        </div>
      </section>

      <div className="ticker" aria-hidden>
        <div className="ticker__track">
          {[0, 1].map((copy) => (
            <ul key={copy}>
              {TICKER.map((bit) => (
                <li key={`${copy}-${bit}`}>{bit}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <section className="sec about">
        <div className="wrap reveal">
          <div className="about__copy">
            <p className="kicker">01 / ORIGIN</p>
            <h2 className="sec__title">
              이건 당신의
              <br />
              <em>ORIGIN STORY</em>
            </h2>
            <p className="sec__body">
              2026년 10월 31일, 인제스피디움. 캡틴부터 둠까지 — 히어로들이
              같은 출발선에 선다. 배번호를 다는 순간, 당신도 그 세계의 일원이다.
            </p>
            <p className="sec__body">
              미션을 선택하고, 피니시 게이트를 통과하여 완수하라!
              <br />
              히어로는 태어나는 것이 아닌, 완주하는 것이다.
            </p>
          </div>
          <ul className="about__stats">
            {EVENT.stats.map((s) => (
              <li key={s.label}>
                <strong>
                  {s.value.split(" / ").flatMap((part, i) => [
                    i > 0 ? <i key={`sep-${s.label}-${i}`}>/</i> : null,
                    <b key={`num-${s.label}-${i}`}>{part}</b>,
                  ])}
                  {s.unit ? <span>{s.unit}</span> : null}
                </strong>
                <em>{s.label}</em>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec courses">
        <div className="wrap reveal" id="courses">
          <p className="kicker">02 / MISSIONS</p>
          <h2 className="sec__title">
            미션을 <em>선택하라</em>
          </h2>
          <ul className="courses__grid">
            {EVENT.courses.map((c) => (
              <li key={c.id} className={`course course--${c.tone}`}>
                <button
                  type="button"
                  className="course__map"
                  onClick={() => setPreview(c.id)}
                  aria-label={`${c.distance} 코스도 미리보기`}
                >
                  <Image
                    src={c.map}
                    alt=""
                    fill
                    sizes="(max-width: 960px) 100vw, 33vw"
                  />
                </button>
                <p className="course__code">{c.code}</p>
                <p className="course__dist">{c.distance}</p>
                <p className="course__desc">{c.desc}</p>
                <dl>
                  <div>
                    <dt>스타트</dt>
                    <dd>{c.start}</dd>
                  </div>
                  <div>
                    <dt>참가비</dt>
                    <dd>{c.fee}</dd>
                  </div>
                  <div>
                    <dt>어린이</dt>
                    <dd>{"childFee" in c ? c.childFee : "어린이 참가 불가"}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {preview ? (
        <CoursePreview course={preview} onClose={() => setPreview(null)} />
      ) : null}

      <section className="sec venue">
        <div className="wrap venue__grid reveal" id="venue">
          <div>
            <p className="kicker">03 / LOCATION</p>
            <h2 className="sec__title">
              {EVENT.venue}
              <br />
              <em>{EVENT.venueEn}</em>
            </h2>
            <p className="sec__body">{EVENT.venueAddress}</p>
            <p className="sec__body">
              자동차가 질주하던 인제 스피디움 서킷,
              <br />
              이번에는 히어로들이 두 발로 달린다.
            </p>
            <Link href="/directions" className="btn btn--ghost">
              오시는길
            </Link>
          </div>
          <div className="venue__panel" aria-hidden>
            {EVENT.courses.map((c, i) => (
              <div
                key={c.id}
                className={[
                  "venue__slide",
                  `venue__slide--${c.tone}`,
                  i === venueCourse ? "is-on" : "",
                  i === venuePrev && i !== venueCourse ? "is-under" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className={`venue__hero venue__hero--${c.id}`}>
                  <Image
                    src={c.figure}
                    alt=""
                    fill
                    sizes="(max-width: 960px) 80vw, 420px"
                    style={{ objectFit: "contain", objectPosition: "right bottom" }}
                  />
                </span>
                <span className="venue__dist">{c.distance}</span>
                <span>START / FINISH</span>
                <span>CHECKERED</span>
              </div>
            ))}
            <span key={venueFx} className="venue__glitch">
              <span className="venue__glitch__rgb venue__glitch__rgb--red" />
              <span className="venue__glitch__rgb venue__glitch__rgb--cyan" />
              <span className="venue__glitch__cut venue__glitch__cut--a" />
              <span className="venue__glitch__cut venue__glitch__cut--b" />
              <span className="venue__glitch__cut venue__glitch__cut--c" />
              <span className="venue__glitch__scan" />
            </span>
          </div>
        </div>
      </section>

      <section className="assemble" id="assemble">
        <p className="assemble__ghost" aria-hidden>
          ASSEMBLE
        </p>
        <div className="assemble__inner reveal">
          <p className="kicker kicker--on-red">OPEN</p>
          <h2>
            {EVENT.openNoticeDate}
            <br />
            {EVENT.openNoticeTime} {EVENT.openNoticeAction}
          </h2>
          <OpenCountdown />
          <Link href={REGISTER_HREF} className="btn btn--on-red">
            {cta}
          </Link>
        </div>
      </section>
      <SideDock />
      <HomePopup />
    </main>
  );
}
