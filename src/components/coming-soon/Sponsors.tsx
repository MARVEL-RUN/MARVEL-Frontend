import Image from "next/image";
import { EVENT } from "@/lib/event";
import {
  comingSoonSponsorLogoClass,
  comingSoonSponsorSrc,
  isSponsorRole,
  sponsorLogoSize,
} from "@/lib/sponsor-logos";

export function Sponsors() {
  return (
    <section className="sponsors">
      <ul className="sponsors__list">
        {EVENT.sponsors.map((sponsor) => {
          if (!isSponsorRole(sponsor.role)) return null;
          const size = sponsorLogoSize(sponsor.role);

          return (
            <li key={sponsor.role} className="sponsors__item">
              <p className="sponsors__role">{sponsor.role}</p>
              <Image
                src={comingSoonSponsorSrc(sponsor.role)}
                alt={sponsor.name}
                width={size.width}
                height={size.height}
                className={comingSoonSponsorLogoClass(sponsor.role)}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
