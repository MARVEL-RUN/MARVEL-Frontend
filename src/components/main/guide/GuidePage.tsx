import Image from "next/image";
import { EVENT } from "@/lib/event";
import {
  isSponsorRole,
  mainSpecHostsLogoClass,
  mainSponsorSrc,
  sponsorLogoSize,
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
            <div>
              <dt>주최·협력사</dt>
              <dd>
                <span className="spec__hosts">
                  {EVENT.sponsors.map((sponsor) => {
                    if (!isSponsorRole(sponsor.role)) return null;
                    const size = sponsorLogoSize(sponsor.role);
                    return (
                      <Image
                        key={sponsor.role}
                        src={mainSponsorSrc(sponsor.role)}
                        alt={sponsor.name}
                        width={size.width}
                        height={size.height}
                        className={mainSpecHostsLogoClass(sponsor.role)}
                      />
                    );
                  })}
                </span>
              </dd>
            </div>
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
