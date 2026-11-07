"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { VIRTUAL_RUN_ASSETS } from "@/lib/virtual-run/assets";
import "./kit-medal-load.css";

const FADE_MS = 750;
const GIVE_UP_MS = 16000;
const PLAYBACK_RATE = 1.5;

export function VirtualRunKitVideoLoader({ children }: { children: ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"load" | "out" | "gone">("load");
  const done = useRef(false);

  function dismiss() {
    if (done.current) return;
    done.current = true;
    setPhase("out");
    window.setTimeout(() => setPhase("gone"), FADE_MS);
  }

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      dismiss();
      return;
    }

    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.volume = 0;
    video.defaultPlaybackRate = PLAYBACK_RATE;
    video.playbackRate = PLAYBACK_RATE;
    const play = video.play();
    if (play) play.catch(() => undefined);

    const giveUp = window.setTimeout(dismiss, GIVE_UP_MS);
    return () => window.clearTimeout(giveUp);
  }, []);

  return (
    <>
      <div aria-busy={phase !== "gone"}>{children}</div>
      {phase !== "gone" ? (
        <div
          className={phase === "out" ? "vr-kit-load is-out" : "vr-kit-load"}
          role="status"
          aria-live="polite"
          aria-label="불러오는 중"
        >
          <video
            ref={videoRef}
            className="vr-kit-load__video"
            src={VIRTUAL_RUN_ASSETS.kitLoad}
            autoPlay
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-label="기념품 로딩 영상"
            onPlay={(e) => {
              e.currentTarget.muted = true;
              e.currentTarget.volume = 0;
              e.currentTarget.playbackRate = PLAYBACK_RATE;
            }}
            onEnded={dismiss}
            onError={dismiss}
          />
          <button type="button" className="vr-kit-load__skip" onClick={dismiss}>
            SKIP
          </button>
        </div>
      ) : null}
    </>
  );
}
