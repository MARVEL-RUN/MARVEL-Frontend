"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ONSITE_BOOTHS } from "@/lib/onsite-program";

function BoothCard({
  item,
  open,
  onToggle,
}: {
  item: (typeof ONSITE_BOOTHS)[number];
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const logoClass =
    item.id === "taping"
      ? "onsite-booth__logo onsite-booth__logo--blend"
      : "onsite-booth__logo";

  return (
    <li
      className={`onsite-booth onsite-tone--${item.tone}${open ? " is-open" : ""}`}
    >
      <button
        type="button"
        className="onsite-booth__frame"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <Image
          src={item.photo}
          alt=""
          fill
          className="onsite-booth__art"
          sizes="(max-width: 720px) 88vw, 280px"
        />
        <span className="onsite-booth__shade" aria-hidden />
        <span className="onsite-booth__copy">
          <span className="onsite-booth__en">{item.en}</span>
          <span className="onsite-booth__title">{item.title}</span>
          <span className="onsite-booth__hint" aria-hidden>
            {open ? "닫기" : "자세히"}
          </span>
        </span>
      </button>

      <div id={panelId} className="onsite-booth__panel" hidden={!open}>
        <div className="onsite-booth__panel-in">
          <p className="onsite-booth__tagline">{item.tagline}</p>
          {item.logo ? (
            <Image
              src={item.logo.src}
              alt={item.partner}
              width={item.logo.width}
              height={item.logo.height}
              className={logoClass}
            />
          ) : (
            <p className="onsite-booth__name">{item.partner}</p>
          )}
          {item.about ? <p className="onsite-booth__about">{item.about}</p> : null}
          <p className="onsite-booth__body">{item.body}</p>
        </div>
      </div>
    </li>
  );
}

export function OnsiteBooths() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ul className="onsite-booths" data-open={openId ? "" : undefined}>
      {ONSITE_BOOTHS.map((item) => (
        <BoothCard
          key={item.id}
          item={item}
          open={openId === item.id}
          onToggle={() => setOpenId((v) => (v === item.id ? null : item.id))}
        />
      ))}
    </ul>
  );
}
