"use client";

import { useVirtualRunParticipantOrDemo } from "../participant/VirtualRunParticipantProvider";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";

const STATUS_LABEL = {
  sent: "발송 완료",
  failed: "발송 실패",
  queued: "발송 예정",
} as const;

export function VirtualRunRewardsPage() {
  const { participant, update } = useVirtualRunParticipantOrDemo();

  function retryFailed() {
    const next = {
      ...participant,
      rewards: participant.rewards.map((r) =>
        r.status === "failed" ? { ...r, status: "sent" as const } : r,
      ),
    };
    update(next);
  }

  return (
    <VirtualRunSubPage kicker="MY PAGE" title="리워드 내역" en="REWARD">
      <section className="guide-sec">
        <div className="wrap wrap--narrow vr-page-inner">
          <p className="vr-page-lead">기프티콘·쿠폰 발송 상태와 재요청(데모)을 확인합니다.</p>

          {participant.rewards.length === 0 ? (
            <article className="vr-panel">
              <p>인증 승인 후 리워드가 표시됩니다.</p>
            </article>
          ) : (
            <ul className="vr-reward-list">
              {participant.rewards.map((row) => (
                <li key={row.id} className="vr-reward-list__item">
                  <div>
                    <strong>{row.label}</strong>
                    {row.detail ? <p className="vr-form-note">{row.detail}</p> : null}
                  </div>
                  <span className={`vr-reward-list__status is-${row.status}`}>
                    {STATUS_LABEL[row.status]}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <button type="button" className="btn btn--ghost vr-stack-top" onClick={retryFailed}>
            실패 건 재발송 (데모)
          </button>
          <p className="vr-form-note">
            승인 즉시 SMS 발송은 API 연동 후 동작합니다. 번호 변경·재요청 UI는 데모만
            제공합니다.
          </p>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
