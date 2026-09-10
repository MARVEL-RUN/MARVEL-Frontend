"use client";

import { SquareArrowOutUpRight, X } from "lucide-react";
import { useRef } from "react";

export type AdminAttachFile = {
  id: string;
  name: string;
  size: number;
};

const ACCEPT =
  ".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png,application/pdf";
const MAX_FILES = 10;
const MAX_NAME = 80;

const NOTES = [
  "텍스트 에디터 내 이미지: JPG, PNG (크기 조절 가능)",
  "첨부파일: JPG, PNG, PDF, DOC, XLS, XLSX",
  "첨부파일 이름이 너무 길면 등록이 실패할 수 있습니다",
];

type Props = {
  files: AdminAttachFile[];
  onChange: (files: AdminAttachFile[]) => void;
  max?: number;
};

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminAttachFiles({ files, onChange, max = MAX_FILES }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const left = Math.max(0, max - files.length);

  const pick = () => {
    if (left <= 0) return;
    inputRef.current?.click();
  };

  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (picked.length === 0) return;

    const next = [...files];
    for (const file of picked) {
      if (next.length >= max) break;
      if (file.name.length > MAX_NAME) continue;
      next.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: file.size,
      });
    }
    onChange(next);
  };

  const remove = (id: string) => onChange(files.filter((file) => file.id !== id));

  return (
    <div className="admin-attach">
      <div className="admin-attach__head">
        <strong>첨부파일</strong>
        <span>
          {files.length}개 / {max}개
        </span>
      </div>

      <button type="button" className="admin-btn admin-btn--ghost admin-attach__upload" onClick={pick}>
        첨부파일 업로드
        <SquareArrowOutUpRight size={14} strokeWidth={2.25} />
      </button>
      <input
        ref={inputRef}
        type="file"
        className="admin-attach__input"
        accept={ACCEPT}
        multiple
        onChange={onPick}
      />

      <div className={`admin-attach__box${files.length ? " has-files" : ""}`}>
        {files.length === 0 ? (
          <p className="admin-attach__empty">등록된 파일이 없습니다.</p>
        ) : (
          <ul className="admin-attach__list">
            {files.map((file) => (
              <li key={file.id}>
                <span className="admin-attach__name">{file.name}</span>
                <span className="admin-attach__size">{formatSize(file.size)}</span>
                <button
                  type="button"
                  className="admin-attach__remove"
                  aria-label={`${file.name} 삭제`}
                  onClick={() => remove(file.id)}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ul className="admin-attach__notes">
        {NOTES.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}
