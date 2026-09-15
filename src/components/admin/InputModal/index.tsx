"use client";

import { Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "text" | "password";
  minLength?: number;
  onCancel: () => void;
  onConfirm: (value: string) => void;
};

export function AdminInputModal({
  open,
  title,
  description,
  label = "입력",
  placeholder = "입력해 주세요",
  confirmLabel = "확인",
  cancelLabel = "취소",
  type = "text",
  minLength = 1,
  onCancel,
  onConfirm,
}: Props) {
  const titleId = useId();
  const inputId = useId();
  const [value, setValue] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const valid = value.trim().length >= minLength;

  useEffect(() => {
    if (!open) return;
    setValue("");
    setShowPassword(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const submit = () => {
    if (!valid) return;
    onConfirm(value.trim());
  };

  return (
    <div className="admin-overlay" onClick={onCancel}>
      <div
        className="admin-overlay__box admin-input-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-input-modal__head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="admin-input-modal__close" aria-label="닫기" onClick={onCancel}>
            ×
          </button>
        </div>
        {description ? <p className="admin-input-modal__desc">{description}</p> : null}
        <label className="admin-input-modal__field" htmlFor={inputId}>
          {label}
          <span className="admin-input-modal__control">
            <input
              id={inputId}
              type={type === "password" && !showPassword ? "password" : "text"}
              value={value}
              placeholder={placeholder}
              autoFocus
              autoComplete="new-password"
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
            />
            {type === "password" ? (
              <button
                type="button"
                className="admin-input-modal__eye"
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            ) : null}
          </span>
        </label>
        {minLength > 1 ? (
          <p className="admin-input-modal__hint">*{minLength}자리 이상으로 입력해주세요</p>
        ) : null}
        <div className="admin-confirm__actions">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={submit}
            disabled={!valid}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

type PromptArg = {
  title: string;
  description?: string;
  label?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "text" | "password";
  minLength?: number;
};

export function useAdminPrompt() {
  const [state, setState] = useState<(PromptArg & { resolve: (value: string | null) => void }) | null>(
    null,
  );

  const prompt = useCallback((arg: PromptArg) => {
    return new Promise<string | null>((resolve) => {
      setState({ ...arg, resolve });
    });
  }, []);

  const close = (value: string | null) => {
    state?.resolve(value);
    setState(null);
  };

  return {
    prompt,
    modal: (
      <AdminInputModal
        open={Boolean(state)}
        title={state?.title ?? ""}
        description={state?.description}
        label={state?.label}
        placeholder={state?.placeholder}
        confirmLabel={state?.confirmLabel}
        cancelLabel={state?.cancelLabel}
        type={state?.type}
        minLength={state?.minLength}
        onCancel={() => close(null)}
        onConfirm={(value) => close(value)}
      />
    ),
  };
}
