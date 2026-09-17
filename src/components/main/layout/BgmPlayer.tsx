"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MAIN_ASSETS } from "@/lib/assets";

function SpeakerOn() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="currentColor"
        d="M4 9v6h3.2L12 19.2V4.8L7.2 9H4zm11.5 3c0-1.8-1-3.3-2.5-4v8c1.5-.7 2.5-2.2 2.5-4zm2.5 0c0 2.9-1.7 5.4-4.1 6.5l.8 1.8C17.9 18.8 20 15.2 20 12s-2.1-6.8-5.3-8.3l-.8 1.8C16.8 6.6 18.5 9.1 18.5 12z"
      />
    </svg>
  );
}

function SpeakerOff() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
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
  const [on, setOn] = useState(false);
  const admin = pathname.startsWith("/admin");

  useEffect(() => {
    if (!admin) return;
    audioRef.current?.pause();
    setOn(false);
  }, [admin]);

  if (admin) return null;

  async function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (on) {
      el.pause();
      setOn(false);
      return;
    }
    el.volume = 0.4;
    try {
      await el.play();
      setOn(true);
    } catch {
      setOn(false);
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={MAIN_ASSETS.bgm}
        loop
        preload="none"
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
