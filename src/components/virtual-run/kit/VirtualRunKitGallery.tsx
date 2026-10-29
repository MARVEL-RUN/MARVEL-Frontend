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
}: {
  themeId: VirtualRunKitThemeId;
  item: VirtualRunKitItem;
  priority?: boolean;
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
        sizes="(max-width: 900px) 100vw, 50vw"
      />
      <figcaption>{item.label}</figcaption>
    </figure>
  );
}

export function VirtualRunKitGallery() {
  const [themeId, setThemeId] = useState<VirtualRunKitThemeId>("avengers");
  const theme = VIRTUAL_RUN_KIT_THEMES.find((t) => t.id === themeId) ?? VIRTUAL_RUN_KIT_THEMES[0];

  const groups = useMemo(() => {
    const packageFull = theme.items.find((i) => i.kind === "package-full");
    const innerPackage = theme.items.find((i) => i.kind === "package");
    const medals = theme.items.filter((i) => MEDAL_KINDS.has(i.kind));
    const medalCase = theme.items.find((i) => i.kind === "medal-case");
    const bib = theme.items.find((i) => i.kind === "bib");
    const finish = theme.items.find((i) => i.kind === "finish-line");
    const carton = theme.items.find((i) => i.kind === "carton-box");
    const goods = theme.items.filter(
      (i) =>
        i !== packageFull &&
        i !== innerPackage &&
        !MEDAL_KINDS.has(i.kind) &&
        i !== medalCase &&
        i !== bib &&
        i !== finish &&
        i !== carton,
    );
    return { packageFull, innerPackage, medals, medalCase, bib, finish, carton, goods };
  }, [theme]);

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

      <div className="vr-kit__layout">
        <aside className="vr-kit__aside">
          {groups.packageFull ? (
            <KitShot themeId={themeId} item={groups.packageFull} priority />
          ) : null}
          <ul className="vr-kit__manifest" aria-label="키트 구성">
            {theme.items.map((item) => (
              <li key={item.kind}>{item.label}</li>
            ))}
          </ul>
          <p className="vr-kit__fine">회차·티켓에 따라 테마가 달라집니다.</p>
        </aside>

        <div className="vr-kit__main">
          {(groups.medals.length > 0 || groups.medalCase) && (
            <section className="vr-kit__block" aria-labelledby="vr-kit-medal">
              <h2 id="vr-kit-medal" className="vr-kit__block-title">
                Medal
              </h2>
              <div className="vr-kit__medals">
                {groups.medals.map((item) => (
                  <KitShot key={item.kind} themeId={themeId} item={item} />
                ))}
                {groups.medalCase ? (
                  <KitShot themeId={themeId} item={groups.medalCase} />
                ) : null}
              </div>
            </section>
          )}

          {groups.bib ? (
            <section className="vr-kit__block" aria-labelledby="vr-kit-bib">
              <h2 id="vr-kit-bib" className="vr-kit__block-title">
                Bib
              </h2>
              <KitShot themeId={themeId} item={groups.bib} />
            </section>
          ) : null}

          {groups.goods.length > 0 ? (
            <section className="vr-kit__block" aria-labelledby="vr-kit-goods">
              <h2 id="vr-kit-goods" className="vr-kit__block-title">
                Goods
              </h2>
              <div className="vr-kit__goods">
                {groups.goods.map((item) => (
                  <KitShot key={item.kind} themeId={themeId} item={item} />
                ))}
              </div>
            </section>
          ) : null}

          {(groups.finish || groups.carton || groups.innerPackage) && (
            <section className="vr-kit__block" aria-labelledby="vr-kit-run">
              <h2 id="vr-kit-run" className="vr-kit__block-title">
                Run kit
              </h2>
              <div className="vr-kit__run">
                {groups.finish ? <KitShot themeId={themeId} item={groups.finish} /> : null}
                {groups.innerPackage ? <KitShot themeId={themeId} item={groups.innerPackage} /> : null}
                {groups.carton ? <KitShot themeId={themeId} item={groups.carton} /> : null}
              </div>
              {groups.carton ? (
                <p className="vr-kit__fine">실물 키트는 카툰박스에 담겨 배송됩니다.</p>
              ) : null}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
