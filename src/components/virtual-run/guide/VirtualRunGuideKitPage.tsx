import { KIT_CERT_NOTICES } from "@/lib/virtual-run/kit-cert";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";

export function VirtualRunGuideKitPage() {
  return (
    <VirtualRunSubPage kicker="GUIDE" title="키트 인증" en="KIT · VERIFY">
      <section className="guide-sec">
        <div className="wrap vr-page-inner">
          <p className="vr-page-lead">키트 수령 후 배번호가 보이도록 촬영·업로드합니다.</p>
          <article className="vr-panel">
            <h2>안내</h2>
            {KIT_CERT_NOTICES.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </article>
          <VrLink href="/mypage/kit" className="btn btn--red">
            키트 인증하기
          </VrLink>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
