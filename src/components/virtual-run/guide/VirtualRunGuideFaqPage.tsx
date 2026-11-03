import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";

export function VirtualRunGuideFaqPage() {
  return (
    <VirtualRunSubPage kicker="GUIDE" title="FAQ" en="HELP">
      <section className="guide-sec">
        <div className="wrap vr-page-inner">
          <dl className="spec">
            <div>
              <dt>버추얼런 인증은 어떻게 하나요?</dt>
              <dd>
                <VrLink href="/mypage/sessions" className="vr-inline-link">
                  마이페이지 회차 인증
                </VrLink>
                에서 제출합니다.
              </dd>
            </div>
            <div>
              <dt>인증 기간은 언제인가요?</dt>
              <dd>11/30(일)부터 1/19(월)까지 제출 가능합니다.</dd>
            </div>
            <div>
              <dt>반려되면 다시 제출할 수 있나요?</dt>
              <dd>회차당 반려 후 재제출은 최대 2회까지 가능합니다.</dd>
            </div>
          </dl>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
