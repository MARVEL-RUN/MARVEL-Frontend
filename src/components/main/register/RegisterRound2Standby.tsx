"use client";

import Link from "next/link";
import { useAppHref } from "@/lib/main/useAppBasePath";
import { RegisterRound2HintContent } from "./RegisterRound2HintContent";

export function RegisterRound2Standby() {
  const lookupHref = useAppHref("/lookup");

  return (
    <section className="block wait register-round2-page">
      <p className="kicker">STANDBY</p>
      <h2>1차 신청이 마감되었습니다</h2>
      <div className="register-round2-page__body round2-tip-body">
        <RegisterRound2HintContent live={true} />
      </div>
      <p className="form__note">
        2차 신청 시작 전까지는 새로 신청할 수 없습니다. 17시 이후에는 신청 정보 수정 및
        환불이 제한될 수 있습니다.
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
