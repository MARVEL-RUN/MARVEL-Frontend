"use client";

import Image from "next/image";
import { useState } from "react";
import { MAIN_ASSETS } from "@/lib/assets";
import { EVENT } from "@/lib/event";
import type { CourseId } from "@/lib/register";
import { MedalViewer } from "./MedalViewer";

export function KitGallery() {
  const [selectedId, setSelected] = useState<CourseId>(EVENT.courses[0].id);
  const course = EVENT.courses.find((c) => c.id === selectedId) ?? EVENT.courses[0];

  return (
    <div className="kit-gallery">
      <section className="kit-gallery__pane">
        <h3>피니셔 메달</h3>
        <div className="kit-gallery__picks" role="tablist" aria-label="코스별 메달">
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
                  alt={`${course.distance} 피니셔 메달 회전`}
                  fill
                  sizes="(max-width: 860px) 50vw, 280px"
                />
              </span>
              <figcaption>회전</figcaption>
            </figure>
          </li>
          <li>
            <figure>
              <span className="kit-gallery__frame kit-gallery__frame--back">
                <Image
                  src={course.medalBack}
                  alt={`${course.distance} 피니셔 메달 후면`}
                  fill
                  sizes="(max-width: 860px) 50vw, 280px"
                />
              </span>
              <figcaption>후면</figcaption>
            </figure>
          </li>
          <li>
            <figure>
              <span className="kit-gallery__frame kit-gallery__frame--3d">
                <MedalViewer />
              </span>
              <figcaption>3D</figcaption>
            </figure>
          </li>
        </ul>
      </section>
      <section className="kit-gallery__pane kit-gallery__pane--bib">
        <h3>배번호</h3>
        <figure className="kit-gallery__bib">
          <span className="kit-gallery__frame kit-gallery__frame--bib">
            <Image
              src={MAIN_ASSETS.kitBib}
              alt="배번호"
              fill
              sizes="(max-width: 860px) 100vw, 720px"
            />
          </span>
        </figure>
      </section>
    </div>
  );
}
