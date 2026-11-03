import { ChevronRight } from "lucide-react";
import { VIRTUAL_RUN_GUIDE_COMMON, VIRTUAL_RUN_GUIDE_FLOW } from "@/lib/virtual-run/guide";
import { RUNNING_CERT_HASHTAGS } from "@/lib/virtual-run/running-cert";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VrLink } from "../layout/VrLink";
import { HashtagCopy } from "../mypage/HashtagCopy";
import { GuideSpec } from "./GuideSpec";

const KINDS = [
  {
    href: "/guide/running",
    no: "01",
    code: "RUNNING",
    title: "러닝 인증",
    desc: "회차마다 하루 안 5km · 승인 즉시 기프티콘",
    tone: "",
  },
  {
    href: "/guide/kit",
    no: "02",
    code: "KIT",
    title: "키트 인증",
    desc: "받은 키트와 배번호 사진 · 협업 경품 응모",
    tone: " kind-pick__item--cyan",
  },
] as const;

export function VirtualRunGuideHubPage() {
  return (
    <VirtualRunSubPage kicker="GUIDE" title="인증 가이드" en="HOW TO VERIFY">
      <section className="guide-sec">
        <div className="wrap">
          <h2>인증 흐름</h2>
          <ol className="vr-flow">
            {VIRTUAL_RUN_GUIDE_FLOW.map((item, i) => (
              <li key={item.code}>
                <span className="vr-flow__no">{String(i + 1).padStart(2, "0")}</span>
                <span className="vr-flow__code">{item.code}</span>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="guide-sec">
        <hr className="guide-rule" />
        <div className="wrap">
          <h2>인증 종류</h2>
          <ul className="kind-pick">
            {KINDS.map((k) => (
              <li key={k.href}>
                <VrLink href={k.href} className={`kind-pick__item${k.tone}`}>
                  <span className="kind-pick__no">{k.no}</span>
                  <span className="kind-pick__body">
                    <span className="kind-pick__code">{k.code}</span>
                    <strong className="kind-pick__title">{k.title}</strong>
                    <span className="kind-pick__desc">{k.desc}</span>
                  </span>
                  <ChevronRight className="kind-pick__go" size={22} aria-hidden />
                </VrLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="guide-sec">
        <hr className="guide-rule" />
        <div className="wrap">
          <h2>필수 해시태그</h2>
          <HashtagCopy tags={RUNNING_CERT_HASHTAGS} showLabel={false} />
        </div>
      </section>

      <section className="guide-sec">
        <hr className="guide-rule" />
        <div className="wrap">
          <h2>공통 규칙</h2>
          <GuideSpec rows={VIRTUAL_RUN_GUIDE_COMMON} />
          <div className="flow__nav">
            <VrLink href="/guide/faq" className="btn btn--ghost">
              자주 묻는 질문
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
