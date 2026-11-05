"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { VIRTUAL_RUN_ASSETS } from "@/lib/virtual-run/assets";
import {
  VIRTUAL_RUN_KIT_THEMES,
  virtualRunKitImage,
  type VirtualRunKitItem,
  type VirtualRunKitItemKind,
  type VirtualRunKitThemeId,
} from "@/lib/virtual-run/kit";

const SOUVENIR_KINDS: VirtualRunKitItemKind[] = [
  "package-full",
  "carton-box",
  "bib",
  "medal-case",
  "keycap-keyring",
  "bandana",
  "socks",
  "sticker",
  "sticker-pack",
  "package",
];

function pickItems(
  items: readonly VirtualRunKitItem[],
  kinds: readonly VirtualRunKitItemKind[],
) {
  return kinds.flatMap((kind) => {
    const item = items.find((entry) => entry.kind === kind);
    return item ? [item] : [];
  });
}

function KitVisual({
  themeId,
  item,
  priority,
}: {
  themeId: VirtualRunKitThemeId;
  item: VirtualRunKitItem;
  priority?: boolean;
}) {
  return (
    <Image
      src={virtualRunKitImage(themeId, item.file)}
      alt={item.label}
      width={1200}
      height={1200}
      className="vr-kit-visual__img"
      priority={priority}
      sizes="(max-width: 720px) 80vw, 520px"
    />
  );
}

export function VirtualRunKitGallery() {
  const [themeId, setThemeId] = useState<VirtualRunKitThemeId>("avengers");
  const [view, setView] = useState<"overview" | "detail">("overview");
  const [index, setIndex] = useState(0);
  const theme = VIRTUAL_RUN_KIT_THEMES.find((entry) => entry.id === themeId) ?? VIRTUAL_RUN_KIT_THEMES[0];

  const souvenir = useMemo(() => pickItems(theme.items, SOUVENIR_KINDS), [theme]);
  const slide = souvenir[index] ?? souvenir[0];
  const overview = view === "overview" || !slide;

  useEffect(() => {
    if (view !== "detail" || souvenir.length < 2) return;
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("input, textarea, select")) return;
      if (event.key === "ArrowRight") {
        setIndex((current) => (current + 1) % souvenir.length);
      } else if (event.key === "ArrowLeft") {
        setIndex((current) => (current - 1 + souvenir.length) % souvenir.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, souvenir.length]);

  function selectTheme(next: VirtualRunKitThemeId) {
    setThemeId(next);
    setView("overview");
    setIndex(0);
  }

  function step(delta: number) {
    if (souvenir.length < 2) return;
    setIndex((current) => (current + delta + souvenir.length) % souvenir.length);
  }

  return (
    <div className="vr-kit">
      <div className="vr-kit-lineup" role="tablist" aria-label="테마별 기념품">
        {VIRTUAL_RUN_KIT_THEMES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            role="tab"
            aria-selected={entry.id === themeId}
            className={entry.id === themeId ? "is-on" : undefined}
            onClick={() => selectTheme(entry.id)}
          >
            <Image
              src={VIRTUAL_RUN_ASSETS.kitSouvenir[entry.id]}
              alt=""
              width={1400}
              height={1750}
              className="vr-kit-lineup__img"
              sizes="(max-width: 720px) 32vw, 360px"
            />
            <span className="vr-kit-lineup__name">{entry.label}</span>
          </button>
        ))}
      </div>

      {overview ? (
        souvenir.length > 0 ? (
          <div className="vr-kit-actions">
            <button type="button" className="vr-kit-more" onClick={() => setView("detail")}>
              자세히 보기
              <span className="vr-kit-more__icon" aria-hidden="true">
                <ArrowRight size={16} strokeWidth={2.4} />
              </span>
            </button>
          </div>
        ) : null
      ) : (
        <div
          className="vr-kit-detail"
          aria-roledescription="carousel"
          aria-label={`${theme.label} 기념품`}
        >
          <h2 className="vr-kit-detail__title">{slide.label}</h2>
          {souvenir.length > 1 ? (
            <button
              type="button"
              className="vr-kit-arrow vr-kit-arrow--prev"
              aria-label="이전 기념품"
              onClick={() => step(-1)}
            >
              <ChevronLeft size={28} strokeWidth={1.75} />
            </button>
          ) : null}
          <div className="vr-kit-detail__stage">
            <KitVisual themeId={themeId} item={slide} priority />
          </div>
          {souvenir.length > 1 ? (
            <button
              type="button"
              className="vr-kit-arrow vr-kit-arrow--next"
              aria-label="다음 기념품"
              onClick={() => step(1)}
            >
              <ChevronRight size={28} strokeWidth={1.75} />
            </button>
          ) : null}
          <p className="vr-kit-detail__note">이미지는 이해를 돕기 위한 예시로 실물과 다를 수 있습니다.</p>
          <div className="vr-kit-detail__foot">
            <div className="vr-kit-dots" role="tablist" aria-label="기념품 순서">
              {souvenir.map((item, dotIndex) => (
                <button
                  key={item.kind}
                  type="button"
                  role="tab"
                  aria-label={item.label}
                  aria-selected={dotIndex === index}
                  className={dotIndex === index ? "is-on" : undefined}
                  onClick={() => setIndex(dotIndex)}
                />
              ))}
            </div>
            <button type="button" className="vr-kit-more" onClick={() => setView("overview")}>
              전체 보기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
