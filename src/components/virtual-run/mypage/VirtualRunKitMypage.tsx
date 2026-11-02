"use client";

import { KIT_CERT_NOTICES } from "@/lib/virtual-run/kit-cert";
import { useVirtualRunParticipantOrDemo } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { KitCertForm } from "./KitCertForm";

const KIT_SHIPPING_LABEL = {
  preparing: "배송 준비",
  shipping: "배송 중",
  delivered: "배송 완료",
} as const;

export function VirtualRunKitMypage() {
  const { participant } = useVirtualRunParticipantOrDemo();

  return (
    <VirtualRunSubPage kicker="MY PAGE" title="키트 카드" en="KIT · VERIFY">
      <section className="guide-sec">
        <div className="wrap wrap--narrow vr-page-inner">
          <p className="vr-page-lead">배송 상태와 키트 인증을 확인합니다.</p>

          <article className="vr-panel">
            <h2>배송</h2>
            <p>
              상태: <strong>{KIT_SHIPPING_LABEL[participant.kitShipping]}</strong>
            </p>
            {participant.trackingNo ? (
              <p className="vr-form-note">송장번호 {participant.trackingNo}</p>
            ) : (
              <p className="vr-form-note">송장 등록 전입니다.</p>
            )}
          </article>

          <article className="vr-panel">
            <h2>키트 인증 안내</h2>
            {KIT_CERT_NOTICES.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </article>

          {participant.kitCert === "approved" ? (
            <article className="vr-panel vr-cert-done">
              <h2>키트 인증 승인</h2>
              <p>리워드는 리워드 내역에서 확인할 수 있습니다.</p>
            </article>
          ) : (
            <KitCertForm />
          )}
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
