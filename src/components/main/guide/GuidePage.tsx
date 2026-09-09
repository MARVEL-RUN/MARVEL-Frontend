import Link from "next/link";
import { EVENT } from "@/lib/event";
import { REGISTER_HREF, registerUiOpen } from "@/lib/mode";
import { SideBanner } from "../layout/SideBanner";
import { CourseMaps } from "./CourseMaps";
import { TimeTable } from "../home/TimeTable";

export function GuidePage() {
  return (
    <main className="page">
      <SideBanner kicker="GUIDE" title="대회안내" en="RACE BRIEFING" />
      <div className="page__body wrap">
        <section className="block">
          <h2>한눈에 보기</h2>
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
          </dl>
        </section>

        <section className="block">
          <h2>타임테이블</h2>
          <TimeTable />
        </section>

        <section className="block">
          <h2>코스</h2>
          <CourseMaps />
        </section>

        <section className="block">
          <h2>기념품</h2>
          <div className="media-ph" role="img" aria-label="기념품">
            기념품
          </div>
          <ul className="chips">
            {EVENT.kit.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <Link href={REGISTER_HREF} className="btn btn--red">
          {registerUiOpen ? "참가신청" : "접수 안내"}
        </Link>
      </div>
    </main>
  );
}
