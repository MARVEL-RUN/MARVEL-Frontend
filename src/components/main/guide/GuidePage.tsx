import Image from "next/image";
import { EVENT } from "@/lib/event";
import {
  footerPartnerLogo,
  guideSpecHostsLogoClass,
} from "@/lib/sponsor-logos";
import { SideBanner } from "../layout/SideBanner";
import { CourseMaps } from "./CourseMaps";
import { GuideTabs } from "./GuideTabs";
import { TimeTable } from "../home/TimeTable";

export function GuidePage() {
  return (
    <main className="page">
      <SideBanner kicker="GUIDE" title="대회안내" en="RACE BRIEFING" />

      <section className="guide-sec" id="overview">
        <div className="wrap">
          <h2>대회개요</h2>
          <dl className="spec">
            {EVENT.info.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>
                  {item.value}
                  {"note" in item && item.note ? <small>{item.note}</small> : null}
                </dd>
              </div>
            ))}
            {EVENT.footerPartners.map((group) => (
              <div key={group.role}>
                <dt>{group.role}</dt>
                <dd>
                  <span className="spec__hosts">
                    {group.items.map((item) => {
                      const logo = footerPartnerLogo(item.key);
                      return (
                        <Image
                          key={item.key}
                          src={logo.src}
                          alt={item.name}
                          width={logo.width}
                          height={logo.height}
                          className={guideSpecHostsLogoClass(item.key)}
                        />
                      );
                    })}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <GuideTabs />

      <section className="guide-sec" id="timeline">
        <hr className="guide-rule" />
        <div className="wrap">
          <h2>타임라인</h2>
          <TimeTable />
        </div>
      </section>

      <section className="guide-sec" id="course">
        <hr className="guide-rule" />
        <div className="wrap">
          <h2>코스</h2>
          <CourseMaps />
        </div>
      </section>
    </main>
  );
}
