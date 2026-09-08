import { EVENT } from "@/lib/event";
import { SideBanner } from "../layout/SideBanner";

export function DirectionsPage() {
  return (
    <main className="page">
      <SideBanner kicker="LOCATION" title="오시는길" en="GET TO THE START LINE" />
      <div className="page__body wrap">
        <section className="block venue-card">
          <p className="kicker">VENUE</p>
          <h2>{EVENT.venue}</h2>
          <p>{EVENT.venueAddress}</p>
          <a
            className="btn btn--red"
            href={EVENT.mapUrl}
            target="_blank"
            rel="noreferrer"
          >
            지도에서 보기
          </a>
        </section>

        <div className="media-ph" role="img" aria-label="오시는길">
          오시는길
        </div>

        <section className="block">
          <h2>자가용</h2>
          <p className="sec__body">
            서울춘천고속도로 · 서울양양고속도로를 이용해 인제스피디움으로
            진입합니다. 대회 당일 지정 주차장만 운영합니다.
          </p>
        </section>

        <section className="block">
          <h2>버스 · 셔틀</h2>
          <p className="sec__body">
            접수 오픈 이후 수도권 셔틀 노선이 공지됩니다. 현장 주정차는 통제될
            수 있습니다.
          </p>
        </section>
      </div>
    </main>
  );
}
