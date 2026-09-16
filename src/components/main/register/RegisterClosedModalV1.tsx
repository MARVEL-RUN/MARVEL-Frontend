import { useId } from "react";
import { X } from "lucide-react";
import { EVENT } from "@/lib/event";
import { RegisterStandbyCount } from "./RegisterStandbyCount";
import type { StandbyPanelProps } from "./standby";

export function RegisterClosedModalV1({ dday, slots, onClose }: StandbyPanelProps) {
  const titleId = useId();

  return (
    <div
      className="standby-v1"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <header className="standby-v1__head">
        <p className="kicker">STANDBY</p>
        <button
          type="button"
          className="standby-v1__x"
          onClick={onClose}
          aria-label="닫기"
        >
          <X size={20} strokeWidth={2.25} />
        </button>
      </header>
      <h2 id={titleId}>아직 접수 기간이 아닙니다</h2>
      <p className="standby-v1__chip">
        <span>접수 OPEN</span>
        <i aria-hidden />
        <span>{dday}</span>
      </p>
      <RegisterStandbyCount slots={slots} />
      <p className="standby-v1__when">
        {EVENT.openNoticeDate} · {EVENT.openNoticeTime}
      </p>
      <p className="standby-v1__desc">
        오픈 시각에 개인 또는 단체 신청을 할 수 있습니다.
      </p>
      <div className="standby-v1__actions">
        <button type="button" className="btn btn--red" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}
