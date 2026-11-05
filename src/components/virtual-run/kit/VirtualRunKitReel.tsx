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
    </div>
  );
}
