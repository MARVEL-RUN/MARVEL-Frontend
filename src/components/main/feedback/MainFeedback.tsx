"use client";

import { X } from "lucide-react";
import { create } from "zustand";
import { useEffect, useId, useState } from "react";

type ToastItem = {
  id: string;
  message: string;
};

type ToastState = {
  items: ToastItem[];
  push: (message: string) => void;
  dismiss: (id: string) => void;
};

const DURATION_MS = 2000;

const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({ items: [...state.items, { id, message }] }));
  },
  dismiss: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}));

export const mainToast = {
  success: (message: string) => useToastStore.getState().push(message),
};

function ToastItemView({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(item.id), DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [dismiss, item.id]);

  return (
    <div className="main-toast" role="status" aria-live="polite">
      <p className="main-toast__message">{item.message}</p>
      <button
        type="button"
        className="main-toast__close"
        aria-label="닫기"
        onClick={() => dismiss(item.id)}
      >
        <X size={16} strokeWidth={2.25} />
      </button>
    </div>
  );
}

export function MainToastHost() {
  const items = useToastStore((s) => s.items);
  if (items.length === 0) return null;

  return (
    <div className="main-toast-host">
      {items.map((item) => (
        <ToastItemView key={item.id} item={item} />
      ))}
    </div>
  );
}

type AlertProps = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export function MainAlertModal({
  open,
  title = "확인",
  message,
  onClose,
}: AlertProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
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
    <div className="main-alert" role="presentation">
      <button
        type="button"
        className="main-alert__dim"
        onClick={onClose}
        aria-label="닫기"
      />
      <div
        className="main-alert__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="main-alert__head">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            className="main-alert__x"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={20} strokeWidth={2.25} />
          </button>
        </header>
        <p className="main-alert__message">{message}</p>
        <div className="main-alert__actions">
          <button type="button" className="btn btn--red" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export function useMainAlert() {
  const [state, setState] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: "확인",
    message: "",
  });

  return {
    alert: (message: string, title = "확인") =>
      setState({ open: true, title, message }),
    modal: (
      <MainAlertModal
        open={state.open}
        title={state.title}
        message={state.message}
        onClose={() => setState((prev) => ({ ...prev, open: false }))}
      />
    ),
  };
}
