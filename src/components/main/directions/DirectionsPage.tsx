import { EVENT } from "@/lib/event";
import { SideBanner } from "../layout/SideBanner";
import { KakaoVenueMap } from "./KakaoVenueMap";
import { VenueActions } from "./VenueActions";

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
            <VenueActions />
          </header>
          <div className="directions__row">
            <KakaoVenueMap />
            <section className="venue-copy">
              {EVENT.venueAccess.map((group) => {
                const note = "note" in group ? group.note : undefined;

                return (
                  <article key={group.title} className="venue-access">
                    <header className="venue-access__head">
                      <h3 className="venue-access__title">{group.title}</h3>
                      {note ? <p className="venue-access__note">{note}</p> : null}
                    </header>
                    <ul className="venue-access__list">
                      {group.items.map((item) => {
                        const [lead, ...rest] = item.text.split(" | ");

                        return (
                          <li key={item.text} className="venue-access__row">
                            <span className="venue-access__badge">{item.badge}</span>
                            <span className="venue-access__text">
                              <span>{lead}</span>
                              {rest.map((line) => (
                                <span key={line} className="venue-access__sub">
                                  {line}
                                </span>
                              ))}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </article>
                );
              })}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
