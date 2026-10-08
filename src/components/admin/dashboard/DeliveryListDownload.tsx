"use client";

import { adminToast } from "@/components/admin/Toast";
import { saveAdminFile } from "@/lib/admin/download";
import { fetchDeliveryListExcel } from "@/services/admin/stats";
import { Download } from "lucide-react";
import { useState } from "react";

type Props = {
  eventId: string;
  disabled?: boolean;
};

export function DeliveryListDownload({ eventId, disabled }: Props) {
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (!eventId || busy || disabled) return;
    setBusy(true);
    try {
      const file = await fetchDeliveryListExcel({ eventId, startAt, endAt });
      saveAdminFile(file.blob, file.filename || "배송명단.xlsx");
      adminToast.success("엑셀 파일을 내려받았습니다.");
    } catch (err) {
      adminToast.error(
        err instanceof Error ? err.message : "엑셀 다운로드에 실패했습니다.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-daily-report">
      <div className="admin-daily-report__head">
        <strong>배송명단</strong>
        <p>
          최초 참가비 승인 시각입니다. 종료 시각은 포함하지 않아, 10/7 00:00:00이면
          10/6 23:59:59까지입니다.
        </p>
      </div>
      <div className="admin-daily-report__controls">
        <label>
          시작
          <input
            type="datetime-local"
            className="admin-daily-report__input admin-daily-report__input--time"
            value={startAt}
            step={1}
            max={endAt || undefined}
            disabled={disabled || busy}
            onChange={(event) => setStartAt(event.target.value)}
          />
        </label>
        <label>
          종료
          <input
            type="datetime-local"
            className="admin-daily-report__input admin-daily-report__input--time"
            value={endAt}
            step={1}
            min={startAt || undefined}
            disabled={disabled || busy}
            onChange={(event) => setEndAt(event.target.value)}
          />
        </label>
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-daily-report__btn"
          disabled={disabled || !eventId || busy}
          onClick={() => void download()}
        >
          <Download size={16} strokeWidth={2} aria-hidden />
          {busy ? "내려받는 중…" : "엑셀 다운로드"}
        </button>
      </div>
    </div>
  );
}
