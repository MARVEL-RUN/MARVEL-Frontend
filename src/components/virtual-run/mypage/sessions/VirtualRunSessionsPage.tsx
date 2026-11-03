import { VirtualRunSubPage } from "../../layout/VirtualRunSubPage";
import { VrLink } from "../../layout/VrLink";
import { VrMypageGate } from "../VrMypageGate";
import { RunningCertForm } from "./RunningCertForm";
import { SessionRoundBar } from "./SessionRoundBar";

export function VirtualRunSessionsPage() {
  return (
    <VirtualRunSubPage kicker="MY PAGE" title="회차 인증" en="RUN · VERIFY">
      <div className="page__body wrap">
        <VrMypageGate>
          <div className="vr-stack">
            <header className="form__head">
              <h2>러닝 인증</h2>
              <p className="form__note">
                회차마다 하루 안 5km 기록을 한 번 제출합니다. 처음이라면{" "}
                <VrLink href="/guide/running" className="vr-inline-link">
                  러닝 인증 가이드
                </VrLink>
                를 먼저 확인해 주세요.
              </p>
            </header>
            <SessionRoundBar />
            <RunningCertForm />
          </div>
        </VrMypageGate>
      </div>
    </VirtualRunSubPage>
  );
}
