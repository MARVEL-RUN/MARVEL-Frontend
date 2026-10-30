"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { MAIN_ASSETS } from "@/lib/assets";
import { VIRTUAL_RUN_ASSETS } from "@/lib/virtual-run/assets";
import "./kit-medal-load.css";

const MIN_SHOW_MS = 2200;
const GIVE_UP_MS = 12000;
const FADE_MS = 750;

const MEDAL_SRCS = [
  VIRTUAL_RUN_ASSETS.combinedMedal.avengers,
  VIRTUAL_RUN_ASSETS.combinedMedal.xMen,
  VIRTUAL_RUN_ASSETS.combinedMedal.fantasticFour,
] as const;

function preloadSrc(src: string) {
  return new Promise<void>((resolve) => {
    const img = new window.Image();
    const done = () => {
      img.removeEventListener("load", done);
      img.removeEventListener("error", done);
      resolve();
    };
    img.addEventListener("load", done);
    img.addEventListener("error", done);
    img.src = src;
  });
}

function waitImage(img: HTMLImageElement) {
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
  if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) return Promise.resolve();
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

export function VirtualRunKitMedalLoader({ children }: { children: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"load" | "out" | "gone">("load");
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [clusterHold, setClusterHold] = useState(false);

  function dismiss() {
    setPhase("out");
    window.setTimeout(() => setPhase("gone"), FADE_MS);
  }

  useEffect(() => {
    const hold = window.setTimeout(() => setClusterHold(true), 1080);
    return () => window.clearTimeout(hold);
  }, []);

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
      fade = window.setTimeout(dismiss, wait);
    };

    const pageMedia = [
      ...host.querySelectorAll<HTMLImageElement>("img"),
      ...host.querySelectorAll<HTMLVideoElement>("video"),
    ];
    const total = MEDAL_SRCS.length + pageMedia.length;
    let done = 0;
    setProgress({ done: 0, total });

    const bump = () => {
      done += 1;
      if (alive) setProgress({ done, total });
    };

    const loads = [
      ...MEDAL_SRCS.map((src) => preloadSrc(src).then(bump)),
      ...pageMedia.map((el) =>
        (el instanceof HTMLVideoElement ? waitVideo(el) : waitImage(el)).then(bump),
      ),
    ];

    Promise.all(loads).then(finish);
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
          className={phase === "out" ? "vr-kit-load is-out" : "vr-kit-load"}
          role="status"
          aria-live="polite"
          aria-label="불러오는 중"
        >
          <div className="vr-kit-load__stage" aria-hidden>
            <div className={clusterHold ? "vr-kit-load__cluster is-hold" : "vr-kit-load__cluster"}>
              <span className="vr-kit-load__piece vr-kit-load__piece--avengers">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={VIRTUAL_RUN_ASSETS.combinedMedal.avengers} alt="" width={400} height={520} />
              </span>
              <span className="vr-kit-load__piece vr-kit-load__piece--f4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={VIRTUAL_RUN_ASSETS.combinedMedal.fantasticFour} alt="" width={400} height={520} />
              </span>
              <span className="vr-kit-load__piece vr-kit-load__piece--xmen">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={VIRTUAL_RUN_ASSETS.combinedMedal.xMen} alt="" width={400} height={520} />
              </span>
            </div>
            <span className="vr-kit-load__flash" />
          </div>
          <span className="vr-kit-load__logo">
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
          <span className="vr-kit-load__bar" aria-hidden>
            <span className="vr-kit-load__fill" style={{ width: `${pct}%` }} />
          </span>
          <span className="vr-kit-load__text" aria-hidden>
            LOADING
          </span>
          <button type="button" className="vr-kit-load__skip" onClick={dismiss}>
            SKIP
          </button>
        </div>
      ) : null}
    </>
  );
}
