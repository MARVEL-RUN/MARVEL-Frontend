"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MAIN_ASSETS } from "@/lib/assets";

/* 캐시돼 있어도 한 번은 보여 줌. 네트워크가 막히면 GIVE_UP 뒤 그냥 연다 */
const MIN_SHOW_MS = 450;
const GIVE_UP_MS = 10000;
const FADE_MS = 400;

function waitImage(img: HTMLImageElement) {
  /* lazy 이미지는 스크롤 전엔 안 받으므로 eager로 바꿔 당긴다 */
  if (img.loading === "lazy") img.loading = "eager";
  if (img.complete) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => {
      img.removeEventListener("load", done);
      img.removeEventListener("error", done);
      resolve();
    };
    img.addEventListener("load", done);
    img.addEventListener("error", done);
  });
}

function waitVideo(video: HTMLVideoElement) {
  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA)
    return Promise.resolve();
  return new Promise<void>((resolve) => {
    const done = () => {
      video.removeEventListener("canplay", done);
      video.removeEventListener("error", done);
      resolve();
    };
    video.addEventListener("canplay", done);
    video.addEventListener("error", done);
    if (video.preload !== "auto") video.preload = "auto";
  });
}

export function MediaLoader({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"load" | "out" | "gone">("load");
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let alive = true;
    let fade = 0;
    const startedAt = Date.now();

    const finish = () => {
      if (!alive) return;
      alive = false;
      const wait = Math.max(0, MIN_SHOW_MS - (Date.now() - startedAt));
      fade = window.setTimeout(() => {
        setPhase("out");
        fade = window.setTimeout(() => setPhase("gone"), FADE_MS);
      }, wait);
    };

    const media = [
      ...host.querySelectorAll<HTMLImageElement>("img"),
      ...host.querySelectorAll<HTMLVideoElement>("video"),
    ];
    const total = media.length;
    let done = 0;
    setProgress({ done: 0, total });

    const bump = () => {
      done += 1;
      if (alive) setProgress({ done, total });
    };

    const all = media.map((el) =>
      (el instanceof HTMLVideoElement ? waitVideo(el) : waitImage(el)).then(bump),
    );
    Promise.all(all).then(finish);
    const giveUp = window.setTimeout(finish, GIVE_UP_MS);

    return () => {
      alive = false;
      window.clearTimeout(giveUp);
      window.clearTimeout(fade);
    };
  }, []);

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <>
      <div ref={hostRef} aria-busy={phase !== "gone"}>
        {children}
      </div>
      {phase !== "gone" ? (
        <div
          className={phase === "out" ? "media-load is-out" : "media-load"}
          role="status"
          aria-live="polite"
          aria-label="불러오는 중"
        >
          <span className="media-load__mark">
            <Image
              src={MAIN_ASSETS.introMarvel}
              alt=""
              width={219}
              height={99}
              className="media-load__box"
              priority
            />
            <Image
              src={MAIN_ASSETS.introRun}
              alt=""
              width={594}
              height={99}
              className="media-load__run"
              priority
            />
          </span>
          <span className="media-load__bar" aria-hidden>
            <span className="media-load__fill" style={{ width: `${pct}%` }} />
          </span>
          <span className="media-load__text" aria-hidden>
            LOADING
          </span>
        </div>
      ) : null}
    </>
  );
}
