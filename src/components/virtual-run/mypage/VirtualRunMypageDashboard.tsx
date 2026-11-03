"use client";

import { useRouter } from "next/navigation";
import { combinedMedalCount, roundStatusForParticipant } from "@/lib/virtual-run/participant";
import { VIRTUAL_RUN_ROUND_CERT_STATUS_LABEL, VIRTUAL_RUN_ROUNDS } from "@/lib/virtual-run/rounds";
import { virtualRunSpotsEnabled } from "@/lib/virtual-run/site";
import {
  KIT_CERT_LABEL,
  KIT_CERT_TONE,
  KIT_SHIPPING_LABEL,
  KIT_SHIPPING_TONE,
  REWARD_KIND_CODE,
  REWARD_STATUS_LABEL,
  REWARD_STATUS_TONE,
  VIRTUAL_RUN_ROUND_STATUS_TONE,
  maskPhone,
} from "@/lib/virtual-run/status";
import { useVirtualRunParticipantOrDemo } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink, useVrPath } from "../layout/VrLink";
import { VrMypageGate } from "./VrMypageGate";
import { VrStatus } from "./VrStatus";

export function VirtualRunMypageDashboard() {
  const { participant, logout } = useVirtualRunParticipantOrDemo();
  const router = useRouter();
  const toHref = useVrPath();
  const medalDone = combinedMedalCount(participant);

  function onLogout() {
    logout();
    router.push(toHref("/login"));
  }

  return (
    <VirtualRunSubPage kicker="MY PAGE" title="참가 개요" en="VERIFY · REWARD">
      <div className="page__body wrap wrap--narrow">
        <VrMypageGate>
          <div className="vr-stack">
            <section className="vr-me">
              <div className="vr-me__who">
                <span className="kicker">RUNNER</span>
                <h2>
                  {participant.name}
                  <small>님</small>
                </h2>
                <p className="vr-me__meta">
                  배번호 <strong>{participant.bib}</strong>
                  <span aria-hidden>·</span>
                  {maskPhone(participant.phone)}
                </p>
              </div>
              <div className="vr-me__medal" aria-label={`결합 메달 ${medalDone}/3`}>
                <p className="vr-me__medal-label">결합 메달</p>
                <p className="vr-me__medal-count">
                  <strong>{medalDone}</strong> / 3
                </p>
                <ol className="vr-me__pips">
                  {VIRTUAL_RUN_ROUNDS.map((r) => (
                    <li
                      key={r.id}
                      className={`is-${r.accent}${participant.rounds[r.id]?.status === "approved" && participant.ownedRoundIds.includes(r.id) ? " is-on" : ""}`}
                      title={`${r.label} ${r.theme}`}
                    />
                  ))}
                </ol>
              </div>
            </section>

            <section className="block">
              <header className="vr-block-head">
                <h2>회차 인증</h2>
                <VrLink href="/mypage/sessions" className="vr-more">
                  인증하러 가기
                </VrLink>
              </header>
              <ul className="vr-rounds">
                {VIRTUAL_RUN_ROUNDS.map((round) => {
                  const status = roundStatusForParticipant(participant, round.id);
                  const summary = participant.rounds[round.id]?.summary;
                  return (
                    <li key={round.id} className={`vr-round is-${round.accent}${status === "locked" ? " is-off" : ""}`}>
                      <span className="vr-round__no">{String(round.order).padStart(2, "0")}</span>
                      <div className="vr-round__body">
                        <span className="vr-round__code">{round.code}</span>
                        <strong className="vr-round__title">
                          {round.label} · {round.theme}
                        </strong>
                        <span className="vr-round__desc">
                          {summary && status !== "locked"
                            ? `${summary.runDate} · ${summary.distanceKm.toFixed(2)}km · ${summary.durationLabel}`
                            : status === "locked"
                              ? "이 회차 티켓이 없습니다."
                              : "하루 안 5km 기록을 제출해 주세요."}
                        </span>
                      </div>
                      <div className="vr-round__side">
                        <VrStatus tone={VIRTUAL_RUN_ROUND_STATUS_TONE[status]}>
                          {VIRTUAL_RUN_ROUND_CERT_STATUS_LABEL[status]}
                        </VrStatus>
                        {status === "ready" || status === "rejected" ? (
                          <VrLink href="/mypage/sessions" className="vr-list__act">
                            {status === "rejected" ? "다시 제출" : "인증하기"}
                          </VrLink>
                        ) : status === "approved" ? (
                          <button type="button" className="vr-list__act" disabled title="인증 기간 종료 후 열립니다">
                            완주증 준비 중
                          </button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="block">
              <header className="vr-block-head">
                <h2>키트</h2>
                <VrLink href="/mypage/kit" className="vr-more">
                  키트 카드
                </VrLink>
              </header>
              <dl className="spec">
                <div>
                  <dt>배송</dt>
                  <dd>
                    <VrStatus tone={KIT_SHIPPING_TONE[participant.kitShipping]}>
                      {KIT_SHIPPING_LABEL[participant.kitShipping]}
                    </VrStatus>
                    {participant.trackingNo ? <small className="vr-dd-sub">송장 {participant.trackingNo}</small> : null}
                  </dd>
                </div>
                <div>
                  <dt>키트 인증</dt>
                  <dd>
                    <VrStatus tone={KIT_CERT_TONE[participant.kitCert]}>{KIT_CERT_LABEL[participant.kitCert]}</VrStatus>
                    {participant.kitCert === "none" || participant.kitCert === "rejected" ? (
                      <VrLink href="/mypage/kit" className="vr-list__act">
                        인증하기
                      </VrLink>
                    ) : null}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="block">
              <header className="vr-block-head">
                <h2>리워드</h2>
                <VrLink href="/mypage/rewards" className="vr-more">
                  전체 내역
                </VrLink>
              </header>
              {participant.rewards.length === 0 ? (
                <p className="vr-empty">인증이 승인되면 리워드 발송 내역이 표시됩니다.</p>
              ) : (
                <ul className="vr-list">
                  {participant.rewards.slice(0, 3).map((row) => (
                    <li key={row.id} className="vr-list__item">
                      <span className="vr-list__code">{REWARD_KIND_CODE[row.kind]}</span>
                      <div className="vr-list__body">
                        <strong>{row.label}</strong>
                      </div>
                      <div className="vr-list__side">
                        <VrStatus tone={REWARD_STATUS_TONE[row.status]}>{REWARD_STATUS_LABEL[row.status]}</VrStatus>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {virtualRunSpotsEnabled ? (
              <section className="block">
                <header className="vr-block-head">
                  <h2>거점 이벤트</h2>
                  <VrLink href="/mypage/spots" className="vr-more">
                    거점 인증
                  </VrLink>
                </header>
                <p className="vr-empty">협업 거점을 방문해 인증하면 거점 쿠폰을 드립니다.</p>
              </section>
            ) : null}

            <div className="lookup-other">
              <button type="button" className="lookup-other__btn" onClick={onLogout}>
                로그아웃
              </button>
            </div>
          </div>
        </VrMypageGate>
      </div>
    </VirtualRunSubPage>
  );
}
