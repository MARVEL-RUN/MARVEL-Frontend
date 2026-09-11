"use client";

import { useEffect } from "react";
import { MAIN_ASSETS } from "@/lib/assets";

export function MedalViewer() {
  useEffect(() => {
    void import("@google/model-viewer");
  }, []);

  return (
    <model-viewer
      className="kit-gallery__viewer"
      src={MAIN_ASSETS.medal3d}
      alt="피니셔 메달 3D 미리보기"
      camera-controls
      camera-orbit="0deg 75deg auto"
      field-of-view="30deg"
      touch-action="pan-y"
      shadow-intensity="0.85"
      exposure="1.05"
      environment-image="neutral"
      interaction-prompt="auto"
      suppressHydrationWarning
    />
  );
}
