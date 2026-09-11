"use client";

import { useEffect } from "react";

export function MedalViewer({ src, alt }: { src: string; alt: string }) {
  useEffect(() => {
    void import("@google/model-viewer");
  }, []);

  return (
    <model-viewer
      className="kit-gallery__viewer"
      src={src}
      alt={alt}
      camera-controls
      camera-orbit="18deg 80deg auto"
      field-of-view="32deg"
      min-field-of-view="18deg"
      max-field-of-view="45deg"
      touch-action="pan-y"
      shadow-intensity="1"
      exposure="1.05"
      environment-image="neutral"
      interaction-prompt="when-focused"
      suppressHydrationWarning
    />
  );
}
