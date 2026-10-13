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

type Clock = {
  date: string;
  hour: string;
  minute: string;
  second: string;
};

const EMPTY_CLOCK: Clock = { date: "", hour: "00", minute: "00", second: "00" };

function padUnit(value: number) {
  return String(value).padStart(2, "0");
}

const HOURS = Array.from({ length: 24 }, (_, index) => padUnit(index));
const MINUTE_SECONDS = Array.from({ length: 60 }, (_, index) => padUnit(index));

function clockValue(clock: Clock) {
  if (!clock.date) return "";
  return `${clock.date}T${clock.hour}:${clock.minute}:${clock.second}`;
}

/* 크롬 한국어 선택창은 0시를 오전 12시로만 보여 시를 00–23으로 둔다 */
function ClockField({
  label,
  clock,
  disabled,
  min,
  max,
  onChange,
}: {
  label: string;
  clock: Clock;
  disabled?: boolean;
  min?: string;
  max?: string;
  onChange: (clock: Clock) => void;
}) {
  const timeDisabled = disabled || !clock.date;

  return (
    <div className="admin-daily-report__field">
      <span>{label}</span>
      <span className="admin-daily-report__clock">
        <input
          type="date"
          className="admin-daily-report__input"
          aria-label={`${label} 날짜`}
          value={clock.date}
          min={min || undefined}
          max={max || undefined}
          disabled={disabled}
          onChange={(event) => onChange({ ...clock, date: event.target.value })}
        />
        <select
          className="admin-daily-report__select admin-daily-report__select--unit"
          aria-label={`${label} 시`}
          value={clock.hour}
          disabled={timeDisabled}
          onChange={(event) => onChange({ ...clock, hour: event.target.value })}
        >
          {HOURS.map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
        <select
          className="admin-daily-report__select admin-daily-report__select--unit"
          aria-label={`${label} 분`}
          value={clock.minute}
          disabled={timeDisabled}
          onChange={(event) => onChange({ ...clock, minute: event.target.value })}
        >
          {MINUTE_SECONDS.map((minute) => (
            <option key={minute} value={minute}>
              {minute}
            </option>
          ))}
        </select>
        <select
          className="admin-daily-report__select admin-daily-report__select--unit"
          aria-label={`${label} 초`}
          value={clock.second}
          disabled={timeDisabled}
          onChange={(event) => onChange({ ...clock, second: event.target.value })}
        >
          {MINUTE_SECONDS.map((second) => (
            <option key={second} value={second}>
              {second}
            </option>
          ))}
        </select>
      </span>
    </div>
  );
}

export function DeliveryListDownload({ eventId, disabled }: Props) {
  const [startClock, setStartClock] = useState<Clock>(EMPTY_CLOCK);
  const [endClock, setEndClock] = useState<Clock>(EMPTY_CLOCK);
  const [busy, setBusy] = useState(false);
  const startAt = clockValue(startClock);
  const endAt = clockValue(endClock);

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
          최초 참가비 승인 시각 기준입니다. 종료 시각은 포함하지 않아, 예를 들어 10/7
          00:00:00이면 10/6 23:59:59까지입니다.
          <br />
          10/7 당일까지 넣으려면 종료를 10/8 00:00:00으로 두세요.
        </p>
      </div>
      <div className="admin-daily-report__controls">
        <ClockField
          label="시작"
          clock={startClock}
          disabled={disabled || busy}
          max={endClock.date}
          onChange={setStartClock}
        />
        <ClockField
          label="종료"
          clock={endClock}
          disabled={disabled || busy}
          min={startClock.date}
          onChange={setEndClock}
        />
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
