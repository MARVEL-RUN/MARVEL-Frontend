import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { HashtagCopy } from "../mypage/HashtagCopy";
import { VrLink } from "../layout/VrLink";
import { RUNNING_CERT_HASHTAGS } from "@/lib/virtual-run/running-cert";

const LINKS = [
  { href: "/guide/running", label: "러닝 인증", note: "5K 기록·인스타·제출 흐름" },
  { href: "/guide/kit", label: "키트 인증", note: "키트 사진·배번호·SNS" },
  { href: "/guide/faq", label: "FAQ", note: "기간·반려·재제출" },
] as const;

export function VirtualRunGuideHubPage() {
  return (
    <VirtualRunSubPage kicker="GUIDE" title="인증 가이드" en="VERIFICATION">
      <section className="guide-sec">
        <div className="wrap vr-page-inner">
          <p className="vr-page-lead">
            인증 규칙과 예시를 확인한 뒤 마이페이지에서 제출해 주세요.
          </p>
          <HashtagCopy text={RUNNING_CERT_HASHTAGS} />
          <div className="vr-mypage-nav">
            {LINKS.map((item) => (
              <VrLink key={item.href} href={item.href} className="vr-mypage-card">
                <strong>{item.label}</strong>
                <span>{item.note}</span>
              </VrLink>
            ))}
          </div>
          <VrLink href="/mypage/sessions" className="btn btn--red vr-stack-top">
            회차 인증 제출
          </VrLink>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
