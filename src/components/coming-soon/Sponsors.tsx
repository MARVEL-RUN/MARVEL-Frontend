import Image from "next/image";
import { EVENT } from "@/lib/event";
import { COMING_SOON_ASSETS } from "@/lib/assets";

const SPONSOR_LOGOS = {
  주최: {
    src: COMING_SOON_ASSETS.host,
    width: 4786,
    height: 1320,
    modifier: "sponsors__logo--host",
  },
  주관: {
    src: COMING_SOON_ASSETS.organizer,
    width: 1601,
    height: 220,
    modifier: "sponsors__logo--organizer",
  },
} as const;

export function Sponsors() {
  return (
    <section className="sponsors">
      <ul className="sponsors__list">
        {EVENT.sponsors.map((sponsor) => {
          const logo = SPONSOR_LOGOS[sponsor.role];

          return (
            <li key={sponsor.role} className="sponsors__item">
              <p className="sponsors__role">{sponsor.role}</p>
              <Image
                src={logo.src}
                alt={sponsor.name}
                width={logo.width}
                height={logo.height}
                className={`sponsors__logo ${logo.modifier}`}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
