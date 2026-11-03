"use client";

import { mainToast } from "@/components/main/feedback/MainFeedback";
import type { VirtualRunRewardRow } from "@/lib/virtual-run/participant";
import {
  REWARD_KIND_CODE,
  REWARD_STATUS_LABEL,
  REWARD_STATUS_TONE,
  maskPhone,
} from "@/lib/virtual-run/status";
import { useVirtualRunParticipantOrDemo } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";
import { VrMypageGate } from "./VrMypageGate";
import { VrStatus } from "./VrStatus";

export function VirtualRunRewardsPage() {
  const { participant, update } = useVirtualRunParticipantOrDemo();

  function resend(row: VirtualRunRewardRow) {
    update({
      ...participant,
      rewards: participant.rewards.map((r) => (r.id === row.id ? { ...r, status: "sent" as const } : r)),
    });
    mainToast.success("다시 보냈습니다.");
  }

  return (
    <VirtualRunSubPage kicker="MY PAGE" title="리워드 내역" en="REWARD">
      <div className="page__body wrap">
        <VrMypageGate>
          {participant.rewards.length === 0 ? (
            <section className="block wait">
              <span className="kicker">REWARD</span>
              <h2>아직 받은 리워드가 없습니다</h2>
              <p className="sec__body">러닝·키트 인증이 승인되면 이곳에 발송 내역이 쌓입니다.</p>
              <div className="flow__nav">
                <VrLink href="/mypage/sessions" className="btn btn--red">
                  러닝 인증하기
                </VrLink>
              </div>
            </section>
          ) : (
            <section className="block">
              <header className="form__head">
                <h2>발송 내역</h2>
                <p className="form__note">
                  {maskPhone(participant.phone)} 번호로 보냅니다. 받지 못했다면 재발송을 눌러 주세요.
                </p>
              </header>
              <ul className="vr-list">
                {participant.rewards.map((row) => (
                  <li key={row.id} className="vr-list__item">
                    <span className="vr-list__code">{REWARD_KIND_CODE[row.kind]}</span>
                    <div className="vr-list__body">
                      <strong>{row.label}</strong>
                      {row.detail ? <span>{row.detail}</span> : null}
                    </div>
                    <div className="vr-list__side">
                      <VrStatus tone={REWARD_STATUS_TONE[row.status]}>{REWARD_STATUS_LABEL[row.status]}</VrStatus>
                      {row.status === "failed" ? (
                        <button type="button" className="vr-list__act" onClick={() => resend(row)}>
                          재발송
                        </button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="ticket-notice">
            <p className="ticket-notice__title">리워드 안내</p>
            <ul className="ticket-notice__list">
              <li>· 메달과 키트는 구매자 전원에게 배송됩니다.</li>
              <li>· 기프티콘은 러닝 인증 승인 즉시 문자로 발송됩니다.</li>
              <li>· 협업 경품은 협업사 확정 후 순차 발송되며, 준비 수량이 소진되면 조기 종료될 수 있습니다.</li>
            </ul>
          </div>
        </VrMypageGate>
      </div>
    </VirtualRunSubPage>
  );
}
