"use client";

import Image from "next/image";
import { useState } from "react";
import { EVENT } from "@/lib/event";
import type { CourseId } from "@/lib/register";
import { CoursePreview } from "./CoursePreview";

export function CourseMaps() {
  const [selectedId, setSelected] = useState<CourseId>(EVENT.courses[0].id);
  const [preview, setPreview] = useState(false);
  const course = EVENT.courses.find((c) => c.id === selectedId) ?? EVENT.courses[0];

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
        <CoursePreview course={course} onClose={() => setPreview(false)} />
      ) : null}
    </>
  );
}
