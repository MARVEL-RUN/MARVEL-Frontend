import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { VirtualRunTimeline } from "./VirtualRunTimeline";

export function VirtualRunEventSchedulePage() {
  return (
    <VirtualRunSubPage kicker="EVENT" title="운영 일정" en="SCHEDULE">
      <section className="guide-sec">
        <div className="wrap vr-page-inner">
          <p className="vr-page-lead">
            티켓·키트 배송·인증·행사 종료 일정입니다. 변경 시 공지로 안내합니다.
          </p>
          <VirtualRunTimeline />
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
