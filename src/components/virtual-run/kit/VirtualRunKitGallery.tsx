"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import { VIRTUAL_RUN_ASSETS } from "@/lib/virtual-run/assets";
import {
  VIRTUAL_RUN_KIT_THEMES,
  virtualRunKitImage,
  type VirtualRunKitItem,
  type VirtualRunKitItemKind,
  type VirtualRunKitThemeId,
} from "@/lib/virtual-run/kit";

const SECTION_KINDS: { kind: VirtualRunKitItemKind; code: string }[] = [
  { kind: "bib", code: "BIB" },
  { kind: "keycap-keyring", code: "KEYRING" },
  { kind: "bandana", code: "BANDANA" },
  { kind: "socks", code: "SOCKS" },
  { kind: "sticker", code: "STICKER" },
  { kind: "sticker-pack", code: "STICKER" },
  { kind: "finish-line", code: "FINISH" },
  { kind: "package", code: "PACKAGE" },
];

function itemOf(items: readonly VirtualRunKitItem[], kind: VirtualRunKitItemKind) {
  return items.find((entry) => entry.kind === kind);
}

function figureClass(kind: VirtualRunKitItemKind) {
  if (kind === "keycap-keyring") return "vr-kit-pane__figure vr-kit-pane__figure--sideways";
  if (kind === "finish-line") return "vr-kit-pane__figure vr-kit-pane__figure--wide";
  return "vr-kit-pane__figure";
}

function imageSize(kind: VirtualRunKitItemKind) {
  if (kind === "keycap-keyring") return { width: 311, height: 2082 };
  if (kind === "finish-line") return { width: 3304, height: 1107 };
  return { width: 1200, height: 1200 };
}

function sectionsFor(items: readonly VirtualRunKitItem[]) {
  return SECTION_KINDS.flatMap((section) => {
    const item = itemOf(items, section.kind);
    return item ? [{ ...section, item }] : [];
  });
}

function KitPane({
  order,
  code,
  title,
  note,
  children,
}: {
  order: number;
  code: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <section className="vr-kit-pane">
      <header className="vr-kit-pane__head">
        <p className="vr-kit-pane__index">{`${String(order).padStart(2, "0")} / ${code}`}</p>
        <h2>{title}</h2>
      </header>
      {children}
      {note ? <p className="vr-kit-pane__note">{note}</p> : null}
    </section>
  );
}

export function VirtualRunKitGallery() {
  const [themeId, setThemeId] = useState<VirtualRunKitThemeId>("avengers");
  const theme = VIRTUAL_RUN_KIT_THEMES.find((entry) => entry.id === themeId) ?? VIRTUAL_RUN_KIT_THEMES[0];
  const medalCase = itemOf(theme.items, "medal-case");
  const packageFull = itemOf(theme.items, "package-full");
  const cartonBox = itemOf(theme.items, "carton-box");
  const sections = sectionsFor(theme.items);

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
            onClick={() => setThemeId(entry.id)}
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

      <KitPane order={1} code="MEDAL" title="피니셔 메달" note="선택한 테마에 따라 지급됩니다.">
        <div className="vr-kit-pane__pair vr-kit-pane__pair--medal">
          <figure>
            <Image
              src={VIRTUAL_RUN_ASSETS.kitMedal[theme.id]}
              alt={`${theme.label} 피니셔 메달`}
              width={1900}
              height={1522}
              sizes="(max-width: 720px) 46vw, 440px"
            />
            <figcaption>메달</figcaption>
          </figure>
          {medalCase ? (
            <figure>
              <Image
                src={virtualRunKitImage(theme.id, medalCase.file)}
                alt={medalCase.label}
                width={1012}
                height={1302}
                sizes="(max-width: 720px) 46vw, 440px"
              />
              <figcaption>{medalCase.label}</figcaption>
            </figure>
          ) : null}
        </div>
      </KitPane>

      {packageFull || cartonBox ? (
        <KitPane order={2} code="PACKAGE" title="패키지">
          <div className="vr-kit-pane__pair">
            {packageFull ? (
              <figure>
                <Image
                  src={virtualRunKitImage(theme.id, packageFull.file)}
                  alt={packageFull.label}
                  width={1671}
                  height={1473}
                  sizes="(max-width: 720px) 46vw, 440px"
                />
                <figcaption>{packageFull.label}</figcaption>
              </figure>
            ) : null}
            {cartonBox ? (
              <figure>
                <Image
                  src={virtualRunKitImage(theme.id, cartonBox.file)}
                  alt={cartonBox.label}
                  width={2487}
                  height={2190}
                  sizes="(max-width: 720px) 46vw, 440px"
                />
                <figcaption>{cartonBox.label}</figcaption>
              </figure>
            ) : null}
          </div>
        </KitPane>
      ) : null}

      {sections.map((section, index) => (
        <KitPane key={section.kind} order={index + 3} code={section.code} title={section.item.label}>
          <figure className={figureClass(section.kind)}>
            <Image
              src={virtualRunKitImage(theme.id, section.item.file)}
              alt={section.item.label}
              width={imageSize(section.kind).width}
              height={imageSize(section.kind).height}
              sizes={
                section.kind === "finish-line" || section.kind === "keycap-keyring"
                  ? "(max-width: 720px) 92vw, 800px"
                  : "(max-width: 720px) 70vw, 380px"
              }
            />
          </figure>
        </KitPane>
      ))}
    </div>
  );
}
