"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  VIRTUAL_RUN_KIT_THEMES,
  virtualRunKitImage,
  type VirtualRunKitItem,
  type VirtualRunKitThemeId,
} from "@/lib/virtual-run/kit";

const MEDAL_KINDS = new Set(["medal-front", "medal-back"]);

function frameClass(layout: VirtualRunKitItem["layout"]) {
  switch (layout) {
    case "ribbon":
      return "kit-gallery__frame vr-kit__frame--ribbon";
    case "landscape":
      return "kit-gallery__frame kit-gallery__frame--bib";
    case "wide":
      return "kit-gallery__frame vr-kit__frame--wide";
    default:
      return "kit-gallery__frame vr-kit__frame--square";
  }
}

function KitFigure({
  themeId,
  item,
}: {
  themeId: VirtualRunKitThemeId;
  item: VirtualRunKitItem;
}) {
  const src = virtualRunKitImage(themeId, item.file);
  return (
    <figure>
      <span className={frameClass(item.layout)}>
        <Image src={src} alt={item.label} fill sizes="(max-width: 720px) 90vw, 640px" />
      </span>
      <figcaption>{item.label}</figcaption>
    </figure>
  );
}

export function VirtualRunKitGallery() {
  const [themeId, setThemeId] = useState<VirtualRunKitThemeId>("avengers");
  const theme = VIRTUAL_RUN_KIT_THEMES.find((t) => t.id === themeId) ?? VIRTUAL_RUN_KIT_THEMES[0];

  const sections = useMemo(() => {
    const packageItem = theme.items.find((i) => i.kind === "package-full");
    const medalItems = theme.items.filter((i) => MEDAL_KINDS.has(i.kind));
    const medalCase = theme.items.find((i) => i.kind === "medal-case");
    const bib = theme.items.find((i) => i.kind === "bib");
    const extras = theme.items.filter(
      (i) =>
        i.kind !== "package-full" &&
        !MEDAL_KINDS.has(i.kind) &&
        i.kind !== "medal-case" &&
        i.kind !== "bib" &&
        i.kind !== "finish-line" &&
        i.kind !== "carton-box" &&
        i.kind !== "package",
    );
    const innerPackage = theme.items.find((i) => i.kind === "package");
    const finish = theme.items.find((i) => i.kind === "finish-line");
    const carton = theme.items.find((i) => i.kind === "carton-box");
    return { packageItem, medalItems, medalCase, bib, extras, innerPackage, finish, carton };
  }, [theme]);

  let index = 0;
  const nextIndex = () => {
    index += 1;
    return String(index).padStart(2, "0");
  };

  return (
    <div className="kit-gallery vr-kit">
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

      {sections.packageItem ? (
        <section className="kit-gallery__pane vr-kit__pane--package">
          <header className="kit-gallery__head">
            <p className="kit-gallery__index">{nextIndex()} / PACKAGE</p>
            <h3>{sections.packageItem.label}</h3>
          </header>
          <KitFigure themeId={themeId} item={sections.packageItem} />
        </section>
      ) : null}

      {sections.innerPackage ? (
        <section className="kit-gallery__pane">
          <header className="kit-gallery__head">
            <p className="kit-gallery__index">{nextIndex()} / BOX</p>
            <h3>{sections.innerPackage.label}</h3>
          </header>
          <KitFigure themeId={themeId} item={sections.innerPackage} />
        </section>
      ) : null}

      {sections.medalItems.length > 0 ? (
        <section className="kit-gallery__pane">
          <header className="kit-gallery__head">
            <p className="kit-gallery__index">{nextIndex()} / MEDAL</p>
            <h3>피니셔 메달</h3>
          </header>
          <ul className="kit-gallery__medals">
            {sections.medalItems.map((item) => (
              <li key={item.kind}>
                <KitFigure themeId={themeId} item={item} />
              </li>
            ))}
          </ul>
          {sections.medalCase ? (
            <div className="vr-kit__case">
              <KitFigure themeId={themeId} item={sections.medalCase} />
            </div>
          ) : null}
          <p className="kit-gallery__note">회차·티켓에 따라 지급되는 테마가 다릅니다.</p>
        </section>
      ) : null}

      {sections.bib ? (
        <section className="kit-gallery__pane kit-gallery__pane--bib">
          <header className="kit-gallery__head">
            <p className="kit-gallery__index">{nextIndex()} / BIB</p>
            <h3>{sections.bib.label}</h3>
          </header>
          <figure className="kit-gallery__bib">
            <span className={frameClass(sections.bib.layout)}>
              <Image
                src={virtualRunKitImage(themeId, sections.bib.file)}
                alt={sections.bib.label}
                fill
                sizes="(max-width: 720px) 100vw, 640px"
              />
            </span>
          </figure>
        </section>
      ) : null}

      {sections.extras.length > 0 ? (
        <section className="kit-gallery__pane">
          <header className="kit-gallery__head">
            <p className="kit-gallery__index">{nextIndex()} / GOODS</p>
            <h3>굿즈</h3>
          </header>
          <ul className="vr-kit__goods">
            {sections.extras.map((item) => (
              <li key={item.kind}>
                <KitFigure themeId={themeId} item={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {sections.finish ? (
        <section className="kit-gallery__pane">
          <header className="kit-gallery__head">
            <p className="kit-gallery__index">{nextIndex()} / FINISH</p>
            <h3>{sections.finish.label}</h3>
          </header>
          <KitFigure themeId={themeId} item={sections.finish} />
        </section>
      ) : null}

      {sections.carton ? (
        <section className="kit-gallery__pane">
          <header className="kit-gallery__head">
            <p className="kit-gallery__index">{nextIndex()} / SHIP</p>
            <h3>{sections.carton.label}</h3>
          </header>
          <KitFigure themeId={themeId} item={sections.carton} />
          <p className="kit-gallery__note">키트는 카툰박스에 담겨 배송됩니다.</p>
        </section>
      ) : null}
    </div>
  );
}
