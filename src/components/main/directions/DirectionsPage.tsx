import Image from "next/image";
import { MAIN_ASSETS } from "@/lib/assets";
import { EVENT } from "@/lib/event";
import { SideBanner } from "../layout/SideBanner";
import { KakaoVenueMap } from "./KakaoVenueMap";
import { VenueActions } from "./VenueActions";

function accessItemRows(items: (typeof EVENT.venueAccess)[number]["items"]) {
  return items.map((item) => {
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
  });
}

export function DirectionsPage() {
  const routeAccess = EVENT.venueAccess.filter((group) => group.title !== "주차");
  const parkingAccess = EVENT.venueAccess.find((group) => group.title === "주차");

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
              {routeAccess.map((group) => {
                const note = "note" in group ? group.note : undefined;

                return (
                  <article key={group.title} className="venue-access">
                    <header className="venue-access__head">
                      <h3 className="venue-access__title">{group.title}</h3>
                      {note ? <p className="venue-access__note">{note}</p> : null}
                    </header>
                    <ul className="venue-access__list">{accessItemRows(group.items)}</ul>
                  </article>
                );
              })}
            </section>
          </div>
          <section className="directions-parking" aria-labelledby="directions-parking-title">
            <hr className="guide-rule" />
            <div className="directions-parking__row">
              {parkingAccess ? (
                <div className="venue-copy directions-parking__copy">
                  <header className="directions-parking__head">
                    {"kicker" in parkingAccess && parkingAccess.kicker ? (
                      <p className="kicker">{parkingAccess.kicker}</p>
                    ) : null}
                    <h2 className="directions-parking__title" id="directions-parking-title">
                      주차 안내
                    </h2>
                  </header>
                  <article className="venue-access">
                    <ul className="venue-access__list">
                      {accessItemRows(parkingAccess.items)}
                    </ul>
                  </article>
                </div>
              ) : null}
              <figure className="directions-parking__figure">
                <Image
                  src={MAIN_ASSETS.directionsParking}
                  alt="인제스피디움 주차장 위치, 카카오T 셔틀 승하차존·티켓박스, 행사장 도보 이동 경로 안내"
                  width={995}
                  height={580}
                  sizes="(max-width: 720px) 100vw, min(1100px, 100vw - 3rem)"
                  className="directions-parking__img"
                />
              </figure>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
