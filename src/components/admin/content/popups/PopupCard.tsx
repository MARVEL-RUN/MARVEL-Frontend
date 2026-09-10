"use client";

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
    onChange({ imageUrl: url });
  };

  const stop = (event: MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <article className="admin-popup-card">
      <div
        className={`admin-popup-card__inner${flipped ? " is-flipped" : ""}`}
        onClick={onFlip}
      >
        <div className="admin-popup-card__face admin-popup-card__front">
          <span className="admin-popup-card__order">{index + 1}</span>
          <span className={`admin-popup-card__badge${row.visible ? " is-on" : ""}`}>
            {row.visible ? "공개" : "비공개"}
          </span>
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

        <div className="admin-popup-card__face admin-popup-card__back" onClick={stop}>
          <div className="admin-popup-card__tools">
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
            <button type="button" className="is-close" aria-label="접기" onClick={onFlip}>
              <X size={16} />
            </button>
          </div>

          <label className="admin-popup-card__field">
            이미지 변경
            <span className="admin-popup-card__file">
              <button
                type="button"
                className="admin-btn admin-btn--ghost"
                onClick={() => fileRef.current?.click()}
              >
                이미지 선택
              </button>
              <span>{row.imageUrl ? "선택됨 / 20MB 이하" : "파일 없음 / 20MB 이하"}</span>
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={onPickImage}
            />
          </label>

          <label className="admin-popup-card__field">
            링크 URL
            <input
              value={row.url}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder="https://example.com"
            />
          </label>

          <label className="admin-popup-card__field">
            디바이스
            <select
              value={row.device}
              onChange={(e) => onChange({ device: e.target.value as PopupDevice })}
            >
              {DEVICE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-popup-card__field">
            시작일시
            <input
              type="datetime-local"
              value={row.startAt}
              onChange={(e) => onChange({ startAt: e.target.value })}
            />
          </label>

          <label className="admin-popup-card__field">
            종료일시
            <input
              type="datetime-local"
              value={row.endAt}
              onChange={(e) => onChange({ endAt: e.target.value })}
            />
          </label>

          <label className="admin-form__check admin-popup-card__check">
            <input
              type="checkbox"
              checked={row.visible}
              onChange={(e) => onChange({ visible: e.target.checked })}
            />
            공개
          </label>
        </div>
      </div>
    </article>
  );
}
