import { RUNNING_CERT_MIN_KM } from "@/lib/virtual-run/running-cert";
import { VIRTUAL_RUN_RUNNING_VERIFY_NOTICES } from "@/lib/virtual-run/running-verify";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";

export function VirtualRunGuideRunningPage() {
  return (
    <VirtualRunSubPage kicker="GUIDE" title="러닝 인증" en="RUN · VERIFY">
      <section className="guide-sec">
        <div className="wrap vr-page-inner">
          <p className="vr-page-lead">
            하루 안 {RUNNING_CERT_MIN_KM}km 이상 기록을 인증 기간 내 제출합니다.
          </p>
          <article className="vr-panel">
            <h2>진행 순서</h2>
            <p>기록 캡처 → 인스타 게시(필수 해시태그) → 마이페이지 3단계 제출.</p>
          </article>
          <article className="vr-panel">
            <h2>유의 사항</h2>
            <ul className="vr-form-note">
              {VIRTUAL_RUN_RUNNING_VERIFY_NOTICES.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </article>
          <VrLink href="/mypage/sessions" className="btn btn--red">
            회차 인증하기
          </VrLink>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
