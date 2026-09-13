import { EVENT } from "@/lib/event";
import { SideBanner } from "../layout/SideBanner";
import { KakaoVenueMap } from "./KakaoVenueMap";

export function DirectionsPage() {
  return (
    <main className="page">
      <SideBanner kicker="LOCATION" title="오시는길" en="GET TO THE START LINE" />
      <div className="page__body wrap">
        <div className="directions">
          <header className="venue-head">
            <p className="kicker">VENUE</p>
            <h2 className="sec__title">
              {EVENT.venue}
              <br />
              <em>{EVENT.venueEn}</em>
            </h2>
            <p className="sec__body">
              {EVENT.venueAddress.replace(` ${EVENT.venue}`, "")}
            </p>
          </header>
          <div className="directions__row">
            <KakaoVenueMap />
            <section className="venue-copy">
              {EVENT.venueAccess.map((group) => (
                <div key={group.title}>
                  <h3 className="venue-copy__group">
                    {group.title}
                    {"note" in group ? ` · ${group.note}` : ""}
                  </h3>
                  <ol className="timeline">
                    {group.items.map((item) => (
                      <li key={item.text}>
                        <time>{item.badge}</time>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
              <a
                className="btn btn--ghost"
                href={EVENT.mapUrl}
                target="_blank"
                rel="noreferrer"
              >
                카카오맵에서 보기
              </a>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
