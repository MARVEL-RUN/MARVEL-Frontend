"use client";

import { AdminSelect } from "@/components/admin/Select";
import type { AdminPopup, PopupDevice } from "@/types/popup";
import { ChevronDown, ChevronUp, Minus, Plus, X } from "lucide-react";
import { useRef, type ChangeEvent, type MouseEvent } from "react";

type Props = {
  row: AdminPopup;
  index: number;
  flipped: boolean;
  onFlip: () => void;
  onChange: (patch: Partial<AdminPopup>) => void;
  onMove: (dir: -1 | 1) => void;
  onAddAfter: () => void;
  onRemove: () => void;
};

const DEVICE_OPTIONS: { value: PopupDevice; label: string }[] = [
  { value: "BOTH", label: "전체" },
  { value: "PC", label: "PC" },
  { value: "MOBILE", label: "모바일" },
];

export function PopupCard({
  row,
  index,
  flipped,
  onFlip,
  onChange,
  onMove,
  onAddAfter,
  onRemove,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const onPickImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert("이미지는 20MB 이하만 업로드할 수 있습니다.");
      return;
    }
    const url = URL.createObjectURL(file);
    onChange({ imageUrl: url, imageName: file.name });
  };

  const clearImage = () => {
    onChange({ imageUrl: "", imageName: "" });
  };

  const stop = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const fileLabel = row.imageName || (row.imageUrl ? row.imageUrl.split("/").pop() : "");

  return (
    <article className="admin-popup-card">
      <div
        className={`admin-popup-card__inner${flipped ? " is-flipped" : ""}`}
        onClick={onFlip}
      >
        <div className="admin-popup-card__face admin-popup-card__front">
          <span className="admin-popup-card__order">{index + 1}</span>
          <div className="admin-popup-card__media">
            {row.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.imageUrl} alt="" />
            ) : (
              <p>이미지 없음</p>
            )}
          </div>
          <button type="button" className="admin-popup-card__flip">
            클릭하여 뒤집기
          </button>
        </div>

        <div className="admin-popup-card__face admin-popup-card__back">
          <div className="admin-popup-card__tools" onClick={stop}>
            <button type="button" aria-label="위로" onClick={() => onMove(-1)}>
              <ChevronUp size={16} />
            </button>
            <button type="button" aria-label="아래로" onClick={() => onMove(1)}>
              <ChevronDown size={16} />
            </button>
            <button type="button" aria-label="뒤에 추가" onClick={onAddAfter}>
              <Plus size={16} />
            </button>
            <button type="button" className="is-danger" aria-label="삭제" onClick={onRemove}>
              <Minus size={16} />
            </button>
          </div>

          <label className="admin-popup-card__field" onClick={stop}>
            이미지 변경
            <span className="admin-popup-card__file">
              {fileLabel ? (
                <span className="admin-popup-card__file-chip">
                  <span className="admin-popup-card__file-name" title={fileLabel}>
                    {fileLabel}
                  </span>
                  <button
                    type="button"
                    className="admin-popup-card__file-clear"
                    aria-label="이미지 제거"
                    onClick={clearImage}
                  >
                    <X size={14} />
                  </button>
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    onClick={() => fileRef.current?.click()}
                  >
                    이미지 선택
                  </button>
                  <span className="admin-popup-card__file-hint">20MB 이하</span>
                </>
              )}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={onPickImage}
            />
          </label>

          <label className="admin-popup-card__field" onClick={stop}>
            링크 URL
            <input
              value={row.url}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder="https://example.com"
            />
          </label>

          <label className="admin-popup-card__field" onClick={stop}>
            디바이스
            <AdminSelect
              value={row.device}
              options={DEVICE_OPTIONS}
              onChange={(device) => onChange({ device })}
              ariaLabel="디바이스"
              width="100%"
            />
          </label>

          <label className="admin-popup-card__field" onClick={stop}>
            시작일시
            <input
              type="datetime-local"
              value={row.startAt}
              onChange={(e) => onChange({ startAt: e.target.value })}
            />
          </label>

          <label className="admin-popup-card__field" onClick={stop}>
            종료일시
            <input
              type="datetime-local"
              value={row.endAt}
              onChange={(e) => onChange({ endAt: e.target.value })}
            />
          </label>

          <button type="button" className="admin-popup-card__flip">
            클릭하여 뒤집기
          </button>
        </div>
      </div>
    </article>
  );
}
