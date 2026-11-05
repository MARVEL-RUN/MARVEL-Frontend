"use client";

import {
  combinedMedalCount,
  roundStatusForParticipant,
  type VirtualRunParticipant,
} from "@/lib/virtual-run/participant";
import {
  VIRTUAL_RUN_ROUND_CERT_STATUS_LABEL,
  VIRTUAL_RUN_ROUNDS,
} from "@/lib/virtual-run/rounds";
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
import { VrLink } from "../layout/VrLink";
import { VrMypageGate } from "./VrMypageGate";
import { VrStatus } from "./VrStatus";

const PACKAGE_ROUND_LINE = VIRTUAL_RUN_ROUNDS.map((round) => round.theme).join(" · ");

function ticketLabel(p: VirtualRunParticipant) {
  if (p.categoryName?.trim()) return p.categoryName.trim();
  const owned = VIRTUAL_RUN_ROUNDS.filter((r) => p.ownedRoundIds.includes(r.id));
  if (owned.length === 0) return "티켓 없음";
  if (owned.length >= VIRTUAL_RUN_ROUNDS.length) return "어셈블 패키지";
  if (owned.length === 1) return `${owned[0].theme} 패키지`;
  return owned.map((r) => `${r.theme} 패키지`).join(" · ");
}

function isThreeRoundPackage(p: VirtualRunParticipant, label: string) {
  if (p.ownedRoundIds.length >= VIRTUAL_RUN_ROUNDS.length) return true;
  if (p.ownedRoundIds.length > 0) return false;
  return /어셈블|3종|3회차/.test(label);
}

function nextAction(p: VirtualRunParticipant): { href: string; label: string } | null {
  if (p.kitCert === "none" || p.kitCert === "rejected") {
    return {
      href: "/mypage/kit",
      label: p.kitCert === "rejected" ? "키트 다시 인증하기" : "키트 인증하기",
    };
  }
  for (const round of VIRTUAL_RUN_ROUNDS) {
    const status = roundStatusForParticipant(p, round.id);
    if (status === "ready" || status === "rejected") {
      return {
        href: "/mypage/sessions",
        label:
          status === "rejected"
            ? `${round.label} 다시 제출하기`
            : `${round.label} · ${round.theme} 인증하기`,
      };
    }
  }
  return null;
}

export function VirtualRunMypageDashboard() {
  const { participant } = useVirtualRunParticipantOrDemo();
  const medalDone = combinedMedalCount(participant);
  const ticket = ticketLabel(participant);
  const action = nextAction(participant);
  const packageRounds = isThreeRoundPackage(participant, ticket);

  return (
    <VirtualRunSubPage kicker="MY PAGE" title="마이페이지" en="VERIFY · REWARD">
      <div className="page__body wrap">
        <VrMypageGate>
          <div className="vr-stack">
            <div className="vr-dash-split">
              <section className="vr-me">
                <div className="vr-me__who">
                  <span className="kicker">RUNNER</span>
                  <h2>
                    {participant.name}
                    <small>님</small>
                  </h2>
                  <p className="vr-me__meta">
                    배번호 <strong>{participant.bib.trim() || "-"}</strong>
                    <span aria-hidden>·</span>
                    {maskPhone(participant.phone)}
                  </p>
                  <VrLink href="/mypage/edit" className="vr-me__edit">
                    신청 정보 수정
                  </VrLink>
                  {packageRounds ? null : (
                    <VrLink href="/mypage/upgrade" className="vr-me__edit">
                      패키지 상향
                    </VrLink>
                  )}
                </div>

                <dl className="vr-me__facts">
                  <div>
                    <dt>보유 티켓</dt>
                    <dd>
                      <strong>{ticket}</strong>
                      {packageRounds ? (
                        <span className="vr-me__fact-sub">{PACKAGE_ROUND_LINE}</span>
                      ) : null}
                    </dd>
                  </div>
                </dl>

                {action ? (
                  <div className="vr-me__cta-wrap">
                    <VrLink href={action.href} className="lookup-other__btn">
                      {action.label}
                    </VrLink>
                  </div>
                ) : (
                  <p className="vr-me__cta-done">제출할 인증이 없습니다</p>
                )}

                <div
                  className={`vr-me__medal${medalDone >= VIRTUAL_RUN_ROUNDS.length ? " is-done" : ""}`}
                  aria-label={
                    medalDone >= VIRTUAL_RUN_ROUNDS.length
                      ? "결합 메달 결합 완료"
                      : `결합 메달 ${medalDone}/3`
                  }
                >
                  <div className="vr-me__medal-head">
                    <span className="vr-me__medal-label">
                      {medalDone >= VIRTUAL_RUN_ROUNDS.length ? "결합 완료" : "결합 메달"}
                    </span>
                    <span className="vr-me__medal-progress">
                      <strong>{medalDone}</strong>
                      <span>/3</span>
                    </span>
                  </div>
                  <div
                    className="vr-me__medal-bar"
                    style={{ "--medal-fill": `${(medalDone / VIRTUAL_RUN_ROUNDS.length) * 100}%` } as React.CSSProperties}
                    aria-hidden
                  >
                    <span />
                  </div>
                  <ol className="vr-me__slots">
                    {VIRTUAL_RUN_ROUNDS.map((r) => {
                      const status = roundStatusForParticipant(participant, r.id);
                      const on = status === "approved";
                      return (
                        <li key={r.id} className={`is-${r.accent}${on ? " is-on" : ""}`}>
                          <span className="vr-me__slot-name">{r.theme}</span>
                          <span className="vr-me__slot-status">
                            {VIRTUAL_RUN_ROUND_CERT_STATUS_LABEL[status]}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </section>

              <div className="vr-dash-split__main vr-stack">
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
                    <p className="vr-empty">
                      조건 충족 시 추첨 대상이 되며, 당첨자 배송 내역이 표시됩니다.
                    </p>
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
              </div>
            </div>
          </div>
        </VrMypageGate>
      </div>
    </VirtualRunSubPage>
  );
}
