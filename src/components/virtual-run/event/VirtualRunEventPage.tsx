import { VIRTUAL_RUN_EVENT_TABS } from "@/lib/virtual-run/event";
import { GuideTabs } from "../../main/guide/GuideTabs";
import { VirtualRunSubPage } from "../layout/VirtualRunSubPage";
import { OverviewTable } from "./OverviewTable";
import { VirtualRunTimeline } from "./VirtualRunTimeline";

export function VirtualRunEventPage() {
  return (
    <VirtualRunSubPage kicker="EVENT" title="행사 안내" en="VIRTUAL RUN BRIEFING">
      <section className="guide-sec vr-event-sec" id="overview">
        <div className="wrap">
          <h2>행사 개요</h2>
          <OverviewTable />
        </div>
      </section>

      <GuideTabs items={VIRTUAL_RUN_EVENT_TABS} label="행사 안내 바로가기" />

      <section className="guide-sec vr-event-sec" id="schedule">
        <hr className="guide-rule" />
        <div className="wrap">
          <h2>운영 일정</h2>
          <VirtualRunTimeline />
        </div>
      </section>
    </VirtualRunSubPage>
  );
}
