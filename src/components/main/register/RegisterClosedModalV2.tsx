import { useId } from "react";
import { X } from "lucide-react";
import { EVENT } from "@/lib/event";
import { RegisterStandbyCount } from "./RegisterStandbyCount";
import type { StandbyPanelProps } from "./standby";

export function RegisterClosedModalV2({ dday, slots, onClose }: StandbyPanelProps) {
  const titleId = useId();

  return (
    <div
      className="standby-v2"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <p className="standby-v2__ghost" aria-hidden>
        STANDBY
      </p>
      <header className="standby-v2__head">
        <p className="kicker kicker--on-red">OPEN</p>
        <span className="standby-v2__dday">{dday}</span>
        <button
          type="button"
          className="standby-v2__x"
          onClick={onClose}
          aria-label="닫기"
        >
          <X size={20} strokeWidth={2.25} />
        </button>
      </header>
      <h2 id={titleId}>아직 접수 기간이 아닙니다</h2>
      <RegisterStandbyCount slots={slots} />
      <p className="standby-v2__when">
        {EVENT.openNoticeDate}
        <br />
        {EVENT.openNoticeTime} {EVENT.openNoticeAction}
      </p>
      <p className="standby-v2__desc">
        오픈 시각에 개인 또는 단체 신청을 할 수 있습니다.
      </p>
      <div className="standby-v2__actions">
        <button type="button" className="btn btn--on-red" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
}
