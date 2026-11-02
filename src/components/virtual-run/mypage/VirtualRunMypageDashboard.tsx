"use client";

import {
  combinedMedalCount,
  roundStatusForParticipant,
} from "@/lib/virtual-run/participant";
import {
  VIRTUAL_RUN_ROUND_CERT_STATUS_LABEL,
  VIRTUAL_RUN_ROUNDS,
} from "@/lib/virtual-run/rounds";
import { virtualRunSpotsEnabled } from "@/lib/virtual-run/site";
import { useVirtualRunParticipantOrDemo } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";

const KIT_SHIPPING_LABEL = {
  preparing: "배송 준비",
  shipping: "배송 중",
  delivered: "배송 완료",
} as const;

const KIT_CERT_LABEL = {
  none: "미제출",
  pending: "검수 중",
  approved: "승인",
  rejected: "반려",
} as const;

export function VirtualRunMypageDashboard() {
  const { participant } = useVirtualRunParticipantOrDemo();
  const medalDone = combinedMedalCount(participant);

  return (
    <VirtualRunSubPage kicker="MY PAGE" title="마이페이지" en="VERIFY · REWARD">
      <section className="guide-sec">
        <div className="wrap wrap--narrow vr-page-inner">
          <header className="vr-mypage-hero">
            <div>
              <p className="vr-mypage-hero__name">{participant.name}</p>
              <p className="vr-mypage-hero__bib">배번호 {participant.bib}</p>
            </div>
            <div className="vr-mypage-hero__medal" aria-label="결합 메달 진행">
              <span className="vr-mypage-hero__medal-count">
                {medalDone} / 3
              </span>
              <span className="vr-form-note">결합 메달</span>
            </div>
          </header>

          <article className="vr-mypage-block">
            <div className="vr-mypage-block__head">
              <h2>키트</h2>
              <VrLink href="/mypage/kit" className="vr-inline-link">
                키트 카드
              </VrLink>
            </div>
            <p className="vr-mypage-block__meta">
              {KIT_SHIPPING_LABEL[participant.kitShipping]}
              {participant.trackingNo ? ` · 송장 ${participant.trackingNo}` : null}
            </p>
            <p className="vr-mypage-block__meta">
              키트 인증 · {KIT_CERT_LABEL[participant.kitCert]}
            </p>
            {participant.kitCert !== "approved" ? (
              <VrLink href="/mypage/kit" className="btn btn--red vr-stack-sm">
                키트 인증하기
              </VrLink>
            ) : null}
          </article>

          <article className="vr-mypage-block">
            <div className="vr-mypage-block__head">
              <h2>회차</h2>
              <VrLink href="/mypage/sessions" className="vr-inline-link">
                회차 카드
              </VrLink>
            </div>
            <ul className="vr-round-cards">
              {VIRTUAL_RUN_ROUNDS.map((round) => {
                const status = roundStatusForParticipant(participant, round.id);
                const progress = participant.rounds[round.id];
                return (
                  <li
                    key={round.id}
                    className={`vr-round-card vr-round-card--${round.accent}`}
                  >
                    <div className="vr-round-card__top">
                      <span>{round.label}</span>
                      <strong>{round.theme}</strong>
                    </div>
                    <p className="vr-round-card__state">
                      {VIRTUAL_RUN_ROUND_CERT_STATUS_LABEL[status]}
                    </p>
                    {progress?.summary ? (
                      <p className="vr-form-note">
                        {progress.summary.runDate} · {progress.summary.distanceKm}km ·{" "}
                        {progress.summary.durationLabel}
                      </p>
                    ) : null}
                    {status === "ready" || status === "rejected" ? (
                      <VrLink
                        href="/mypage/sessions"
                        className="btn btn--ghost vr-round-card__cta"
                      >
                        {status === "rejected" ? "다시 제출" : "러닝 인증하기"}
                      </VrLink>
                    ) : null}
                    {status === "approved" ? (
                      <button type="button" className="btn btn--ghost vr-round-card__cta" disabled>
                        완주증 다운로드 (데모)
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="vr-mypage-block">
            <div className="vr-mypage-block__head">
              <h2>리워드</h2>
              <VrLink href="/mypage/rewards" className="vr-inline-link">
                전체 내역
              </VrLink>
            </div>
            {participant.rewards.length === 0 ? (
              <p className="vr-form-note">아직 발송 내역이 없습니다.</p>
            ) : (
              <ul className="vr-reward-mini">
                {participant.rewards.slice(0, 3).map((row) => (
                  <li key={row.id}>
                    <strong>{row.label}</strong>
                    <span>{row.status === "sent" ? "발송 완료" : row.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>

          {virtualRunSpotsEnabled ? (
            <article className="vr-mypage-block">
              <div className="vr-mypage-block__head">
                <h2>거점 이벤트</h2>
                <VrLink href="/mypage/spots" className="vr-inline-link">
                  거점 인증
                </VrLink>
              </div>
              <p className="vr-form-note">협업 거점 방문 인증 (선택)</p>
            </article>
          ) : null}
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
