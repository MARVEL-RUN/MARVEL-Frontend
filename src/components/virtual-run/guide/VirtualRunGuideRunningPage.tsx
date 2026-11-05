import {
  VIRTUAL_RUN_RUNNING_AUTO,
  VIRTUAL_RUN_RUNNING_FIELDS,
  VIRTUAL_RUN_RUNNING_RULES,
} from "@/lib/virtual-run/guide";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";
import { GuideFields, GuideSpec } from "./GuideSpec";

export function VirtualRunGuideRunningPage() {
  return (
    <VirtualRunSubPage kicker="GUIDE" title="러닝 인증" en="RUNNING VERIFY">
      <section className="guide-sec">
        <div className="wrap">
          <h2>완주 조건</h2>
          <GuideSpec rows={VIRTUAL_RUN_RUNNING_RULES} />
        </div>
      </section>

      <section className="guide-sec">
        <hr className="guide-rule" />
        <div className="wrap">
          <h2>제출 항목</h2>
          <GuideFields fields={VIRTUAL_RUN_RUNNING_FIELDS} />
        </div>
      </section>

      <section className="guide-sec">
        <hr className="guide-rule" />
        <div className="wrap">
          <h2>자동 승인 기준</h2>
          <GuideSpec rows={VIRTUAL_RUN_RUNNING_AUTO} />
          <div className="ticket-notice">
            <p className="ticket-notice__title">검수로 넘어가면</p>
            <ul className="ticket-notice__list">
              <li>· 기준에 맞으면 제출 즉시 승인되며, 키트 인증까지 충족하면 완주 리워드 추첨 대상이 됩니다.</li>
              <li>· 기준을 벗어나거나 판독이 어려우면 운영진이 확인해 48시간 안에 결과를 알려 드립니다.</li>
              <li>· 반려되면 사유를 확인한 뒤 회차당 2번까지 다시 제출할 수 있습니다.</li>
            </ul>
          </div>
          <div className="flow__nav">
            <VrLink href="/guide" className="btn btn--ghost">
              가이드 홈
            </VrLink>
            <VrLink href="/mypage/sessions" className="btn btn--red">
              러닝 인증하기
            </VrLink>
          </div>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
