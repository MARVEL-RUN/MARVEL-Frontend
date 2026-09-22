"use client";

import { adminToast } from "@/components/admin/Toast";
import { saveAdminFile } from "@/lib/admin/download";
import {
  fetchRegistrationsExcel,
  fetchSelectedRegistrationsExcel,
  type RegistrationExcelParams,
} from "@/services/admin/applications";
import { useState } from "react";

type Props = {
  eventId: string;
  selectedIds: string[];
  filters?: Omit<RegistrationExcelParams, "eventId">;
  disabled?: boolean;
};

export function ExcelDownloadActions({
  eventId,
  selectedIds,
  filters,
  disabled,
}: Props) {
  const [busy, setBusy] = useState<"all" | "selected" | null>(null);

  const run = async (mode: "all" | "selected") => {
    if (!eventId || busy) return;
    setBusy(mode);
    try {
      const file =
        mode === "selected"
          ? await fetchSelectedRegistrationsExcel(eventId, selectedIds)
          : await fetchRegistrationsExcel({ eventId, ...filters });
      saveAdminFile(file.blob, file.filename || "신청자목록.xlsx");
      adminToast.success("엑셀 파일을 내려받았습니다.");
    } catch (err) {
      adminToast.error(
        err instanceof Error ? err.message : "엑셀 다운로드에 실패했습니다.",
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <button
        type="button"
        className="admin-btn admin-btn--ghost"
        disabled={disabled || !eventId || Boolean(busy)}
        onClick={() => void run("all")}
      >
        {busy === "all" ? "내려받는 중…" : "엑셀 다운로드"}
      </button>
      <button
        type="button"
        className="admin-btn admin-btn--ghost"
        disabled={disabled || selectedIds.length === 0 || Boolean(busy)}
        onClick={() => void run("selected")}
      >
        {busy === "selected" ? "내려받는 중…" : "선택 다운로드"}
      </button>
    </>
  );
}
