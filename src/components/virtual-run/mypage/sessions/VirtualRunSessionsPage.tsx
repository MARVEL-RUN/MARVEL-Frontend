import { VirtualRunSubPage } from "../../layout/VirtualRunSubPage";
import { VrLink } from "../../layout/VrLink";
import { RunningCertForm } from "./RunningCertForm";
import { SessionRoundBar } from "./SessionRoundBar";
import "./sessions.css";

export function VirtualRunSessionsPage() {
  return (
    <VirtualRunSubPage kicker="MY PAGE" title="회차 카드" en="RUN · VERIFY">
      <section className="guide-sec">
        <div className="wrap wrap--narrow vr-page-inner vr-sessions-page">
          <p className="vr-page-lead">
            회차별 5km 러닝 기록을 제출합니다. 구매한 회차만큼 반복 인증할 수 있습니다.
          </p>
          <SessionRoundBar />
          <RunningCertForm />
          <p className="vr-form-note">
            인증 방법은{" "}
            <VrLink href="/guide" className="vr-inline-link">
              인증 가이드
            </VrLink>
            를 참고해 주세요.
          </p>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
