import Image from "next/image";
import { MAIN_ASSETS } from "@/lib/assets";
import { EVENT } from "@/lib/event";
import { SideBanner } from "../layout/SideBanner";
import { CourseMaps } from "./CourseMaps";
import { GuideTabs } from "./GuideTabs";
import { TimeTable } from "../home/TimeTable";

const HOST_LOGOS = {
  주최: { src: MAIN_ASSETS.footerHost, width: 4786, height: 1320 },
  주관: { src: MAIN_ASSETS.footerOrganizer, width: 1601, height: 220 },
} as const;

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
              <dt>주최/주관</dt>
              <dd>
                <span className="spec__hosts">
                  {EVENT.sponsors.map((sponsor) => {
                    const logo = HOST_LOGOS[sponsor.role];
                    return (
                      <Image
                        key={sponsor.role}
                        src={logo.src}
                        alt={sponsor.name}
                        width={logo.width}
                        height={logo.height}
                        className={
                          sponsor.role === "주관"
                            ? "spec__hosts-logo spec__hosts-logo--organizer"
                            : "spec__hosts-logo"
                        }
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
