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

const ROLE_EN: Record<string, string> = {
  주최: "HOSTED BY",
  주관: "ORGANIZED BY",
  미디어파트너: "MEDIA PARTNER",
  "공식 러닝 뮤직 파트너": "OFFICIAL MUSIC PARTNER",
};

/* 푸터 로고는 흰색이라 카드 위에선 검정으로, 멜론만 컬러 */
function partnerLogo(item: PartnerGroup["items"][number]): Logo {
  return item.key === "melon"
    ? { key: item.key, name: item.name, ...HOME_MELON_LOGO }
    : { key: item.key, name: item.name, ink: true, ...footerPartnerLogo(item.key) };
}

const ROWS: { role: string; en: string; logos: Logo[] }[] = [
  ...PARTNERS.map((group) => ({
    role: group.role,
    en: ROLE_EN[group.role] ?? "",
    logos: group.items.map(partnerLogo),
  })),
  { role: "후원사", en: "SPONSORS", logos: HOME_SPONSORS },
];

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
        <p className="kicker">BRANDS</p>
        <h2 className="sponsors__title" id="sponsors-title">
          마블런과 <em>함께하는 브랜드</em>
        </h2>
        <div className="sponsors__rows">
          {ROWS.map((row) => (
            <div key={row.role} className="sponsors__row">
              <h3 className="sponsors__role">
                <span className="sponsors__role-ko">{row.role}</span>
                {row.en ? <span className="sponsors__role-en">{row.en}</span> : null}
              </h3>
              <ul className="sponsors__grid">
                {row.logos.map((logo) => (
                  <LogoCard key={logo.key} logo={logo} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
