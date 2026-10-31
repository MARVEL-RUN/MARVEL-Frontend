"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  VIRTUAL_RUN_KIT_THEMES,
  virtualRunKitImage,
  type VirtualRunKitItem,
  type VirtualRunKitItemKind,
  type VirtualRunKitThemeId,
} from "@/lib/virtual-run/kit";
import { kitItemsInPageOrder } from "./kit-page-order";
import { kitSectionId } from "./kit-section-id";
import { VirtualRunKitManifestNav } from "./VirtualRunKitManifestNav";

function shotVariant(item: VirtualRunKitItem): string {
  switch (item.layout) {
    case "ribbon":
      return "ribbon";
    case "landscape":
      return "landscape";
    case "wide":
      return "banner";
    default:
      return "tile";
  }
}

function KitShot({
  themeId,
  item,
  priority,
  hideCaption,
}: {
  themeId: VirtualRunKitThemeId;
  item: VirtualRunKitItem;
  priority?: boolean;
  hideCaption?: boolean;
}) {
  const src = virtualRunKitImage(themeId, item.file);
  const variant = shotVariant(item);
  return (
    <figure className={`vr-kit__shot vr-kit__shot--${variant}`}>
      <Image
        src={src}
        alt={item.label}
        width={1600}
        height={variant === "ribbon" ? 2400 : variant === "landscape" ? 900 : 1200}
        className="vr-kit__img"
        priority={priority}
        sizes="(max-width: 900px) 45vw, 22vw"
      />
      {hideCaption ? null : <figcaption>{item.label}</figcaption>}
    </figure>
  );
}

function findKind(theme: (typeof VIRTUAL_RUN_KIT_THEMES)[number], kind: VirtualRunKitItemKind) {
  return theme.items.find((i) => i.kind === kind);
}

const COL1_TAIL_KINDS: VirtualRunKitItemKind[] = ["keycap-keyring", "bandana", "socks"];

function col1TailItem(theme: (typeof VIRTUAL_RUN_KIT_THEMES)[number]) {
  for (const kind of COL1_TAIL_KINDS) {
    const item = findKind(theme, kind);
    if (item) return item;
  }
  return null;
}

function col2FootItem(theme: (typeof VIRTUAL_RUN_KIT_THEMES)[number]) {
  return (
    findKind(theme, "sticker") ??
    findKind(theme, "sticker-pack") ??
    findKind(theme, "package")
  );
}

export function VirtualRunKitGallery() {
  const [themeId, setThemeId] = useState<VirtualRunKitThemeId>("avengers");
  const theme = VIRTUAL_RUN_KIT_THEMES.find((t) => t.id === themeId) ?? VIRTUAL_RUN_KIT_THEMES[0];

  const slots = useMemo(() => {
    const packageFull = findKind(theme, "package-full");
    const medalFront = findKind(theme, "medal-front");
    const medalBack = findKind(theme, "medal-back");
    const col1Tail = col1TailItem(theme);
    const medalCase = findKind(theme, "medal-case");
    const bib = findKind(theme, "bib");
    const col2Foot = col2FootItem(theme);
    const finish = findKind(theme, "finish-line");
    const carton = findKind(theme, "carton-box");
    return {
      packageFull,
      medalFront,
      medalBack,
      col1Tail,
      medalCase,
      bib,
      col2Foot,
      finish,
      carton,
    };
  }, [theme]);

  const pageItems = useMemo(() => kitItemsInPageOrder(slots), [slots]);

  return (
    <div className="vr-kit">
      <div className="vr-kit__bar">
        <div className="vr-kit__themes" role="tablist" aria-label="테마별 기념품">
          {VIRTUAL_RUN_KIT_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === themeId}
              className={t.id === themeId ? "is-on" : undefined}
              onClick={() => setThemeId(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="vr-kit__lead">{theme.lead}</p>
      </div>

      <div className="vr-kit__layout vr-kit__layout--3">
        <aside className="vr-kit__toc" aria-labelledby="vr-kit-toc-title">
          <h2 id="vr-kit-toc-title" className="vr-kit__col-title">
            목차
          </h2>
          {slots.packageFull || slots.carton ? (
            <div className="vr-kit__toc-visuals">
              {slots.packageFull ? (
                <div id={kitSectionId("package-full")} className="vr-kit__anchor">
                  <KitShot themeId={themeId} item={slots.packageFull} priority hideCaption />
                </div>
              ) : null}
              {slots.carton ? (
                <div id={kitSectionId("carton-box")} className="vr-kit__anchor">
                  <KitShot themeId={themeId} item={slots.carton} hideCaption />
                </div>
              ) : null}
            </div>
          ) : null}
          <ul className="vr-kit__manifest vr-kit__manifest--desk" aria-label="키트 구성">
            {pageItems.map((item) => (
              <li key={item.kind}>{item.label}</li>
            ))}
          </ul>
          <VirtualRunKitManifestNav key={themeId} items={pageItems} />
          <p className="vr-kit__fine">회차·티켓에 따라 테마가 달라집니다.</p>
        </aside>

        <div className="vr-kit__goods-grid">
          <h2 id="vr-kit-goods-title" className="vr-kit__col-title vr-kit__col-title--goods">
            기념품
          </h2>

          <div className="vr-kit__board" aria-labelledby="vr-kit-goods-title">
            <div className="vr-kit__board-primary">
              {slots.medalFront && slots.medalBack ? (
                <div
                  id={kitSectionId("medal-front")}
                  className="vr-kit__board-medals vr-kit__anchor"
                >
                  <div className="vr-kit__medal-ribbons">
                    <KitShot themeId={themeId} item={slots.medalFront} />
                    <KitShot themeId={themeId} item={slots.medalBack} />
                  </div>
                </div>
              ) : null}
              {slots.col1Tail ? (
                <div
                  id={kitSectionId(slots.col1Tail.kind)}
                  className="vr-kit__board-slot vr-kit__board-slot--col-a vr-kit__anchor"
                >
                  <KitShot themeId={themeId} item={slots.col1Tail} />
                </div>
              ) : null}
            </div>
            {slots.medalCase || slots.bib || slots.col2Foot ? (
              <div className="vr-kit__board-col-b">
                {slots.medalCase ? (
                  <div
                    id={kitSectionId("medal-case")}
                    className="vr-kit__board-slot vr-kit__board-slot--head vr-kit__anchor"
                  >
                    <KitShot themeId={themeId} item={slots.medalCase} />
                  </div>
                ) : null}
                {slots.bib ? (
                  <>
                    <div className="vr-kit__board-flex-gap" aria-hidden />
                    <div
                      id={kitSectionId("bib")}
                      className="vr-kit__board-slot vr-kit__board-slot--bib vr-kit__anchor"
                    >
                      <KitShot themeId={themeId} item={slots.bib} />
                    </div>
                    <div className="vr-kit__board-flex-gap" aria-hidden />
                  </>
                ) : slots.col2Foot ? (
                  <div className="vr-kit__board-flex-gap" aria-hidden />
                ) : null}
                {slots.col2Foot ? (
                  <div
                    id={kitSectionId(slots.col2Foot.kind)}
                    className="vr-kit__board-slot vr-kit__board-slot--foot vr-kit__anchor"
                  >
                    <KitShot themeId={themeId} item={slots.col2Foot} />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {slots.finish ? (
            <div id={kitSectionId("finish-line")} className="vr-kit__finish vr-kit__anchor">
              <KitShot themeId={themeId} item={slots.finish} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
