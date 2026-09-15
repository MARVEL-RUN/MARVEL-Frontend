"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MAIN_ASSETS } from "@/lib/assets";
import { EVENT } from "@/lib/event";
import {
  KitBibPane,
  KitMedalPane,
  KitScarfPane,
  KitShirtPane,
} from "../kit/KitGallery";

const SLIDES = [
  {
    id: "all",
    en: "",
    src: MAIN_ASSETS.headerLogo,
    fit: "logo",
    feature: true,
  },
  {
    id: "shirt",
    en: "T-shirt",
    src: MAIN_ASSETS.kitShirt,
    fit: "shirt",
    feature: false,
  },
  {
    id: "bib",
    en: "Bib",
    src: MAIN_ASSETS.kitBib,
    fit: "bib",
    feature: false,
  },
  {
    id: "medal",
    en: "Medal",
    src: MAIN_ASSETS.medal10kRibbon,
    fit: "medal",
    feature: false,
  },
  {
    id: "scarf",
    en: "Scarf",
    src: MAIN_ASSETS.kitScarf,
    fit: "scarf",
    feature: false,
  },
] as const;

type SlideId = (typeof SLIDES)[number]["id"];

const PRELOAD_SRCS = [
  ...SLIDES.map((s) => s.src),
  MAIN_ASSETS.kitShirtFront,
  MAIN_ASSETS.kitShirtBack,
  MAIN_ASSETS.kitBib,
  MAIN_ASSETS.kitScarfFront,
  MAIN_ASSETS.kitScarfBack,
  ...EVENT.courses.flatMap((c) => [c.medalRibbon, c.medalTurn, c.medalBack]),
];

const N: number = SLIDES.length;
const COPIES = 3;
const LOOP = Array.from({ length: N * COPIES }, (_, i) => ({
  i,
  real: i % N,
  slide: SLIDES[i % N],
}));

function wrapPos(i: number) {
  if (i < N) return i + N;
  if (i >= N * 2) return i - N;
  return i;
}

function closestPos(from: number, real: number) {
  return [real, real + N, real + 2 * N].reduce((best, next) =>
    Math.abs(next - from) < Math.abs(best - from) ? next : best,
  );
}

function centerLeft(rail: HTMLElement, i: number) {
  const slide = rail.querySelector<HTMLElement>(`[data-i="${i}"]`);
  if (!slide) return 0;
  return slide.offsetLeft - (rail.clientWidth - slide.offsetWidth) / 2;
}

function nearestIndex(rail: HTMLElement) {
  const mid = rail.getBoundingClientRect().left + rail.clientWidth / 2;
  let best = N;
  let dist = Infinity;
  rail.querySelectorAll<HTMLElement>("[data-i]").forEach((slide) => {
    const box = slide.getBoundingClientRect();
    const d = Math.abs(box.left + box.width / 2 - mid);
    if (d < dist) {
      dist = d;
      best = Number(slide.dataset.i);
    }
  });
  return best;
}

function slideIdAt(i: number): SlideId {
  return SLIDES[((i % N) + N) % N].id;
}

function warmImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
    if (img.decode) {
      void img.decode().then(() => resolve()).catch(() => resolve());
    }
  });
}

export function PackagePage() {
  const [index, setIndex] = useState(N);
  const [detailId, setDetailId] = useState<SlideId>("all");
  const [ready, setReady] = useState(false);
  const railRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);
  const dragRef = useRef<{
    x: number;
    scroll: number;
    moved: boolean;
  } | null>(null);
  const skipClickRef = useRef(false);
  const wrapTimer = useRef(0);
  const detailTimer = useRef(0);

  useEffect(() => {
    let alive = true;
    const slides = SLIDES.map((s) => warmImage(s.src));
    const rest = PRELOAD_SRCS.filter((src) => !SLIDES.some((s) => s.src === src)).map(
      (src) => warmImage(src),
    );
    void Promise.all(slides).then(() => {
      if (alive) setReady(true);
    });
    void Promise.all(rest);
    return () => {
      alive = false;
    };
  }, []);

  const queueDetail = useCallback((i: number, immediate = false) => {
    const next = slideIdAt(i);
    window.clearTimeout(detailTimer.current);
    if (immediate) {
      setDetailId(next);
      return;
    }
    detailTimer.current = window.setTimeout(() => {
      setDetailId(next);
    }, 140);
  }, []);

  const jump = useCallback(
    (next: number) => {
      const rail = railRef.current;
      if (!rail) return;
      lockRef.current = true;
      rail.classList.add("is-jump");
      rail.scrollLeft = centerLeft(rail, next);
      setIndex(next);
      queueDetail(next, true);
      requestAnimationFrame(() => {
        rail.classList.remove("is-jump");
        lockRef.current = false;
      });
    },
    [queueDetail],
  );

  const goTo = useCallback(
    (next: number) => {
      const rail = railRef.current;
      if (!rail || next === index) return;
      lockRef.current = true;
      setIndex(next);
      queueDetail(next, true);
      rail.scrollTo({ left: centerLeft(rail, next), behavior: "smooth" });
      window.clearTimeout(wrapTimer.current);
      wrapTimer.current = window.setTimeout(() => {
        const wrapped = wrapPos(next);
        if (wrapped !== next) jump(wrapped);
        else lockRef.current = false;
      }, 460);
    },
    [index, jump, queueDetail],
  );

  useLayoutEffect(() => {
    jump(N);
  }, [jump]);

  const onScroll = () => {
    const rail = railRef.current;
    if (!rail || lockRef.current) return;
    const best = nearestIndex(rail);
    setIndex(best);
    queueDetail(best);
    window.clearTimeout(wrapTimer.current);
    wrapTimer.current = window.setTimeout(() => {
      if (lockRef.current) return;
      const wrapped = wrapPos(best);
      if (wrapped !== best) jump(wrapped);
    }, 80);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const rail = railRef.current;
    if (!rail) return;
    dragRef.current = { x: e.clientX, scroll: rail.scrollLeft, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rail = railRef.current;
    const drag = dragRef.current;
    if (!rail || !drag) return;
    if (!drag.moved && Math.abs(e.clientX - drag.x) > 6) {
      drag.moved = true;
      skipClickRef.current = true;
      rail.setPointerCapture(e.pointerId);
    }
    if (!drag.moved) return;
    rail.scrollLeft = drag.scroll - (e.clientX - drag.x);
  };

  const onPointerUp = () => {
    dragRef.current = null;
    if (skipClickRef.current) {
      requestAnimationFrame(() => {
        skipClickRef.current = false;
      });
    }
  };

  const real = ((index % N) + N) % N;

  return (
    <main className="page">
      <div className="pkg">
        <header className="pkg__intro wrap">
          <h1 className="pkg__title">PACKAGE</h1>
          <p className="sec__body">
            참가자를 위한
            <br />
            레이스 패키지를 준비했습니다.
          </p>
          <p className="pkg__meta">
            <b>수령</b> 대회 당일 지정 부스
          </p>
        </header>

        <div className={ready ? "pkg-media is-ready" : "pkg-media"}>
          <div aria-hidden className="pkg-preload">
            {SLIDES.map((slide) => (
              <img key={slide.id} src={slide.src} alt="" />
            ))}
          </div>

          <div
            ref={railRef}
            className="pkg-rail"
            onScroll={onScroll}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {LOOP.map(({ i, slide }) => {
              const active = index === i;
              return (
                <article
                  key={i}
                  data-i={i}
                  className={active ? "pkg-slide is-on" : "pkg-slide"}
                  onClick={() => {
                    if (skipClickRef.current) {
                      skipClickRef.current = false;
                      return;
                    }
                    goTo(i);
                  }}
                >
                  <div
                    className={
                      slide.feature
                        ? "pkg-card pkg-card--all"
                        : slide.id === "bib"
                          ? "pkg-card"
                          : "pkg-card pkg-card--photo"
                    }
                  >
                    <span className={`pkg-card__shot pkg-card__shot--${slide.fit}`}>
                      <img
                        src={slide.src}
                        alt=""
                        draggable={false}
                        loading="eager"
                        decoding="async"
                      />
                    </span>
                    {slide.en ? <p className="pkg-card__en">{slide.en}</p> : null}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="pkg-dots" role="tablist" aria-label="패키지 구성">
            {SLIDES.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={real === i}
                aria-label={slide.en || "PACKAGE"}
                className={real === i ? "pkg-dots__dot is-on" : "pkg-dots__dot"}
                onClick={() => goTo(closestPos(index, i))}
              />
            ))}
          </div>
        </div>

        <div className="pkg__detail wrap">
          <div
            className={detailId === "all" ? "pkg__detail-pane is-on" : "pkg__detail-pane"}
            aria-hidden={detailId !== "all"}
          >
            <section className="kit-gallery__pane">
              <h3>구성</h3>
              <ul className="chips">
                {EVENT.kit.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
          <div
            className={detailId === "shirt" ? "pkg__detail-pane is-on" : "pkg__detail-pane"}
            aria-hidden={detailId !== "shirt"}
          >
            <KitShirtPane />
          </div>
          <div
            className={detailId === "bib" ? "pkg__detail-pane is-on" : "pkg__detail-pane"}
            aria-hidden={detailId !== "bib"}
          >
            <KitBibPane />
          </div>
          <div
            className={detailId === "medal" ? "pkg__detail-pane is-on" : "pkg__detail-pane"}
            aria-hidden={detailId !== "medal"}
          >
            <KitMedalPane />
          </div>
          <div
            className={detailId === "scarf" ? "pkg__detail-pane is-on" : "pkg__detail-pane"}
            aria-hidden={detailId !== "scarf"}
          >
            <KitScarfPane />
          </div>
        </div>
      </div>
    </main>
  );
}
