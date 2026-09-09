"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EVENT } from "@/lib/event";
import { COMING_SOON_ASSETS } from "@/lib/assets";
import { REGISTER_HREF, registerUiOpen } from "@/lib/mode";
import type { CourseId } from "@/lib/register";
import { CoursePreview } from "../guide/CoursePreview";
import { OpeningIntro } from "../fx/OpeningIntro";

const TICKER = [
  "MARVEL RUN 2026",
  "INJE SPEEDIUM",
  "10.31 SAT",
  "ASSEMBLE",
  "KOREA",
];

export function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLElement>(null);
  const [previewId, setPreview] = useState<CourseId | null>(null);
  const preview = EVENT.courses.find((c) => c.id === previewId);
  const cta = registerUiOpen ? "참가신청" : "9.22 접수 OPEN";

  useEffect(() => {
    const hero = heroRef.current;
    const root = rootRef.current;
    if (!hero || !root) return;

    const onMove = (e: MouseEvent) => {
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
    <main className="home" ref={rootRef}>
      <OpeningIntro />

      <section className="hero" ref={heroRef}>
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
              코스를 고르고, 미션을 완수하고, 피니시 게이트를 통과하라.
              히어로는 태어나는 게 아니라 완주한다.
            </p>
          </div>
          <ul className="about__stats">
            {EVENT.stats.map((s) => (
              <li key={s.label}>
                <strong>
                  {s.value}
                  {s.unit ? <span>{s.unit}</span> : null}
                </strong>
                <em>{s.label}</em>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sec courses">
        <div className="wrap reveal">
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
                    <dt>제한</dt>
                    <dd>{c.timeLimit}</dd>
                  </div>
                  <div>
                    <dt>참가비</dt>
                    <dd>{c.fee}</dd>
                  </div>
                  <div>
                    <dt>어린이</dt>
                    <dd>{"childFee" in c ? c.childFee : "참가 불가"}</dd>
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

      <section className="sec schedule">
        <div className="wrap wrap--narrow reveal">
          <p className="kicker">03 / RACE DAY</p>
          <h2 className="sec__title">
            레이스 데이 <em>타임라인</em>
          </h2>
          <ol className="timeline">
            {EVENT.timeline.map((row) => (
              <li key={`${row.time}-${row.title}`}>
                <time>{row.time}</time>
                <span>{row.title}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec venue">
        <div className="wrap venue__grid reveal">
          <div>
            <p className="kicker">04 / LOCATION</p>
            <h2 className="sec__title">
              {EVENT.venue}
              <br />
              <em>{EVENT.venueEn}</em>
            </h2>
            <p className="sec__body">{EVENT.venueAddress}</p>
            <p className="sec__body">
              서킷 위를 달리는 국내 유일 마블 공식 러닝. 피니시 라인은
              체크무늬 플래그 앞에서 기다린다.
            </p>
            <Link href="/directions" className="btn btn--ghost">
              오시는길
            </Link>
          </div>
          <div className="venue__panel" aria-hidden>
            <span>10 Km</span>
            <span>START / FINISH</span>
            <span>CHECKERED</span>
          </div>
        </div>
      </section>

      <section className="assemble">
        <p className="assemble__ghost" aria-hidden>
          ASSEMBLE
        </p>
        <div className="assemble__inner reveal">
          <p className="kicker kicker--on-red">05 / CALL</p>
          <h2>
            {EVENT.openNoticeDate}
            <br />
            {EVENT.openNoticeTime} {EVENT.openNoticeAction}
          </h2>
          <Link href={REGISTER_HREF} className="btn btn--on-red">
            {cta}
          </Link>
        </div>
      </section>
    </main>
  );
}
