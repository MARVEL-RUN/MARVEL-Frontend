"use client";

import { applicationPasswordError, formatPhone } from "@/lib/register";
import { Eye, EyeOff, Lock, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type LookupPasswordIdentity =
  | { kind: "individual"; name: string; birth: string; phone: string }
  | { kind: "group"; account: string };

export type LookupPasswordSubmit =
  | {
      kind: "individual";
      name: string;
      birth: string;
      phone: string;
      currentPassword: string;
      newPassword: string;
    }
  | {
      kind: "group";
      account: string;
      currentPassword: string;
      newPassword: string;
    };

type Props = {
  open: boolean;
  busy: boolean;
  error: string;
  identity: LookupPasswordIdentity;
  onClose: () => void;
  onSubmit: (input: LookupPasswordSubmit) => void;
};

type Draft = {
  active: boolean;
  current: string;
  next: string;
  confirm: string;
};

const blankDraft: Draft = {
  active: false,
  current: "",
  next: "",
  confirm: "",
};

function passwordChangeError(current: string, next: string, confirm: string) {
  const currentErr = applicationPasswordError(current);
  if (currentErr) return currentErr;
  const nextErr = applicationPasswordError(next);
  if (nextErr) return "새 비밀번호는 6자 이상 입력하세요.";
  if (next.trim() !== confirm.trim()) return "새 비밀번호가 일치하지 않습니다.";
  if (current.trim() === next.trim()) return "새 비밀번호가 현재 비밀번호와 같습니다.";
  return "";
}

export function LookupPasswordModal({ open, busy, error, identity, onClose, onSubmit }: Props) {
  const titleId = useId();
  const errorId = useId();
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [localError, setLocalError] = useState("");
  const [hideParentError, setHideParentError] = useState(false);

  if (open !== draft.active) {
    setDraft(open ? { ...blankDraft, active: true } : blankDraft);
    setLocalError("");
    setHideParentError(false);
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setHideParentError(false);
  }, [error]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, busy, onClose]);

  if (!open || !mounted) return null;

  const shown = localError || (hideParentError ? "" : error);
  const clearError = () => {
    setLocalError("");
    setHideParentError(true);
  };

  return createPortal(
    <div className="inquiry-secret" role="presentation">
      <button
        type="button"
        className="inquiry-secret__dim"
        aria-label="닫기"
        onClick={() => {
          if (!busy) onClose();
        }}
      />
      <div
        className="inquiry-secret__panel inquiry-secret__panel--password"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={shown ? errorId : undefined}
      >
        <header className="inquiry-secret__head">
          <span className="inquiry-secret__icon" aria-hidden>
            <Lock size={20} strokeWidth={2.25} />
          </span>
          <h2 id={titleId}>비밀번호 변경</h2>
          <button
            type="button"
            className="inquiry-secret__x"
            onClick={onClose}
            disabled={busy}
            aria-label="닫기"
          >
            <X size={20} strokeWidth={2.25} />
          </button>
        </header>
        <form
          className="inquiry-secret__form inquiry-secret__form--stack"
          autoComplete="off"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const invalid = passwordChangeError(draft.current, draft.next, draft.confirm);
            if (invalid) {
              setLocalError(invalid);
              return;
            }
            setLocalError("");
            const currentPassword = draft.current.trim();
            const newPassword = draft.next.trim();
            if (identity.kind === "group") {
              onSubmit({
                kind: "group",
                account: identity.account.trim(),
                currentPassword,
                newPassword,
              });
              return;
            }
            onSubmit({
              kind: "individual",
              name: identity.name.trim(),
              birth: identity.birth.replace(/\D/g, "").slice(0, 8),
              phone: formatPhone(identity.phone),
              currentPassword,
              newPassword,
            });
          }}
        >
          <PasswordRow
            label="현재 비밀번호"
            value={draft.current}
            placeholder="현재 비밀번호"
            hangul
            autoFocus
            disabled={busy}
            onChange={(value) => {
              setDraft((prev) => ({ ...prev, current: value }));
              clearError();
            }}
          />
          <PasswordRow
            label="새 비밀번호"
            value={draft.next}
            placeholder="6자 이상"
            disabled={busy}
            onChange={(value) => {
              setDraft((prev) => ({ ...prev, next: value }));
              clearError();
            }}
          />
          <PasswordRow
            label="새 비밀번호 확인"
            value={draft.confirm}
            placeholder="새 비밀번호를 다시 입력"
            disabled={busy}
            onChange={(value) => {
              setDraft((prev) => ({ ...prev, confirm: value }));
              clearError();
            }}
          />
          {shown ? (
            <p id={errorId} className="inquiry-secret__error" role="alert">
              {shown}
            </p>
          ) : null}
          <div className="inquiry-secret__actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
              취소
            </button>
            <button type="submit" className="btn btn--red" disabled={busy}>
              {busy ? "변경 중..." : "변경"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function setTextSecurity(input: HTMLInputElement, masked: boolean) {
  if (masked) input.style.setProperty("-webkit-text-security", "disc");
  else input.style.setProperty("-webkit-text-security", "none");
}

function PasswordRow({
  label,
  value,
  placeholder,
  disabled,
  autoFocus,
  hangul = false,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  autoFocus?: boolean;
  hangul?: boolean;
  onChange: (value: string) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || !hangul) return;
    if (show) {
      input.style.removeProperty("-webkit-text-security");
      return;
    }
    setTextSecurity(input, document.activeElement !== input);
  }, [hangul, show]);

  return (
    <label className="inquiry-secret__field" htmlFor={inputId}>
      <span>{label}</span>
      <span className="inquiry-secret__control">
        <input
          ref={inputRef}
          id={inputId}
          // 현재 비밀번호는 한글로 된 경우가 있어 비밀번호 칸으로 두지 않는다
          type={hangul || show ? "text" : "password"}
          lang={hangul ? undefined : "en"}
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={hangul && !show ? "is-mask" : undefined}
          onFocus={(event) => {
            if (hangul && !show) setTextSecurity(event.currentTarget, false);
          }}
          onBlur={(event) => {
            if (hangul && !show) setTextSecurity(event.currentTarget, true);
          }}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="inquiry-secret__eye"
          aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
          onClick={() => setShow((prev) => !prev)}
          disabled={disabled}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  );
}
