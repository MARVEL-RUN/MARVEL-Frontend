"use client";

import type { AdminPopup } from "@/types/popup";
import { X } from "lucide-react";
import { useMemo, useState } from "react";

type Props = {
  rows: AdminPopup[];
};

function PreviewPane({
  title,
  items,
  mobile,
}: {
  title: string;
  items: AdminPopup[];
  mobile?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [hidden, setHidden] = useState(false);
  const current = items[index] ?? null;

  if (hidden || !current) {
    return (
      <section className={`admin-popup-preview__pane${mobile ? " is-mobile" : ""}`}>
        <h3>{title}</h3>
        <div className="admin-popup-preview__frame is-empty">
          <p>{items.length ? "팝업이 닫혔습니다." : "표시할 팝업이 없습니다."}</p>
          {items.length ? (
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setHidden(false)}>
              다시 보기
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className={`admin-popup-preview__pane${mobile ? " is-mobile" : ""}`}>
      <h3>{title}</h3>
      <div className="admin-popup-preview__frame">
        <div className="admin-popup-preview__dialog">
          {mobile && items.length > 1 ? (
            <span className="admin-popup-preview__pager">
              {index + 1}/{items.length}
            </span>
          ) : null}
          <button
            type="button"
            className="admin-popup-preview__x"
            aria-label="닫기"
            onClick={() => setHidden(true)}
          >
            <X size={14} />
          </button>
          <div className="admin-popup-preview__image">
            {current.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={current.imageUrl} alt="" />
            ) : (
              <p>이미지 없음</p>
            )}
          </div>
          <div className="admin-popup-preview__bar">
            <label>
              <input type="checkbox" />
              오늘 하루 보지 않음
            </label>
            <div className="admin-popup-preview__nav">
              {mobile && items.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIndex((v) => Math.max(0, v - 1))}
                    disabled={index === 0}
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    onClick={() => setIndex((v) => Math.min(items.length - 1, v + 1))}
                    disabled={index >= items.length - 1}
                  >
                    다음
                  </button>
                </>
              ) : null}
              <button type="button" onClick={() => setHidden(true)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PopupPreview({ rows }: Props) {
  const desktop = useMemo(
    () => rows.filter((row) => row.device === "BOTH" || row.device === "PC"),
    [rows],
  );
  const mobile = useMemo(
    () => rows.filter((row) => row.device === "BOTH" || row.device === "MOBILE"),
    [rows],
  );

  return (
    <div className="admin-popup-preview">
      <p className="admin-popup-preview__meta">
        데스크탑 {desktop.length}개 · 모바일 {mobile.length}개
      </p>
      <div className="admin-popup-preview__grid">
        <PreviewPane title="데스크탑 미리보기" items={desktop} />
        <PreviewPane title="모바일 미리보기" items={mobile} mobile />
      </div>
    </div>
  );
}
