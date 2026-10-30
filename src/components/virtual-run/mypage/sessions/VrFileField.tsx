"use client";

import { useId, useRef, useState } from "react";

type Props = {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  accept?: string;
  onChange?: (file: File | null) => void;
  error?: string;
};

export function VrFileField({
  name,
  label,
  required,
  hint,
  accept = "image/*",
  onChange,
  error,
}: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function pick() {
    inputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onChange?.(file);
    if (preview) URL.revokeObjectURL(preview);
    if (file) {
      setPreview(URL.createObjectURL(file));
      setFileName(file.name);
    } else {
      setPreview(null);
      setFileName(null);
    }
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = "";
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFileName(null);
    onChange?.(null);
  }

  return (
    <div className={error ? "vr-file is-err" : "vr-file"}>
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        required={required}
        className="vr-file__input"
        onChange={onFileChange}
      />
      <div className="vr-file__box">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="vr-file__thumb" />
        ) : (
          <span className="vr-file__placeholder">이미지 1장</span>
        )}
        <div className="vr-file__meta">
          <p className="vr-file__label">
            {label}
            {required ? <em> *</em> : null}
          </p>
          {fileName ? <p className="vr-file__name">{fileName}</p> : null}
          {hint ? <p className="vr-form-note">{hint}</p> : null}
          <div className="vr-file__actions">
            <button type="button" className="btn btn--ghost vr-file__btn" onClick={pick}>
              {preview ? "다시 선택" : "파일 선택"}
            </button>
            {preview ? (
              <button type="button" className="btn btn--ghost vr-file__btn" onClick={clear}>
                삭제
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {error ? (
        <p className="form-row__hint is-err" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
