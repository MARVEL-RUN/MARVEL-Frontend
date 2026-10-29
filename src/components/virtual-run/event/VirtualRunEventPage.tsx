import { OverviewTable } from "./OverviewTable";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";

export function VirtualRunEventPage() {
  return (
    <VirtualRunSubPage kicker="EVENT" title="행사 안내" en="VIRTUAL RUN BRIEFING">
      <section className="guide-sec">
        <div className="wrap">
          <p className="page__body vr-page-lead">
            참가 방법과 메달·리워드 구성을 안내합니다.
          </p>
          <div className="vr-grid-2">
            <article className="vr-panel">
              <h2>참가 방법</h2>
              <p>티켓 구매 후 키트가 배송되면, 회차별 러닝 기록을 인증합니다.</p>
              <p>키트 인증·거점 이벤트(협업 확정 시)는 선택 참여입니다.</p>
              <p>로그인은 회원가입 없이 배번호와 휴대폰 문자 인증으로 진행합니다.</p>
            </article>
            <article className="vr-panel">
              <h2>메달 · 완주증</h2>
              <p>회차별 5K 인증 완료 시 디지털 완주증을 발급합니다.</p>
              <p>메달·실물 리워드는 행사 안내 및 마이페이지에서 확인할 수 있습니다.</p>
            </article>
          </div>
          <div className="vr-stack-top">
            <OverviewTable />
          </div>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
