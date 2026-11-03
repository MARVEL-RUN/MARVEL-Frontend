"use client";

import { useState } from "react";
import { KIT_CERT_NOTICES } from "@/lib/virtual-run/kit-cert";
import type { KitShippingStatus } from "@/lib/virtual-run/participant";
import { VIRTUAL_RUN_ROUNDS } from "@/lib/virtual-run/rounds";
import {
  KIT_CERT_LABEL,
  KIT_CERT_TONE,
  KIT_SHIPPING_LABEL,
  KIT_SHIPPING_TONE,
} from "@/lib/virtual-run/status";
import { useVirtualRunParticipantOrDemo } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";
import { CertSubmitResult } from "./CertSubmitResult";
import { KitCertForm } from "./KitCertForm";
import { VrMypageGate } from "./VrMypageGate";
import { VrStatus } from "./VrStatus";

const SHIPPING_STEPS: KitShippingStatus[] = ["preparing", "shipping", "delivered"];

export function VirtualRunKitMypage() {
  const { participant } = useVirtualRunParticipantOrDemo();
  const [result, setResult] = useState<"approved" | "pending" | null>(null);
  const shipIdx = SHIPPING_STEPS.indexOf(participant.kitShipping);
  const kits = VIRTUAL_RUN_ROUNDS.filter((r) => participant.ownedRoundIds.includes(r.id));

  if (result) {
    return (
      <VirtualRunSubPage kicker="MY PAGE" title="키트 카드" en="KIT · VERIFY">
        <div className="page__body wrap wrap--narrow">
          <CertSubmitResult
            mode={result}
            subject="키트 인증"
            rows={[{ label: "배번호", value: participant.bib }]}
            approvedNote="키트 인증 경품은 협업사 확정 후 순차 발송합니다."
          />
        </div>
      </VirtualRunSubPage>
    );
  }

  return (
    <VirtualRunSubPage kicker="MY PAGE" title="키트 카드" en="KIT · VERIFY">
      <div className="page__body wrap wrap--narrow">
        <VrMypageGate>
          <div className="vr-stack">
            <section className="block">
              <header className="vr-block-head">
                <h2>배송 현황</h2>
                <VrStatus tone={KIT_SHIPPING_TONE[participant.kitShipping]}>
                  {KIT_SHIPPING_LABEL[participant.kitShipping]}
                </VrStatus>
              </header>
              <ol className="vr-track" aria-label="배송 단계">
                {SHIPPING_STEPS.map((s, i) => (
                  <li key={s} className={i < shipIdx ? "is-done" : i === shipIdx ? "is-on" : undefined}>
                    {KIT_SHIPPING_LABEL[s]}
                  </li>
                ))}
              </ol>
              <dl className="spec">
                <div>
                  <dt>받는 분</dt>
                  <dd>{participant.name}</dd>
                </div>
                <div>
                  <dt>구성</dt>
                  <dd>{kits.length > 0 ? kits.map((r) => `${r.label} ${r.theme}`).join(" · ") : "-"}</dd>
                </div>
                <div>
                  <dt>송장번호</dt>
                  <dd>{participant.trackingNo ?? "배송이 시작되면 문자로 알려 드립니다."}</dd>
                </div>
              </dl>
            </section>

            <section className="block">
              <header className="vr-block-head">
                <h2>키트 인증</h2>
                <VrStatus tone={KIT_CERT_TONE[participant.kitCert]}>{KIT_CERT_LABEL[participant.kitCert]}</VrStatus>
              </header>

              {participant.kitCert === "approved" ? (
                <div className="apply-hint">
                  <p>키트 인증이 승인되었습니다. 경품 발송 현황은 리워드 내역에서 확인할 수 있습니다.</p>
                  <div className="flow__nav">
                    <VrLink href="/mypage/rewards" className="btn btn--ghost-gold">
                      리워드 내역
                    </VrLink>
                  </div>
                </div>
              ) : participant.kitCert === "pending" ? (
                <div className="apply-hint">
                  <p>제출한 키트 인증을 검수하고 있습니다. 결과는 48시간 안에 문자로 알려 드립니다.</p>
                </div>
              ) : (
                <>
                  <div className="ticket-notice">
                    <p className="ticket-notice__title">제출 전 확인</p>
                    <ul className="ticket-notice__list">
                      {KIT_CERT_NOTICES.map((line) => (
                        <li key={line}>· {line}</li>
                      ))}
                    </ul>
                    <p className="ticket-notice__tail">
                      자세한 기준은
                      <VrLink href="/guide/kit">키트 인증 가이드</VrLink>
                    </p>
                  </div>
                  {participant.kitCert === "rejected" && participant.kitRejectReason ? (
                    <p className="form__err">
                      반려 사유 · {participant.kitRejectReason} (재제출 {participant.kitResubmitCount}/2)
                    </p>
                  ) : null}
                  <KitCertForm onDone={setResult} />
                </>
              )}
            </section>
          </div>
        </VrMypageGate>
      </div>
    </VirtualRunSubPage>
  );
}
