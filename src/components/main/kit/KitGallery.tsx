"use client";

import Image from "next/image";
import { useState } from "react";
import { MAIN_ASSETS } from "@/lib/assets";
import { EVENT } from "@/lib/event";
import { type CourseId } from "@/lib/register";

const SHIRT_SPEC_KIDS = ["130", "150"] as const;
const SHIRT_SPEC_ADULT = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"] as const;

const SHIRT_SPEC_ROWS: {
  label: string;
  kids: [string, string];
  adult: [string, string, string, string, string, string, string];
  delta: string;
}[] = [
  { label: "총장", kids: ["47.5", "55.5"], adult: ["64", "67", "70", "73", "76", "79", "82"], delta: "3" },
  { label: "가슴둘레", kids: ["42.5", "47.5"], adult: ["55.5", "58", "60.5", "63", "65.5", "68", "70.5"], delta: "2.5" },
  { label: "밑단둘레", kids: ["41.5", "46.5"], adult: ["54", "56.5", "59", "61.5", "64", "66.5", "69"], delta: "2.5" },
  { label: "어깨너비", kids: ["40", "44"], adult: ["48", "50", "52", "54", "56", "58", "60"], delta: "2" },
  { label: "소매통", kids: ["16.5", "18.5"], adult: ["23", "24", "25", "26", "27", "28", "29"], delta: "1" },
  { label: "소매길이", kids: ["16.5", "19.5"], adult: ["20", "21.5", "23", "24.5", "26", "27.5", "29"], delta: "1.5" },
  { label: "소매부리", kids: ["16", "18"], adult: ["21", "21.5", "22", "22.5", "23", "23.5", "24"], delta: "0.5" },
  { label: "옆목너비", kids: ["17", "18"], adult: ["18", "18.5", "19", "19.5", "20", "20.5", "21"], delta: "0.5" },
  { label: "앞목깊이", kids: ["7.5", "8.5"], adult: ["8", "8.5", "9", "9.5", "10", "10.5", "11"], delta: "0.5" },
  { label: "앞넘김", kids: ["", ""], adult: ["2", "2", "2", "2", "2", "2", "2"], delta: "" },
  { label: "에리 림", kids: ["1.5", "1.5"], adult: ["2", "2", "2", "2", "2", "2", "2"], delta: "" },
];

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
                  loading="lazy"
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
              />
            </span>
            <figcaption>뒷면</figcaption>
          </figure>
        </li>
      </ul>
      <div className="kit-spec">
        <h4 className="kit-spec__title">티셔츠 조견표</h4>
        <p className="kit-spec__caption">SIZE SPEC (단면기준)</p>
        <div className="kit-spec__scroll">
          <table className="kit-spec__table">
            <thead>
              <tr>
                <th rowSpan={2} colSpan={2}>
                  구분(단면기준)
                </th>
                <th colSpan={SHIRT_SPEC_KIDS.length}>어린이</th>
                <th colSpan={SHIRT_SPEC_ADULT.length + 1}>일반</th>
              </tr>
              <tr>
                {SHIRT_SPEC_KIDS.map((size) => (
                  <th key={size}>{size}</th>
                ))}
                {SHIRT_SPEC_ADULT.map((size) => (
                  <th key={size}>{size}</th>
                ))}
                <th>편차</th>
              </tr>
            </thead>
            <tbody>
              {SHIRT_SPEC_ROWS.map((row, i) => (
                <tr key={row.label}>
                  {i === 0 ? (
                    <th rowSpan={SHIRT_SPEC_ROWS.length} scope="row">
                      상의
                    </th>
                  ) : null}
                  <th scope="row">{row.label}</th>
                  {row.kids.map((value, k) => (
                    <td key={SHIRT_SPEC_KIDS[k]}>{value}</td>
                  ))}
                  {row.adult.map((value, k) => (
                    <td key={SHIRT_SPEC_ADULT[k]}>{value}</td>
                  ))}
                  <td>{row.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="kit-spec__notes">
          <p>※ 주의사항</p>
          <p>제품 원단의 특성에 따라 편차 범위 안에서 실측과 다를 수 있습니다.</p>
        </div>
      </div>
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
            fill
            sizes="(max-width: 720px) 100vw, 640px"
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
              />
            </span>
            <figcaption>뒷면</figcaption>
          </figure>
        </li>
      </ul>
    </section>
  );
}
