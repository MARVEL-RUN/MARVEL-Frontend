import Image from "next/image";
import { EVENT } from "@/lib/event";
import { HOME_SPONSORS, footerPartnerLogo } from "@/lib/sponsor-logos";

type Logo = {
  key: string;
  name: string;
  src: string;
  width: number;
  height: number;
  ink?: boolean;
};

const MELON = HOME_SPONSORS.find((s) => s.key === "melon")!;

/* 푸터 로고는 흰색이라 카드 위에선 검정으로, 멜론만 컬러 */
const GROUPS: { label: string; items: Logo[] }[] = [
  { label: "SPONSORS", items: HOME_SPONSORS },
  ...EVENT.footerPartners.map((group) => ({
    label: group.role,
    items: group.items.map((item) =>
      item.key === "melon"
        ? { ...MELON, key: "partner-melon" }
        : { key: item.key, name: item.name, ink: true, ...footerPartnerLogo(item.key) },
    ),
  })),
];

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
            <ul className="sponsors__grid">
              {group.items.map((s) => (
                <li
                  key={s.key}
                  className={[
                    "sponsors__item",
                    `sponsors__item--${s.key}`,
                    s.ink ? "sponsors__item--ink" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Image
                    src={s.src}
                    alt={s.name}
                    width={s.width}
                    height={s.height}
                    draggable={false}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
