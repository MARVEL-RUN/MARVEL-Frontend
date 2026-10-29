"use client";

import { useEffect } from "react";

const PROBE_Y = 2;

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function ensureThemeMeta() {
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  return meta;
}

function applyChrome(r: number, g: number, b: number) {
  const color = toHex(r, g, b);
  ensureThemeMeta().setAttribute("content", color);
  document.documentElement.style.setProperty("--info-chrome", color);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  document.documentElement.style.colorScheme = lum > 140 ? "light" : "dark";
  return color;
}

export function InfoThemeTint() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let last = "";
    let raf = 0;

    function readRgb(img: HTMLImageElement, localY: number) {
      const y = Math.min(img.naturalHeight - 1, Math.max(0, Math.floor(localY)));
      // 가운데 로고·맵 말고 양끝 배경색을 씀
      const xs = [0.02, 0.05, 0.95, 0.98].map((t) =>
        Math.min(img.naturalWidth - 1, Math.max(0, Math.floor(t * (img.naturalWidth - 1)))),
      );

      let r = 0;
      let g = 0;
      let b = 0;
      for (const x of xs) {
        ctx!.clearRect(0, 0, 1, 1);
        ctx!.drawImage(img, x, y, 1, 1, 0, 0, 1, 1);
        const d = ctx!.getImageData(0, 0, 1, 1).data;
        const a = d[3] / 255;
        r += d[0] * a + 224 * (1 - a);
        g += d[1] * a + 224 * (1 - a);
        b += d[2] * a + 224 * (1 - a);
      }

      return {
        r: r / xs.length,
        g: g / xs.length,
        b: b / xs.length,
      };
    }

    function sample() {
      raf = 0;
      const imgs = document.querySelectorAll<HTMLImageElement>(".info-sheet__img");
      let rgb: { r: number; g: number; b: number } | null = null;

      for (const img of imgs) {
        if (!img.complete || img.naturalWidth === 0) continue;
        const rect = img.getBoundingClientRect();
        if (rect.bottom <= PROBE_Y || rect.top > PROBE_Y) continue;
        if (rect.height <= 0) continue;

        try {
          rgb = readRgb(img, ((PROBE_Y - rect.top) / rect.height) * img.naturalHeight);
        } catch {
          rgb = null;
        }
        break;
      }

      if (!rgb) return;

      const color = toHex(rgb.r, rgb.g, rgb.b);
      if (color === last) return;
      last = color;
      applyChrome(rgb.r, rgb.g, rgb.b);
    }

    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(sample);
    }

    applyChrome(0, 3, 32);
    sample();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    const imgs = [...document.querySelectorAll<HTMLImageElement>(".info-sheet__img")];
    imgs.forEach((img) => img.addEventListener("load", schedule));

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      imgs.forEach((img) => img.removeEventListener("load", schedule));
      if (raf) cancelAnimationFrame(raf);
      document.documentElement.style.removeProperty("--info-chrome");
      document.documentElement.style.colorScheme = "";
    };
  }, []);

  return null;
}
