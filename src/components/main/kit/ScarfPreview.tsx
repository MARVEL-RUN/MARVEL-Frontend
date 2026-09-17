"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MAIN_ASSETS } from "@/lib/assets";

export type ScarfFace = "front" | "back";

const FACES: Record<ScarfFace, { src: string; label: string }> = {
  front: { src: MAIN_ASSETS.kitScarfFront, label: "앞면" },
  back: { src: MAIN_ASSETS.kitScarfBack, label: "뒷면" },
};

export function ScarfPreview({
  face: initialFace,
  onClose,
}: {
  face: ScarfFace;
  onClose: () => void;
}) {
  const [face, setFace] = useState<ScarfFace>(initialFace);
  const current = FACES[face];

  useEffect(() => {
    setFace(initialFace);
  }, [initialFace]);

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

  return (
    <div
      className="course-preview scarf-preview"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scarf-preview-title"
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
          <h3 id="scarf-preview-title">응원스카프 {current.label}</h3>
          <button type="button" className="course-preview__close" onClick={onClose}>
            닫기
          </button>
        </header>
        <div className="course-preview__stage">
          <div className="scarf-preview__scroller">
            <div className="scarf-preview__pic">
              <Image
                src={current.src}
                alt={`응원스카프 ${current.label}`}
                fill
                sizes="4000px"
                priority
              />
            </div>
          </div>
        </div>
        <div className="scarf-preview__tools">
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
        <p className="course-preview__foot">
          <span className="course-preview__hint-desk">좌우로 밀어 자세히 보고, Esc로 닫기</span>
          <span className="course-preview__hint-mob">좌우로 밀어 자세히 보고, 바깥을 눌러 닫기</span>
        </p>
      </div>
    </div>
  );
}
