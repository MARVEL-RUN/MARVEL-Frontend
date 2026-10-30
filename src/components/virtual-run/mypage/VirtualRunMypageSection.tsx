import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";

type Props = {
  title: string;
  lead: string;
  kicker?: string;
  en?: string;
};

export function VirtualRunMypageSection({
  title,
  lead,
  kicker = "MY PAGE",
  en = "VERIFY · REWARD",
}: Props) {
  return (
    <VirtualRunSubPage kicker={kicker} title={title} en={en}>
      <section className="guide-sec">
        <div className="wrap wrap--narrow vr-page-inner">
          <p className="vr-page-lead">{lead}</p>
          <article className="vr-panel">
            <p>로그인 및 API 연동 후 참가 정보가 표시됩니다.</p>
          </article>
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
