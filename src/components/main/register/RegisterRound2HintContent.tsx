"use client";

import { EVENT } from "@/lib/event";
import { useRound2OpenCountdown } from "./useRegistrationRound2Pause";

export function RegisterRound2HintContent({ live }: { live: boolean }) {
  const slots = useRound2OpenCountdown(live);
  const display = slots ?? { d: "00", h: "00", m: "00", s: "00" };

  return (
    <div className="round2-tip-body">
      <p className="round2-tip-body__lead">2차 신청 시작까지</p>
      <p className="round2-tip-body__time" aria-live="polite">
        {display.d !== "00" ? `${Number(display.d)}일 ` : null}
        {Number(display.h)}시 {display.m}분 {display.s}초
      </p>
      <p className="round2-tip-body__when">
        {EVENT.round2OpenNoticeDate} · {EVENT.round2OpenNoticeTime}{" "}
        {EVENT.round2OpenNoticeAction}
      </p>
      <p className="round2-tip-body__note">
        미결제 건은 신청조회에서 결제·확인할 수 있습니다.
      </p>
    </div>
  );
}
