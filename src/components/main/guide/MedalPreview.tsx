"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { EVENT } from "@/lib/event";

type Course = (typeof EVENT.courses)[number];
export type MedalFace = "front" | "back";

export function MedalPreview({
  course,
  face: initialFace = "front",
  onClose,
}: {
  course: Course;
  face?: MedalFace;
  onClose: () => void;
}) {
  const [face, setFace] = useState<MedalFace>(initialFace);

  useEffect(() => {
    setFace(initialFace);
  }, [initialFace, course.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        setFace((cur) => (cur === "front" ? "back" : "front"));
      }
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function flip() {
    setFace((cur) => (cur === "front" ? "back" : "front"));
  }

  return (
    <div
      className="medal-preview"
      role="dialog"
      aria-modal="true"
      aria-labelledby="medal-preview-title"
    >
      <button
        type="button"
        className="medal-preview__dim"
        onClick={onClose}
        aria-label="미리보기 닫기"
      />
      <div className="medal-preview__sheet">
        <header className="medal-preview__bar">
          <p className="medal-preview__kicker">PREVIEW</p>
          <h3 id="medal-preview-title">
            {course.distance} {face === "front" ? "앞면" : "뒷면"}
          </h3>
          <button type="button" className="medal-preview__close" onClick={onClose}>
            닫기
          </button>
        </header>
        <div className="medal-preview__stage">
          <button
            type="button"
            className="kit-gallery__nav"
            onClick={flip}
            aria-label="앞면 뒷면 바꾸기"
          >
            ‹
          </button>
          <div className={`kit-gallery__flip${face === "back" ? " is-back" : ""}`}>
            <div className="kit-gallery__flip-inner">
              <span className="kit-gallery__face kit-gallery__face--front">
                <Image
                  src={course.medalFront}
                  alt={`${course.distance} 피니셔 메달 앞면`}
                  fill
                  sizes="80vw"
                />
              </span>
              <span className="kit-gallery__face kit-gallery__face--back">
                <Image
                  src={course.medalBack}
                  alt={`${course.distance} 피니셔 메달 뒷면`}
                  fill
                  sizes="80vw"
                />
              </span>
            </div>
          </div>
          <button
            type="button"
            className="kit-gallery__nav"
            onClick={flip}
            aria-label="앞면 뒷면 바꾸기"
          >
            ›
          </button>
        </div>
        <div className="medal-preview__tools">
          <button
            type="button"
            className={face === "front" ? "is-on" : undefined}
            onClick={() => setFace("front")}
          >
            앞면
          </button>
          <button
            type="button"
            className={face === "back" ? "is-on" : undefined}
            onClick={() => setFace("back")}
          >
            뒷면
          </button>
        </div>
        <p className="medal-preview__foot">화살표로 앞·뒷면을 바꾸고, Esc로 닫습니다</p>
      </div>
    </div>
  );
}
