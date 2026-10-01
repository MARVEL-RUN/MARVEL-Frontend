"use client";

import { applicationPasswordError, formatPhone, orgAccountError } from "@/lib/register";
import { Eye, EyeOff, Lock, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
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
  name: string;
  birth: string;
  phone: string;
  account: string;
  current: string;
  next: string;
  confirm: string;
};

const blankDraft: Draft = {
  active: false,
  name: "",
  birth: "",
  phone: "",
  account: "",
  current: "",
  next: "",
  confirm: "",
};

function seedDraft(identity: LookupPasswordIdentity): Draft {
  if (identity.kind === "group") {
    return { ...blankDraft, active: true, account: identity.account };
  }
  return {
    ...blankDraft,
    active: true,
    name: identity.name,
    birth: identity.birth,
    phone: identity.phone,
  };
}

function birthShown(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 6) return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  if (digits.length > 4) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return digits;
}

function identityError(identity: LookupPasswordIdentity, draft: Draft) {
  if (identity.kind === "group") {
    if (!draft.account.trim()) return "단체 조회용 ID를 입력하세요.";
    return orgAccountError(draft.account);
  }
  if (!draft.name.trim()) return "이름을 입력하세요.";
  if (draft.birth.replace(/\D/g, "").length !== 8) return "생년월일을 입력하세요.";
  if (draft.phone.replace(/\D/g, "").length < 10) return "전화번호를 입력하세요.";
  return "";
}

function passwordChangeError(current: string, next: string, confirm: string) {
  const currentErr = applicationPasswordError(current);
  if (currentErr) return currentErr;
  const nextErr = applicationPasswordError(next);
  if (nextErr) return "새 비밀번호는 6자 이상 입력하세요.";
  if (next.trim() !== confirm.trim()) return "새 비밀번호가 일치하지 않습니다.";
  if (current.trim() === next.trim()) return "새 비밀번호가 현재 비밀번호와 같습니다.";
  return "";
}

function focusKey(identity: LookupPasswordIdentity, draft: Draft, step: 1 | 2) {
  if (step === 2) {
    if (!draft.current) return "current";
    if (!draft.next) return "next";
    return "confirm";
  }
  if (identity.kind === "group") return "account";
  if (!draft.name.trim()) return "name";
  if (draft.birth.replace(/\D/g, "").length !== 8) return "birth";
  if (draft.phone.replace(/\D/g, "").length < 10) return "phone";
  return "name";
}

export function LookupPasswordModal({ open, busy, error, identity, onClose, onSubmit }: Props) {
  const titleId = useId();
  const errorId = useId();
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<Draft>(blankDraft);
  const [step, setStep] = useState<1 | 2>(1);
  const [localError, setLocalError] = useState("");
  const [hideParentError, setHideParentError] = useState(false);

  if (open !== draft.active) {
    setDraft(open ? seedDraft(identity) : blankDraft);
    setStep(1);
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

  const shown = step === 1 ? localError : localError || (hideParentError ? "" : error);
  const focus = focusKey(identity, draft, step);
  const clearError = () => {
    setLocalError("");
    setHideParentError(true);
  };

  function goToStep(next: 1 | 2) {
    if (busy || next === step) return;
    if (next === 2) {
      const invalid = identityError(identity, draft);
      if (invalid) {
        setLocalError(invalid);
        return;
      }
    }
    setLocalError("");
    setHideParentError(true);
    setStep(next);
  }

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
            if (step === 1) {
              const invalid = identityError(identity, draft);
              if (invalid) {
                setLocalError(invalid);
                return;
              }
              setLocalError("");
              setHideParentError(true);
              setStep(2);
              return;
            }
            const invalid = passwordChangeError(draft.current, draft.next, draft.confirm);
            if (invalid) {
              setLocalError(invalid);
              return;
            }
            setLocalError("");
            if (identity.kind === "group") {
              onSubmit({
                kind: "group",
                account: draft.account.trim(),
                currentPassword: draft.current.trim(),
                newPassword: draft.next.trim(),
              });
              return;
            }
            onSubmit({
              kind: "individual",
              name: draft.name.trim(),
              birth: draft.birth.replace(/\D/g, "").slice(0, 8),
              phone: formatPhone(draft.phone),
              currentPassword: draft.current.trim(),
              newPassword: draft.next.trim(),
            });
          }}
        >
          <div className="inquiry-secret__steps" role="tablist" aria-label="비밀번호 변경 단계">
            <button
              type="button"
              role="tab"
              aria-selected={step === 1}
              className={step === 1 ? "is-on" : undefined}
              disabled={busy}
              onClick={() => goToStep(1)}
            >
              신청 정보
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={step === 2}
              className={step === 2 ? "is-on" : undefined}
              disabled={busy}
              onClick={() => goToStep(2)}
            >
              새 비밀번호
            </button>
          </div>
          {step === 1 ? (
            identity.kind === "individual" ? (
              <>
                <TextRow
                  label="이름"
                  value={draft.name}
                  placeholder="이름"
                  autoComplete="name"
                  autoFocus={focus === "name"}
                  disabled={busy}
                  onChange={(value) => {
                    setDraft((prev) => ({ ...prev, name: value }));
                    clearError();
                  }}
                />
                <TextRow
                  label="생년월일"
                  value={birthShown(draft.birth)}
                  placeholder="YYYY-MM-DD"
                  inputMode="numeric"
                  autoComplete="bday"
                  autoFocus={focus === "birth"}
                  disabled={busy}
                  onChange={(value) => {
                    setDraft((prev) => ({
                      ...prev,
                      birth: value.replace(/\D/g, "").slice(0, 8),
                    }));
                    clearError();
                  }}
                />
                <TextRow
                  label="전화번호"
                  value={formatPhone(draft.phone)}
                  placeholder="휴대폰번호"
                  inputMode="tel"
                  autoComplete="tel"
                  autoFocus={focus === "phone"}
                  disabled={busy}
                  onChange={(value) => {
                    setDraft((prev) => ({ ...prev, phone: formatPhone(value) }));
                    clearError();
                  }}
                />
              </>
            ) : (
              <TextRow
                label="단체 조회용 ID"
                value={draft.account}
                placeholder="5~20자, 영문·숫자·특수문자"
                autoComplete="username"
                autoFocus={focus === "account"}
                disabled={busy}
                onChange={(value) => {
                  setDraft((prev) => ({ ...prev, account: value }));
                  clearError();
                }}
              />
            )
          ) : (
            <>
              <PasswordRow
                label="현재 비밀번호"
                value={draft.current}
                placeholder="현재 비밀번호"
                autoFocus={focus === "current"}
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
                autoFocus={focus === "next"}
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
                autoFocus={focus === "confirm"}
                disabled={busy}
                onChange={(value) => {
                  setDraft((prev) => ({ ...prev, confirm: value }));
                  clearError();
                }}
              />
            </>
          )}
          {shown ? (
            <p id={errorId} className="inquiry-secret__error" role="alert">
              {shown}
            </p>
          ) : null}
          <div className="inquiry-secret__actions">
            {step === 1 ? (
              <button type="button" className="btn btn--ghost" onClick={onClose} disabled={busy}>
                취소
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => goToStep(1)}
                disabled={busy}
              >
                이전
              </button>
            )}
            <button type="submit" className="btn btn--red" disabled={busy}>
              {step === 1 ? "다음" : busy ? "변경 중..." : "변경"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function TextRow({
  label,
  value,
  placeholder,
  disabled,
  autoFocus,
  autoComplete,
  inputMode,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel";
  onChange: (value: string) => void;
}) {
  const inputId = useId();

  return (
    <label className="inquiry-secret__field" htmlFor={inputId}>
      <span>{label}</span>
      <span className="inquiry-secret__control inquiry-secret__control--text">
        <input
          id={inputId}
          type="text"
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          autoComplete={autoComplete}
          inputMode={inputMode}
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  );
}

function PasswordRow({
  label,
  value,
  placeholder,
  disabled,
  autoFocus,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  disabled: boolean;
  autoFocus?: boolean;
  onChange: (value: string) => void;
}) {
  const inputId = useId();
  const [show, setShow] = useState(false);

  return (
    <label className="inquiry-secret__field" htmlFor={inputId}>
      <span>{label}</span>
      <span className="inquiry-secret__control">
        <input
          id={inputId}
          type="text"
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={show ? undefined : "is-mask"}
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
