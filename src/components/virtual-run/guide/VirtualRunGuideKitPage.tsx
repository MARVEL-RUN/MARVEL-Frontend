import { VIRTUAL_RUN_KIT_FIELDS, VIRTUAL_RUN_REVIEW_REASONS } from "@/lib/virtual-run/guide";
import { KIT_CERT_HASHTAGS } from "@/lib/virtual-run/kit-cert";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";
import { HashtagCopy } from "../mypage/HashtagCopy";
import { GuideFields } from "./GuideSpec";

export function VirtualRunGuideKitPage() {
  return (
    <VirtualRunSubPage kicker="GUIDE" title="키트 인증" en="KIT VERIFY">
      <section className="guide-sec">
        <div className="wrap">
          <h2>이렇게 인증해요</h2>
          <ol className="vr-flow vr-flow--3">
            <li>
              <span className="vr-flow__no">01</span>
              <span className="vr-flow__code">PHOTO</span>
              <strong>키트 촬영</strong>
              <p>받은 키트를 배번호가 보이게 1~3장 찍습니다.</p>
            </li>
            <li>
              <span className="vr-flow__no">02</span>
              <span className="vr-flow__code">POST</span>
              <strong>인스타 게시</strong>
              <p>필수 해시태그와 함께 러닝 인증과 다른 게시물로 올립니다.</p>
            </li>
            <li>
              <span className="vr-flow__no">03</span>
              <span className="vr-flow__code">SUBMIT</span>
              <strong>키트 카드에서 제출</strong>
              <p>사진·게시물 스크린샷·링크를 마이페이지에 제출합니다.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="guide-sec">
        <hr className="guide-rule" />
        <div className="wrap">
          <h2>제출 항목</h2>
          <GuideFields fields={VIRTUAL_RUN_KIT_FIELDS} />
          <HashtagCopy tags={KIT_CERT_HASHTAGS} />
        </div>
      </section>

      <section className="guide-sec">
        <hr className="guide-rule" />
        <div className="wrap">
          <h2>검수 대상</h2>
          <div className="ticket-notice">
            <p className="ticket-notice__title">이런 경우 운영진이 직접 확인합니다</p>
            <ul className="ticket-notice__list">
              {VIRTUAL_RUN_REVIEW_REASONS.map((line) => (
                <li key={line}>· {line}</li>
              ))}
            </ul>
            <p className="ticket-notice__tail">부정이 확인되면 리워드를 회수하고 이후 제출이 제한됩니다.</p>
          </div>
          <div className="flow__nav">
            <VrLink href="/guide" className="btn btn--ghost">
              가이드 홈
            </VrLink>
            <VrLink href="/mypage/kit" className="btn btn--red">
              키트 인증하기
            </VrLink>
          </div>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
