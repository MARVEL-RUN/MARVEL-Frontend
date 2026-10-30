import { virtualRunSpotsEnabled } from "@/lib/virtual-run/site";
import { VIRTUAL_RUN_MYPAGE_NAV } from "@/lib/virtual-run/nav";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";

export function VirtualRunMypageHub() {
  const items = VIRTUAL_RUN_MYPAGE_NAV.filter(
    (item) => !("spotsOnly" in item && item.spotsOnly) || virtualRunSpotsEnabled,
  );

  return (
    <VirtualRunSubPage kicker="MY PAGE" title="마이페이지" en="VERIFY · REWARD">
      <section className="guide-sec">
        <div className="wrap wrap--narrow vr-page-inner">
          <p className="vr-page-lead">
            인증·리워드를 회차·키트 단위로 관리합니다.
          </p>
          <div className="vr-mypage-nav">
            {items.map((item) => (
              <VrLink key={item.href} href={item.href} className="vr-mypage-card">
                <strong>{item.label}</strong>
                <span>{item.desc}</span>
              </VrLink>
            ))}
          </div>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
