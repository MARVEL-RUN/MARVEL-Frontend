"use client";

import { X } from "lucide-react";
import { create } from "zustand";
import { useEffect } from "react";

export type AdminToastType = "success" | "error";

type ToastItem = {
  id: string;
  type: AdminToastType;
  message: string;
};

type ToastState = {
  items: ToastItem[];
  push: (type: AdminToastType, message: string) => void;
  dismiss: (id: string) => void;
};

const DURATION_MS = 2800;

const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({ items: [...state.items, { id, type, message }] }));
  },
  dismiss: (id) => set((state) => ({ items: state.items.filter((t) => t.id !== id) })),
}));

export const adminToast = {
  success: (message: string) => useToastStore.getState().push("success", message),
  error: (message: string) => useToastStore.getState().push("error", message),
};

function ToastItemView({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const timer = window.setTimeout(() => dismiss(item.id), DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [dismiss, item.id]);

  return (
    <div
      className={`admin-toast admin-toast--${item.type}`}
      role="status"
      aria-live="polite"
    >
      <div className="admin-toast__body">
        <span className="admin-toast__label">{item.type === "success" ? "성공" : "실패"}</span>
        <p className="admin-toast__message">{item.message}</p>
      </div>
      <button
        type="button"
        className="admin-toast__close"
        aria-label="닫기"
        onClick={() => dismiss(item.id)}
      >
        <X size={14} strokeWidth={2.25} />
      </button>
    </div>
  );
}

export function AdminToastHost() {
  const items = useToastStore((s) => s.items);
  if (items.length === 0) return null;

  return (
    <div className="admin-toast-host" aria-live="polite">
      {items.map((item) => (
        <ToastItemView key={item.id} item={item} />
      ))}
    </div>
  );
}
