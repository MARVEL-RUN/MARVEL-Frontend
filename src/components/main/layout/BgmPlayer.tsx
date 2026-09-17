"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MAIN_ASSETS } from "@/lib/assets";

function SpeakerOn() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M4 9v6h3.2L12 19.2V4.8L7.2 9H4zm11.5 3c0-1.8-1-3.3-2.5-4v8c1.5-.7 2.5-2.2 2.5-4zm2.5 0c0 2.9-1.7 5.4-4.1 6.5l.8 1.8C17.9 18.8 20 15.2 20 12s-2.1-6.8-5.3-8.3l-.8 1.8C16.8 6.6 18.5 9.1 18.5 12z"
      />
    </svg>
  );
}

function SpeakerOff() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M4 9v6h3.2L12 19.2V4.8L7.2 9H4zm12.3.3 1.4-1.4 1.4 1.4 1.4-1.4 1.4 1.4-1.4 1.4 1.4 1.4-1.4 1.4-1.4-1.4-1.4 1.4-1.4-1.4 1.4-1.4z"
      />
    </svg>
  );
}

export function BgmPlayer() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  const wantedRef = useRef(true);
  const [on, setOn] = useState(true);
  const admin = pathname.startsWith("/admin");

  useEffect(() => {
    if (admin) {
      audioRef.current?.pause();
      return;
    }

    const el = audioRef.current;
    if (!el) return;
    el.volume = 0.4;

    async function play() {
      if (!wantedRef.current) return;
      const audio = audioRef.current;
      if (!audio) return;
      try {
        await audio.play();
      } catch {
        /* 첫 제스처까지 대기 */
      }
    }

    function onGesture() {
      void play();
    }

    function onPlaying() {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    }

    el.addEventListener("playing", onPlaying);
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    void play();

    return () => {
      el.removeEventListener("playing", onPlaying);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, [admin]);

  if (admin) return null;

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (on) {
      wantedRef.current = false;
      el.pause();
      setOn(false);
      return;
    }
    wantedRef.current = true;
    el.volume = 0.4;
    void el.play().catch(() => {});
    setOn(true);
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={MAIN_ASSETS.bgm}
        loop
        preload="auto"
        playsInline
      />
      <button
        type="button"
        className={on ? "bgm-toggle is-on" : "bgm-toggle"}
        aria-pressed={on}
        aria-label={on ? "배경음악 끄기" : "배경음악 켜기"}
        onClick={toggle}
      >
        {on ? <SpeakerOn /> : <SpeakerOff />}
      </button>
    </>
  );
}
