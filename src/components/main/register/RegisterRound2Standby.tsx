"use client";

import Link from "next/link";
import { EVENT } from "@/lib/event";
import { useAppHref } from "@/lib/main/useAppBasePath";
import { RegisterStandbyCount } from "./RegisterStandbyCount";
import { useRound2OpenCountdown } from "./useRegistrationRound2Pause";

export function RegisterRound2Standby() {
  const lookupHref = useAppHref("/lookup");
  const slots = useRound2OpenCountdown(true);
  const display = slots ?? { d: "00", h: "00", m: "00", s: "00" };

  return (
    <section className="block wait">
      <p className="kicker">STANDBY</p>
      <h2>1차 신청이 마감되었습니다</h2>
      <p className="sec__body">
        2차 신청 시작까지{" "}
        {display.d !== "00" ? `${Number(display.d)}일 ` : null}
        {Number(display.h)}시 {display.m}분 {display.s}초 · {EVENT.round2OpenNoticeDate}{" "}
        {EVENT.round2OpenNoticeTime} {EVENT.round2OpenNoticeAction}
      </p>
      <RegisterStandbyCount slots={display} />
      <p className="form__note">
        2차 신청 시작 전까지는 새로 신청할 수 없습니다. 미결제 참가비는 신청조회에서
        결제할 수 있습니다. 17시 이후에는 신청 정보 수정 및 환불이 제한될 수 있습니다.
      </p>
      <div className="flow__nav">
        <Link href={lookupHref} className="btn btn--ghost">
          신청조회
        </Link>
        <Link href="/notices" className="btn btn--red">
          공지사항
        </Link>
      </div>
    </section>
  );
}
