"use client";

import { Eye, EyeOff, Lock, X } from "lucide-react";
import { useEffect, useId, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
};

export function InquirySecretModal({ open, onClose, onConfirm }: Props) {
  const titleId = useId();
  const inputId = useId();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setShow(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="inquiry-secret" role="presentation">
      <button
        type="button"
        className="inquiry-secret__dim"
        onClick={onClose}
        aria-label="닫기"
      />
      <div
        className="inquiry-secret__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="inquiry-secret__head">
          <span className="inquiry-secret__icon" aria-hidden>
            <Lock size={20} strokeWidth={2.25} />
          </span>
          <h2 id={titleId}>비밀글입니다!</h2>
          <button
            type="button"
            className="inquiry-secret__x"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={20} strokeWidth={2.25} />
          </button>
        </header>
        <p className="inquiry-secret__desc">
          이 글은 비밀글로 설정되어 있어 작성자만 볼 수 있습니다.
        </p>
        <label className="inquiry-secret__field" htmlFor={inputId}>
          <span>비밀번호</span>
          <span className="inquiry-secret__control">
            <input
              id={inputId}
              type={show ? "text" : "password"}
              value={password}
              placeholder="비밀번호를 입력해주세요"
              autoFocus
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onConfirm(password);
                }
              }}
            />
            <button
              type="button"
              className="inquiry-secret__eye"
              aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
              onClick={() => setShow((v) => !v)}
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </span>
        </label>
        <div className="inquiry-secret__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            취소
          </button>
          <button
            type="button"
            className="btn btn--red"
            onClick={() => onConfirm(password)}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
