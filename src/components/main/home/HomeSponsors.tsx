import { Fragment } from "react";
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

const PARTNER_ROWS = [
  ["주최", "주관"],
  ["미디어파트너", "공식 러닝 뮤직 파트너"],
];

/* 푸터 로고는 흰색이라 카드 위에선 검정으로, 멜론만 컬러 */
function partnerLogo(item: PartnerGroup["items"][number]): Logo {
  return item.key === "melon"
    ? { key: item.key, name: item.name, ...HOME_MELON_LOGO }
    : { key: item.key, name: item.name, ink: true, ...footerPartnerLogo(item.key) };
}

const GROUPS: { label: string; parts: Logo[][] }[] = [
  { label: "SPONSORS", parts: [HOME_SPONSORS] },
  ...PARTNER_ROWS.map((roles) => ({
    label: roles.join(" & "),
    parts: PARTNERS.filter((group) => roles.includes(group.role)).map((group) =>
      group.items.map(partnerLogo),
    ),
  })),
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
        {GROUPS.map((group, i) => (
          <div key={group.label} className="sponsors__row">
            <div className="sponsors__head">
              {i === 0 ? (
                <>
                  <p className="kicker">BRANDS</p>
                  <h2 className="sponsors__title" id="sponsors-title">
                    마블런과{" "}
                    <br />
                    <em>함께하는 브랜드</em>
                  </h2>
                </>
              ) : null}
              <p className="sponsors__label">{group.label}</p>
            </div>
            <ul
              className={
                group.parts.length > 1
                  ? "sponsors__grid sponsors__grid--split"
                  : "sponsors__grid"
              }
            >
              {group.parts.map((part, j) => (
                <Fragment key={j}>
                  {j > 0 ? (
                    <li className="sponsors__amp" aria-hidden>
                      &amp;
                    </li>
                  ) : null}
                  {part.map((logo) => (
                    <LogoCard key={logo.key} logo={logo} />
                  ))}
                </Fragment>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
