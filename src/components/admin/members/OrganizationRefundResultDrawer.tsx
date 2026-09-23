"use client";

import { RefundResultPanel } from "@/components/admin/applications/RefundResultPanel";
import type { AdminRefundBatchResponse } from "@/services/admin/refunds";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  eventId: string;
  result: AdminRefundBatchResponse;
  onClose: () => void;
};

export function OrganizationRefundResultDrawer({ eventId, result, onClose }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="admin-drawer-stack">
      <div
        className="admin-drawer__dim"
        role="presentation"
        aria-hidden="true"
        onClick={onClose}
      />
      <aside
        className="admin-drawer admin-drawer--org-adjust"
        role="dialog"
        aria-modal="true"
        aria-label="환불 처리 결과"
      >
        <header className="admin-drawer__hero">
          <div className="admin-drawer__hero-bar">
            <span className="admin-drawer__hero-kind">단체</span>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
              닫기
            </button>
          </div>
          <h1 className="admin-drawer__hero-title">전액 환불</h1>
        </header>
        <div className="admin-org-adjust admin-org-adjust--result">
          <RefundResultPanel
            eventId={eventId}
            result={result}
            title="환불 처리 결과"
            onClose={onClose}
          />
        </div>
      </aside>
    </div>,
    document.body,
  );
}
