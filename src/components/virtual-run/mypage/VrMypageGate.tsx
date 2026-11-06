"use client";

import type { ReactNode } from "react";
import { VrLink } from "../layout/VrLink";
import { useVirtualRunParticipant } from "../participant/VirtualRunParticipantProvider";

export function VrMypageGate({ children }: { children: ReactNode }) {
  const { ready, isLoggedIn } = useVirtualRunParticipant();

  if (isLoggedIn) return <>{children}</>;
  if (!ready) return null;

  return (
    <section className="block wait">
      <span className="kicker">LOGIN</span>
      <h2>로그인이 필요합니다</h2>
      <p className="sec__body">신청한 이름·생년월일·전화번호·비밀번호로 로그인한 뒤 이용해 주세요.</p>
      <div className="flow__nav">
        <VrLink href="/tickets" className="btn btn--ghost">
          티켓 구매
        </VrLink>
        <VrLink href="/login" className="btn btn--red">
          로그인
        </VrLink>
      </div>
    </section>
  );
}
