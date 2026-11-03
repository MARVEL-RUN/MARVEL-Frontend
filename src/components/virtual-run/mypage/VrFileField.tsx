"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

const MAX_BYTES = 10 * 1024 * 1024;

type Props = {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
};

export function VrFileField({ name, label, required, hint, error }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sizeErr, setSizeErr] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_BYTES) {
      e.target.value = "";
      setSizeErr(true);
      setPreview(null);
      setFileName(null);
      return;
    }
    setSizeErr(false);
    setPreview(file ? URL.createObjectURL(file) : null);
    setFileName(file?.name ?? null);
  }

  function clear() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(null);
    setFileName(null);
    setSizeErr(false);
  }

  const err = sizeErr ? "10MB 이하 이미지만 올릴 수 있습니다." : error;

  return (
    <div className="form-row vr-file-row">
      <label className="form-row__label" htmlFor={inputId}>
        {label}
        {required ? <em> *</em> : null}
      </label>
      <div className="form-row__ctrl">
        <div className={err ? "vr-file is-err" : preview ? "vr-file is-set" : "vr-file"}>
          <input
            ref={inputRef}
            id={inputId}
            name={name}
            type="file"
            accept="image/jpeg,image/png,image/heic,image/heif"
            className="vr-file__input"
            onChange={onFileChange}
            aria-invalid={Boolean(err)}
          />
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className="vr-file__thumb" />
              <span className="vr-file__name">{fileName}</span>
              <button type="button" className="vr-file__clear" onClick={clear} aria-label={`${label} 삭제`}>
                <X size={16} aria-hidden />
              </button>
            </>
          ) : (
            <label htmlFor={inputId} className="vr-file__pick">
              <ImagePlus size={20} aria-hidden />
              <span>이미지 선택</span>
              <small>JPG·PNG·HEIC · 10MB 이하</small>
            </label>
          )}
        </div>
        {err ? (
          <p className="form-row__hint is-err" role="alert">
            {err}
          </p>
        ) : hint ? (
          <p className="form-row__hint">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
