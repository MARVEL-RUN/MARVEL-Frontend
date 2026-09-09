"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { EVENT } from "@/lib/event";
import type { CourseId } from "@/lib/register";

export function CourseMaps() {
  const [openId, setOpen] = useState<CourseId | null>(null);
  const open = EVENT.courses.find((c) => c.id === openId);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  return (
    <>
      <div className="course-maps">
        {EVENT.courses.map((c) => (
          <figure key={c.id} className="course-map">
            <button
              type="button"
              className="course-map__open"
              onClick={() => setOpen(c.id)}
              aria-label={`${c.distance} 코스도 크게 보기`}
            >
              <Image
                src={c.map}
                alt={`${c.distance} 코스도`}
                width={2186}
                height={2160}
                sizes="(max-width: 1120px) 100vw, 1120px"
              />
            </button>
            <figcaption>{c.distance} Course</figcaption>
          </figure>
        ))}
      </div>
      {open ? (
        <div
          className="course-preview"
          role="dialog"
          aria-modal="true"
          aria-label={`${open.distance} 코스도`}
        >
          <button
            type="button"
            className="course-preview__dim"
            onClick={() => setOpen(null)}
            aria-label="닫기"
          />
          <div className="course-preview__frame">
            <Image
              src={open.map}
              alt={`${open.distance} 코스도`}
              width={2186}
              height={2160}
              sizes="100vw"
            />
          </div>
          <button
            type="button"
            className="course-preview__close"
            onClick={() => setOpen(null)}
          >
            닫기
          </button>
        </div>
      ) : null}
    </>
  );
}
