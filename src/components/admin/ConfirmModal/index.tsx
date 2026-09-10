"use client";

import { useCallback, useEffect, useId, useState } from "react";

type Props = {
  open: boolean;
  title?: string;
  message: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AdminConfirmModal({
  open,
  title,
  message,
  cancelLabel = "취소",
  confirmLabel = "확인",
  onCancel,
  onConfirm,
}: Props) {
  const labelId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="admin-overlay" onClick={onCancel}>
      <div
        className="admin-overlay__box admin-confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={labelId}
        onClick={(event) => event.stopPropagation()}
      >
        {title ? <h2 className="admin-confirm__title">{title}</h2> : null}
        <p id={labelId} className="admin-confirm__message">
          {message}
        </p>
        <div className="admin-confirm__actions">
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

type ConfirmArg =
  | string
  | { title?: string; message: string; cancelLabel?: string; confirmLabel?: string };

export function useAdminConfirm() {
  const [state, setState] = useState<{
    title?: string;
    message: string;
    cancelLabel?: string;
    confirmLabel?: string;
    resolve: (ok: boolean) => void;
  } | null>(null);

  const confirm = useCallback((arg: ConfirmArg) => {
    const opts = typeof arg === "string" ? { message: arg } : arg;
    return new Promise<boolean>((resolve) => {
      setState({ ...opts, resolve });
    });
  }, []);

  const close = (ok: boolean) => {
    state?.resolve(ok);
    setState(null);
  };

  return {
    confirm,
    modal: (
      <AdminConfirmModal
        open={Boolean(state)}
        title={state?.title}
        message={state?.message ?? ""}
        cancelLabel={state?.cancelLabel}
        confirmLabel={state?.confirmLabel}
        onCancel={() => close(false)}
        onConfirm={() => close(true)}
      />
    ),
  };
}
