import { EVENT } from "@/lib/event";
import { SideBanner } from "../layout/SideBanner";
import { KakaoVenueMap } from "./KakaoVenueMap";

export function DirectionsPage() {
  return (
    <main className="page">
      <SideBanner kicker="LOCATION" title="오시는길" en="GET TO THE START LINE" />
      <div className="page__body wrap">
        <div className="directions">
          <KakaoVenueMap />
          <section className="venue-card">
            <a
              className="venue-card__addr"
              href={EVENT.mapUrl}
              target="_blank"
              rel="noreferrer"
            >
              <svg
                className="venue-card__pin"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"
                />
              </svg>
              {EVENT.venue} {EVENT.venueAddress.replace(` ${EVENT.venue}`, "")}
            </a>
            {EVENT.venueAccess.map((group) => (
              <div key={group.title} className="venue-route">
                <h2>
                  {group.title}
                  {"note" in group ? (
                    <span className="venue-route__note"> ({group.note})</span>
                  ) : null}
                </h2>
                {group.items.map((item) => (
                  <p key={item.text}>
                    <span
                      className={`venue-badge venue-badge--${item.tone}`}
                    >
                      {item.badge}
                    </span>
                    {item.text}
                  </p>
                ))}
              </div>
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}
