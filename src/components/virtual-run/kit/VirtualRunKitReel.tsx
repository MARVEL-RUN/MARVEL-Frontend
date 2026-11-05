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
      <div className="vr-kit-reel__stage">
        <div className="vr-kit-reel__frame">
          <video
            ref={videoRef}
            className="vr-kit-reel__video"
            src={VIRTUAL_RUN_ASSETS.kitLoad}
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
      <div className="vr-kit-reel__copy">
        <p>어벤져스, 엑스맨, 판타스틱4</p>
        <p>세 팀의 히어로들이 모여 닥터둠에 대항하는 대서사</p>
        <p className="vr-kit-reel__copy-hi">가장 특별한 메달 3종을 공개합니다.</p>
        <p className="vr-kit-reel__copy-note">※ 메달 3종을 소장하면 하나로 결합할 수 있습니다.</p>
      </div>
    </div>
  );
}
