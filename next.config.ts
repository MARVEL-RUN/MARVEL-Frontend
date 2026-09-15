import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  /* 모바일 불안정 — 3D 보류. MedalViewer 복구 시 주석 해제
  transpilePackages: ["@google/model-viewer"],
  */
};

export default nextConfig;
