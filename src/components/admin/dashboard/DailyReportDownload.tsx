"use client";

import { adminToast } from "@/components/admin/Toast";
import { saveAdminFile } from "@/lib/admin/download";
import {
  fetchDailyReportExcel,
  type DailyReportMode,
} from "@/services/admin/stats";
import { Download } from "lucide-react";
import { useState } from "react";

const MODES: { value: DailyReportMode; label: string }[] = [
  { value: "BOTH", label: "일별+누적" },
  { value: "DAILY", label: "일별" },
  { value: "CUMULATIVE", label: "누적" },
];

type Props = {
  eventId: string;
  disabled?: boolean;
};

export function DailyReportDownload({ eventId, disabled }: Props) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [mode, setMode] = useState<DailyReportMode>("BOTH");
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (!eventId || busy || disabled) return;
    setBusy(true);
    try {
      const file = await fetchDailyReportExcel({
        eventId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        mode,
      });
      saveAdminFile(file.blob, file.filename || "일별접수집계.xlsx");
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
        <strong>일별 신청·결제 집계</strong>
        <p>날짜를 비우면 접수 시작일부터 어제까지 내려받습니다.</p>
      </div>
      <div className="admin-daily-report__controls">
        <label>
          시작일
          <input
            type="date"
            className="admin-daily-report__input"
            value={startDate}
            max={endDate || undefined}
            disabled={disabled || busy}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </label>
        <label>
          종료일
          <input
            type="date"
            className="admin-daily-report__input"
            value={endDate}
            min={startDate || undefined}
            disabled={disabled || busy}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </label>
        <label>
          집계
          <select
            className="admin-daily-report__select"
            value={mode}
            disabled={disabled || busy}
            onChange={(event) => setMode(event.target.value as DailyReportMode)}
          >
            {MODES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
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
