import { RUNNING_CERT_HASHTAGS, RUNNING_CERT_MIN_KM } from "@/lib/virtual-run/running-cert";
import { VIRTUAL_RUN_RUNNING_VERIFY_NOTICES } from "@/lib/virtual-run/running-verify";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { HashtagCopy } from "../mypage/HashtagCopy";
import { VrLink } from "../layout/VrLink";

export function VirtualRunGuidePage() {
  return (
    <VirtualRunSubPage kicker="GUIDE" title="인증 가이드" en="VERIFICATION">
      <section className="guide-sec">
        <div className="wrap vr-page-inner">
          <p className="vr-page-lead">
            러닝·키트·거점 인증은 마이페이지에서 제출합니다. 인스타 게시물은 인증 기간 동안
            공개를 유지해 주세요.
          </p>
          <HashtagCopy text={RUNNING_CERT_HASHTAGS} />
          <div className="vr-grid-2">
            <article className="vr-panel">
              <h2>러닝 기록 인증</h2>
              <p>
                하루 안 {RUNNING_CERT_MIN_KM}km 이상 기록 → 인스타(기록 화면·인증샷) 게시 →
                마이페이지에서 날짜·거리·시간·스크린샷·링크 제출.
              </p>
              <ul className="vr-form-note vr-stack-sm">
                {VIRTUAL_RUN_RUNNING_VERIFY_NOTICES.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
            <article className="vr-panel">
              <h2>키트 인증</h2>
              <p>
                키트·배번호가 보이는 사진과 인스타 스크린샷·링크를 제출합니다. 러닝 인증과
                다른 게시물이어야 합니다.
              </p>
            </article>
            <article className="vr-panel">
              <h2>거점 인증</h2>
              <p>협업 거점 방문 인증은 확정 시 마이페이지 거점 메뉴에서 안내됩니다.</p>
            </article>
            <article className="vr-panel">
              <h2>제출 흐름</h2>
              <p>모바일에서는 기록 입력 → 사진 → 인스타 순 3단계로 나누어 제출합니다.</p>
              <VrLink href="/mypage/sessions" className="btn btn--red vr-stack-sm">
                러닝 인증하기
              </VrLink>
            </article>
          </div>
        </div>
      </section>
      <section className="guide-sec" id="faq">
        <hr className="guide-rule" />
        <div className="wrap vr-page-inner">
          <h2>자주 묻는 질문</h2>
          <dl className="spec">
            <div>
              <dt>버추얼런 인증은 어떻게 하나요?</dt>
              <dd>
                <VrLink href="/mypage/sessions" className="vr-inline-link">
                  마이페이지 회차 카드
                </VrLink>
                에서 회차별 러닝 인증을 제출합니다.
              </dd>
            </div>
            <div>
              <dt>인증 기간은 언제인가요?</dt>
              <dd>11/30(일)부터 1/19(월)까지 제출 가능합니다. (행사 안내와 동일)</dd>
            </div>
            <div>
              <dt>반려되면 다시 제출할 수 있나요?</dt>
              <dd>회차당 반려 후 재제출은 최대 2회까지 가능합니다. (운영 기준)</dd>
            </div>
          </dl>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
