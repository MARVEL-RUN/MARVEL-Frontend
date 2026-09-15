"use client";

import Image from "next/image";
import { useState } from "react";
import { MAIN_ASSETS } from "@/lib/assets";
import { EVENT } from "@/lib/event";
import { SHIRT_SIZES, type CourseId } from "@/lib/register";
// import { MedalViewer } from "./MedalViewer"; /* 모바일 불안정 — 3D 보류 */

export function KitGallery() {
  return (
    <div className="kit-gallery">
      <KitMedalPane />
      <KitShirtPane />
      <KitBibPane />
      <KitScarfPane />
    </div>
  );
}

export function KitMedalPane() {
  const [selectedId, setSelected] = useState<CourseId>(EVENT.courses[0].id);
  const course = EVENT.courses.find((c) => c.id === selectedId) ?? EVENT.courses[0];
  const lineup = ["10k", "5k", "2.3k"]
    .map((id) => EVENT.courses.find((c) => c.id === id))
    .filter((c): c is (typeof EVENT.courses)[number] => Boolean(c));

  return (
    <section className="kit-gallery__pane">
      <header className="kit-gallery__head">
        <p className="kit-gallery__index">01 / MEDAL</p>
        <h3>피니셔 메달</h3>
      </header>
      <ul className="kit-gallery__lineup" aria-label="코스별 메달">
        {lineup.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              className={c.id === course.id ? "is-on" : undefined}
              onClick={() => setSelected(c.id)}
            >
              <span className="kit-gallery__lineup-shot">
                <img
                  src={c.medalRibbon}
                  alt={`${c.distance} 피니셔 메달`}
                  loading="eager"
                  decoding="async"
                />
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="kit-gallery__picks" role="tablist" aria-label="코스별 메달 상세">
        {EVENT.courses.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === course.id}
            className={c.id === course.id ? "is-on" : undefined}
            onClick={() => setSelected(c.id)}
          >
            {c.distance}
          </button>
        ))}
      </div>
      <ul className="kit-gallery__medals">
        {/* 모바일 불안정 — 3D 보류
        {course.medal3d ? (
          <li>
            <figure>
              <span className="kit-gallery__frame kit-gallery__frame--3d">
                <MedalViewer
                  key={course.medal3d}
                  src={course.medal3d}
                  poster={course.medalTurn}
                  alt={`${course.distance} 피니셔 메달 3D`}
                />
              </span>
              <figcaption>3D</figcaption>
            </figure>
          </li>
        ) : null}
        */}
        <li>
          <figure>
            <span className="kit-gallery__frame">
              <Image
                src={course.medalTurn}
                alt={`${course.distance} 피니셔 메달 화살표 방향 회전`}
                fill
                sizes="(max-width: 720px) 50vw, 280px"
              />
            </span>
            <figcaption>화살표 방향 회전</figcaption>
          </figure>
        </li>
        <li>
          <figure>
            <span className="kit-gallery__frame kit-gallery__frame--back">
              <Image
                src={course.medalBack}
                alt={`${course.distance} 피니셔 메달 후면`}
                fill
                sizes="(max-width: 720px) 50vw, 280px"
              />
            </span>
            <figcaption>후면</figcaption>
          </figure>
        </li>
      </ul>
      <p className="kit-gallery__note">선택한 코스에 따라 지급됩니다.</p>
      {/* 모바일 불안정 — 3D 보류
      {course.medal3d ? (
        <p className="kit-gallery__note">
          ※ 3D 이미지는 연출용이며, 실제 지급 메달과 다를 수 있습니다.
        </p>
      ) : null}
      */}
    </section>
  );
}

export function KitShirtPane() {
  return (
    <section className="kit-gallery__pane">
      <header className="kit-gallery__head">
        <p className="kit-gallery__index">02 / SHIRT</p>
        <h3>공식 티셔츠</h3>
      </header>
      <ul className="kit-gallery__shirts">
        <li>
          <figure>
            <span className="kit-gallery__frame kit-gallery__frame--shirt">
              <Image
                src={MAIN_ASSETS.kitShirtFront}
                alt="공식 티셔츠 앞면"
                fill
                sizes="(max-width: 720px) 50vw, 540px"
                priority
              />
            </span>
            <figcaption>앞면</figcaption>
          </figure>
        </li>
        <li>
          <figure>
            <span className="kit-gallery__frame kit-gallery__frame--shirt">
              <Image
                src={MAIN_ASSETS.kitShirtBack}
                alt="공식 티셔츠 뒷면"
                fill
                sizes="(max-width: 720px) 50vw, 540px"
                priority
              />
            </span>
            <figcaption>뒷면</figcaption>
          </figure>
        </li>
      </ul>
      <p className="kit-gallery__note">사이즈 {SHIRT_SIZES.join(" · ")}</p>
    </section>
  );
}

export function KitBibPane() {
  return (
    <section className="kit-gallery__pane kit-gallery__pane--bib">
      <header className="kit-gallery__head">
        <p className="kit-gallery__index">03 / BIB</p>
        <h3>배번표</h3>
      </header>
      <figure className="kit-gallery__bib">
        <span className="kit-gallery__frame kit-gallery__frame--bib">
          <Image
            src={MAIN_ASSETS.kitBib}
            alt="배번표"
            width={1272}
            height={1142}
            sizes="(max-width: 720px) 100vw, 1100px"
            priority
          />
        </span>
      </figure>
      <p className="kit-gallery__note">
        ※ 배번표 뒷면에 기록칩이 부착되어 있습니다. 2.3 Km 부문에는 기록칩이 없습니다.
      </p>
    </section>
  );
}

export function KitScarfPane() {
  return (
    <section className="kit-gallery__pane">
      <header className="kit-gallery__head">
        <p className="kit-gallery__index">04 / SCARF</p>
        <h3>스카프</h3>
      </header>
      <ul className="kit-gallery__scarves">
        <li>
          <figure>
            <span className="kit-gallery__frame kit-gallery__frame--scarf-front">
              <Image
                src={MAIN_ASSETS.kitScarfFront}
                alt="스카프 앞면"
                fill
                sizes="(max-width: 720px) 100vw, 1100px"
                priority
              />
            </span>
            <figcaption>앞면</figcaption>
          </figure>
        </li>
        <li>
          <figure>
            <span className="kit-gallery__frame kit-gallery__frame--scarf-back">
              <Image
                src={MAIN_ASSETS.kitScarfBack}
                alt="스카프 뒷면"
                fill
                sizes="(max-width: 720px) 100vw, 1100px"
                priority
              />
            </span>
            <figcaption>뒷면</figcaption>
          </figure>
        </li>
      </ul>
    </section>
  );
}
