import Image from "next/image";
import { EVENT } from "@/lib/event";
import {
  HOME_MELON_LOGO,
  HOME_SPONSORS,
  footerPartnerLogo,
  type FooterPartnerLogoKey,
} from "@/lib/sponsor-logos";

type Logo = {
  key: string;
  name: string;
  src: string;
  width: number;
  height: number;
  ink?: boolean;
};

type PartnerGroup = {
  role: string;
  items: readonly { key: FooterPartnerLogoKey; name: string }[];
};

const PARTNERS: readonly PartnerGroup[] = EVENT.footerPartners;

/* 푸터 로고는 흰색이라 카드 위에선 검정으로, 멜론만 컬러 */
function partnerLogo(item: PartnerGroup["items"][number]): Logo {
  return item.key === "melon"
    ? { key: item.key, name: item.name, ...HOME_MELON_LOGO }
    : { key: item.key, name: item.name, ink: true, ...footerPartnerLogo(item.key) };
}

const PARTNER_ROWS = PARTNERS.map((group) => ({
  label: group.role,
  logos: group.items.map(partnerLogo),
}));

function LogoCard({ logo }: { logo: Logo }) {
  return (
    <li
      className={[
        "sponsors__item",
        `sponsors__item--${logo.key}`,
        logo.ink ? "sponsors__item--ink" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        src={logo.src}
        alt={logo.name}
        width={logo.width}
        height={logo.height}
        draggable={false}
      />
    </li>
  );
}

export function HomeSponsors() {
  return (
    <section className="sponsors" aria-labelledby="sponsors-title">
      <div className="sponsors__inner reveal">
        <div className="sponsors__head">
          <p className="kicker">BRANDS</p>
          <h2 className="sponsors__title" id="sponsors-title">
            마블런과{" "}
            <br />
            <em>함께하는 브랜드</em>
          </h2>
        </div>
        <div className="sponsors__partners">
          {PARTNER_ROWS.map((row) => (
            <div key={row.label} className="sponsors__partner">
              <p className="sponsors__label">{row.label}</p>
              <ul className="sponsors__grid">
                {row.logos.map((logo) => (
                  <LogoCard key={logo.key} logo={logo} />
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="sponsors__label sponsors__label--sponsors">SPONSORS</p>
        <ul className="sponsors__grid sponsors__grid--sponsors">
          {HOME_SPONSORS.map((logo) => (
            <LogoCard key={logo.key} logo={logo} />
          ))}
        </ul>
      </div>
    </section>
  );
}
