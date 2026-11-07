"use client";

import { useEffect, useRef } from "react";
import { VIRTUAL_RUN_ASSETS } from "@/lib/virtual-run/assets";

export function VirtualRunKitReel() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.volume = 0;
  }, []);

  return (
    <div className="vr-kit-reel" id="kit-reel">
      <header className="vr-kit-reel__head">
        <p className="vr-kit-pane__index" id="kit-reel-title">
          ASSEMBLE / MEDAL
        </p>
        <h2>어셈블 메달</h2>
      </header>
      <div className="vr-kit-reel__stage">
        <div className="vr-kit-reel__frame">
          <video
            ref={videoRef}
            className="vr-kit-reel__video"
            src={VIRTUAL_RUN_ASSETS.kitReel}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            controls={false}
            aria-label="기념품 영상"
            onPlay={(event) => {
              event.currentTarget.muted = true;
              event.currentTarget.volume = 0;
            }}
          />
        </div>
      </div>
      <aside className="vr-kit-reel__copy" aria-labelledby="kit-reel-title">
        <p className="vr-kit-reel__copy-lead">
          어벤져스, 엑스맨, 판타스틱4
          <br />
          세 팀의 히어로들이 모여 닥터둠에 대항하는 대서사
        </p>
        <p className="vr-kit-reel__copy-hi">
          <span className="vr-kit-reel__copy-mark">가장 특별한 메달 3종을 공개합니다.</span>
        </p>
        <p className="vr-kit-reel__copy-note">※ 메달 3종을 소장하면 하나로 결합할 수 있습니다.</p>
      </aside>
    </div>
  );
}
