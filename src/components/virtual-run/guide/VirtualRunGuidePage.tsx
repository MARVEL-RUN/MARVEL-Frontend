import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";

export function VirtualRunGuidePage() {
  return (
    <VirtualRunSubPage kicker="GUIDE" title="인증 가이드" en="VERIFICATION">
      <section className="guide-sec">
        <div className="wrap">
          <p className="page__body vr-page-lead">
            인증 예시와 자주 묻는 질문을 확인하세요.
          </p>
          <div className="vr-grid-2">
            <article className="vr-panel">
              <h2>러닝 기록 인증</h2>
              <p>러닝 앱 캡처 또는 기록 화면을 업로드합니다. 5K 이상·일정 내 제출이 필요합니다.</p>
            </article>
            <article className="vr-panel">
              <h2>키트 인증</h2>
              <p>수령한 키트와 배번호가 보이도록 촬영해 업로드합니다.</p>
            </article>
            <article className="vr-panel">
              <h2>거점 인증</h2>
              <p>협업 거점 방문 시 안내된 방법으로 인증합니다. 거점 이벤트 확정 시 공지됩니다.</p>
            </article>
            <article className="vr-panel">
              <h2>FAQ</h2>
              <p>환불·배송·인증 마감 등은 FAQ에서 순차 업데이트됩니다.</p>
              <VrLink href="/guide#faq" className="btn btn--ghost vr-stack-sm">
                FAQ 보기
              </VrLink>
            </article>
          </div>
        </div>
      </section>
      <section className="guide-sec" id="faq">
        <hr className="guide-rule" />
        <div className="wrap">
          <h2>자주 묻는 질문</h2>
          <dl className="spec">
            <div>
              <dt>버추얼런 인증은 어떻게 하나요?</dt>
              <dd>
                마이페이지 회차 카드에서 회차별 인증을 제출합니다. 상세는 위 인증 예시를
                참고해 주세요.
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
