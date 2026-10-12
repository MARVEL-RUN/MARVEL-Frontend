import Image from "next/image";
import { ONSITE_BOOTHS, ONSITE_DRIVE } from "@/lib/onsite-program";
import { SideBanner } from "../../layout/SideBanner";

function DriveRow({ item, no }: { item: (typeof ONSITE_DRIVE)[number]; no: number }) {
  return (
    <li className={`onsite-drive onsite-tone--${item.tone}`}>
      <div className="onsite-drive__media">
        <Image
          src={item.photo}
          alt=""
          fill
          className="onsite-drive__art"
          sizes="(max-width: 720px) 100vw, 520px"
        />
        <span className="onsite-drive__no" aria-hidden>
          {String(no).padStart(2, "0")}
        </span>
      </div>
      <div className="onsite-drive__body">
        <p className="onsite-drive__en">{item.en}</p>
        <h3 className="onsite-drive__title">{item.title}</h3>
        <p className="onsite-drive__lead">{item.lead}</p>
        <dl className="onsite-drive__spec">
          {item.specs.map((spec) => (
            <div key={spec.label} className={spec.price ? "is-price" : undefined}>
              <dt>{spec.label}</dt>
              <dd>
                {spec.value}
                {spec.note ? <small>{spec.note}</small> : null}
              </dd>
            </div>
          ))}
        </dl>
        {item.tiers ? (
          <ul className="onsite-drive__tiers" aria-label="인원별 요금">
            {item.tiers.map((tier) => (
              <li key={tier.people}>
                <span>{tier.people}</span>
                <strong>{tier.price}</strong>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

function BoothCard({ item }: { item: (typeof ONSITE_BOOTHS)[number] }) {
  const logoClass =
    item.id === "taping"
      ? "onsite-booth__logo onsite-booth__logo--blend"
      : "onsite-booth__logo";

  return (
    <li className="onsite-booth">
      <div className="onsite-booth__frame">
        <Image
          src={item.photo}
          alt=""
          fill
          className="onsite-booth__art"
          sizes="(max-width: 720px) 88vw, 280px"
        />
        <div className="onsite-booth__shade" aria-hidden />
        <div className="onsite-booth__copy">
          {item.logo ? (
            <Image
              src={item.logo.src}
              alt=""
              width={item.logo.width}
              height={item.logo.height}
              className={logoClass}
            />
          ) : null}
          <p className="onsite-booth__tagline">{item.tagline}</p>
          <h3 className="onsite-booth__title">{item.title}</h3>
          {!item.logo ? <p className="onsite-booth__name">{item.partner}</p> : null}
          {item.about ? <p className="onsite-booth__about">{item.about}</p> : null}
          <p className="onsite-booth__body">{item.body}</p>
        </div>
      </div>
    </li>
  );
}

export function OnsiteProgramPage() {
  return (
    <main className="page onsite-page">
      <SideBanner kicker="PROGRAM" title="현장프로그램" en="ON-SITE PROGRAM" />
      <div className="page__body wrap onsite-page__body">
        <section className="onsite-sec" aria-labelledby="onsite-drive-heading">
          <header className="onsite-sec__head">
            <p className="kicker">01 / DRIVE</p>
            <h2 id="onsite-drive-heading">
              서킷 <em>체험 · 주행</em>
            </h2>
            <p className="onsite-sec__lead">
              레이스 전후로 인제스피디움에서 즐길 수 있는 주행 체험입니다.
            </p>
          </header>
          <ol className="onsite-drives">
            {ONSITE_DRIVE.map((item, index) => (
              <DriveRow key={item.id} item={item} no={index + 1} />
            ))}
          </ol>
        </section>

        <section className="onsite-sec" aria-labelledby="onsite-booth-heading">
          <header className="onsite-sec__head">
            <p className="kicker">02 / BOOTH</p>
            <h2 id="onsite-booth-heading">
              함께하는 <em>부스 · 프로그램</em>
            </h2>
            <p className="onsite-sec__lead">
              러닝 전후 컨디션과 즐거움을 채워 줄 파트너 부스입니다.
            </p>
          </header>
          <ul className="onsite-booths">
            {ONSITE_BOOTHS.map((item) => (
              <BoothCard key={item.id} item={item} />
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
