import Image from "next/image";
import Link from "next/link";
import { MAIN_ASSETS } from "@/lib/assets";
import { EVENT } from "@/lib/event";
import { REGISTER_HREF, registerUiOpen } from "@/lib/mode";
import { SideBanner } from "../layout/SideBanner";

const COURSE_MAPS = [
  { src: MAIN_ASSETS.course2_5k, label: "2.5K Course" },
  { src: MAIN_ASSETS.course5k, label: "5K Course" },
  { src: MAIN_ASSETS.course10k, label: "10K Course" },
] as const;

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
          <h2>코스</h2>
          <div className="table">
            <div className="table__row table__row--head">
              <span>코스</span>
              <span>코드</span>
              <span>스타트</span>
              <span>제한</span>
              <span>참가비</span>
            </div>
            {EVENT.courses.map((c) => (
              <div key={c.id} className="table__row">
                <span>{c.distance}</span>
                <span>{c.code}</span>
                <span>{c.start}</span>
                <span>{c.timeLimit}</span>
                <span>{c.fee}</span>
              </div>
            ))}
          </div>
          <div className="course-maps">
            {COURSE_MAPS.map((map) => (
              <figure key={map.src} className="course-map">
                <Image
                  src={map.src}
                  alt={`${map.label} 코스도`}
                  width={2186}
                  height={2160}
                  sizes="(max-width: 1120px) 100vw, 1120px"
                />
                <figcaption>{map.label}</figcaption>
              </figure>
            ))}
          </div>
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
