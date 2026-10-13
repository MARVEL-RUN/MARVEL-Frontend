"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ONSITE_BOOTHS, type OnsiteBoothItem } from "@/lib/onsite-program";

function logoClass(id: string) {
  return id === "taping" || id === "tattoo"
    ? "onsite-booth__logo onsite-booth__logo--blend"
    : "onsite-booth__logo";
}

function BoothPoster({
  item,
  onOpen,
}: {
  item: OnsiteBoothItem;
  onOpen: () => void;
}) {
  return (
    <li className={`onsite-booth onsite-tone--${item.tone}`}>
      <button type="button" className="onsite-booth__frame" onClick={onOpen}>
        <Image
          src={item.photo}
          alt=""
          fill
          className="onsite-booth__art"
          sizes="(max-width: 720px) 46vw, 260px"
        />
        <span className="onsite-booth__shade" aria-hidden />
        <span className="onsite-booth__copy">
          {item.logo ? (
            <Image
              src={item.logo.src}
              alt=""
              width={item.logo.width}
              height={item.logo.height}
              className={logoClass(item.id)}
            />
          ) : null}
          <span className="onsite-booth__en">{item.en}</span>
          <span className="onsite-booth__title">{item.title}</span>
          <span className="onsite-booth__hint" aria-hidden>
            자세히
          </span>
        </span>
      </button>
    </li>
  );
}

function BoothDetail({ item, onClose }: { item: OnsiteBoothItem; onClose: () => void }) {
  const titleId = useId();

  return (
    <div className={`onsite-detail onsite-tone--${item.tone}`}>
      <div className="onsite-detail__photo">
        <Image
          src={item.photo}
          alt=""
          fill
          className="onsite-booth__art"
          sizes="(max-width: 720px) 100vw, 420px"
        />
      </div>
      <div className="onsite-detail__panel">
        <div className="onsite-detail__head">
          <p className="onsite-booth__en">{item.en}</p>
          <h3 id={titleId} className="onsite-detail__title">
            {item.title}
          </h3>
          <button type="button" className="onsite-detail__close" onClick={onClose}>
            닫기
          </button>
        </div>
        <p className="onsite-booth__tagline">{item.tagline}</p>
        {item.logo ? (
          <Image
            src={item.logo.src}
            alt={item.partner}
            width={item.logo.width}
            height={item.logo.height}
            className={logoClass(item.id)}
          />
        ) : (
          <p className="onsite-booth__name">{item.partner}</p>
        )}
        {item.about ? <p className="onsite-booth__about">{item.about}</p> : null}
        <p className="onsite-booth__body">{item.body}</p>
      </div>
    </div>
  );
}

export function OnsiteBooths() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = ONSITE_BOOTHS.find((item) => item.id === openId);

  if (!open) {
    return (
      <ul className="onsite-booths">
        {ONSITE_BOOTHS.map((item) => (
          <BoothPoster key={item.id} item={item} onOpen={() => setOpenId(item.id)} />
        ))}
      </ul>
    );
  }

  return (
    <div className="onsite-open">
      <ul className="onsite-picks" aria-label="부스 선택">
        {ONSITE_BOOTHS.map((item) => {
          const on = item.id === open.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`onsite-pick onsite-tone--${item.tone}${on ? " is-on" : ""}`}
                aria-pressed={on}
                onClick={() => setOpenId(on ? null : item.id)}
              >
                {item.logo ? (
                  <Image
                    src={item.logo.src}
                    alt=""
                    width={item.logo.width}
                    height={item.logo.height}
                    className={logoClass(item.id)}
                  />
                ) : (
                  <span className="onsite-pick__name">{item.partner}</span>
                )}
                <span className="onsite-pick__title">{item.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <BoothDetail item={open} onClose={() => setOpenId(null)} />
    </div>
  );
}
