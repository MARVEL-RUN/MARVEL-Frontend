"use client";

import Image from "next/image";
import { useEffect } from "react";
import { EVENT } from "@/lib/event";

type Course = (typeof EVENT.courses)[number];

export function CoursePreview({
  course,
  onClose,
}: {
  course: Course;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="course-preview"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-preview-title"
    >
      <button
        type="button"
        className="course-preview__dim"
        onClick={onClose}
        aria-label="미리보기 닫기"
      />
      <div className="course-preview__sheet">
        <header className="course-preview__bar">
          <p className="course-preview__kicker">PREVIEW</p>
          <h3 id="course-preview-title">{course.distance} Course</h3>
          <button type="button" className="course-preview__close" onClick={onClose}>
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
  );
}
