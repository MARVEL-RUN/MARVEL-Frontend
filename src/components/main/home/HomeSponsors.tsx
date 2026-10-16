import Image from "next/image";
import { HOME_SPONSORS } from "@/lib/sponsor-logos";

export function HomeSponsors() {
  return (
    <section className="sponsors" aria-labelledby="sponsors-title">
      <div className="sponsors__inner">
        <div className="sponsors__head">
          <h2 className="sponsors__title" id="sponsors-title">
            마블런과{" "}
            <br />
            함께하는 브랜드
          </h2>
          <p className="sponsors__label">SPONSORS</p>
        </div>
        <ul className="sponsors__grid">
          {HOME_SPONSORS.map((s) => (
            <li key={s.key} className={`sponsors__item sponsors__item--${s.key}`}>
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
    </section>
  );
}
