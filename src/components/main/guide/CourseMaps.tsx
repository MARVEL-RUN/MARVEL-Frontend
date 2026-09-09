"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { EVENT } from "@/lib/event";
import type { CourseId } from "@/lib/register";

export function CourseMaps() {
  const [selectedId, setSelected] = useState<CourseId>(EVENT.courses[0].id);
  const [preview, setPreview] = useState(false);
  const course = EVENT.courses.find((c) => c.id === selectedId) ?? EVENT.courses[0];

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreview(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [preview]);

  return (
    <>
      <div className="course-guide">
        <div className="course-guide__info">
          <div className="course-guide__picks" role="tablist" aria-label="코스 선택">
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
          <p className={`course-guide__code course-guide__code--${course.tone}`}>
            {course.code}
          </p>
          <p className="course-guide__dist">{course.distance}</p>
          <p className="course-guide__desc">{course.desc}</p>
          <dl>
            <div>
              <dt>스타트</dt>
              <dd>{course.start}</dd>
            </div>
            <div>
              <dt>제한</dt>
              <dd>{course.timeLimit}</dd>
            </div>
            <div>
              <dt>참가비</dt>
              <dd>{course.fee}</dd>
            </div>
          </dl>
          <p className="course-guide__hint">이미지를 누르면 크게 볼 수 있습니다</p>
        </div>
        <figure className="course-guide__map">
          <button
            type="button"
            className="course-guide__open"
            onClick={() => setPreview(true)}
            aria-label={`${course.distance} 코스도 미리보기`}
          >
            {EVENT.courses.map((c) => (
              <span
                key={c.id}
                className={c.id === course.id ? "course-guide__shot is-on" : "course-guide__shot"}
              >
                <Image
                  src={c.map}
                  alt=""
                  fill
                  sizes="(max-width: 860px) 100vw, 60vw"
                />
              </span>
            ))}
          </button>
        </figure>
      </div>
      {preview ? (
        <div
          className="course-preview"
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-preview-title"
        >
          <button
            type="button"
            className="course-preview__dim"
            onClick={() => setPreview(false)}
            aria-label="미리보기 닫기"
          />
          <div className="course-preview__sheet">
            <header className="course-preview__bar">
              <p className="course-preview__kicker">PREVIEW</p>
              <h3 id="course-preview-title">
                {course.distance} Course
              </h3>
              <button
                type="button"
                className="course-preview__close"
                onClick={() => setPreview(false)}
              >
                닫기
              </button>
            </header>
            <div className="course-preview__stage">
              <div className="course-preview__pic">
                <Image
                  src={course.map}
                  alt={`${course.distance} 코스도`}
                  fill
                  sizes="100vw"
                />
              </div>
            </div>
            <p className="course-preview__foot">바깥을 누르거나 Esc로 닫기</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
