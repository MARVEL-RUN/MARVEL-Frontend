import Image from "next/image";
import { ONSITE_BOOTHS, ONSITE_DRIVE } from "@/lib/onsite-program";
import { SideBanner } from "../../layout/SideBanner";

function DriveCard({ item }: { item: (typeof ONSITE_DRIVE)[number] }) {
  return (
    <li className="onsite-drive">
      <p className="onsite-drive__kicker">{item.kicker}</p>
      <div className="onsite-drive__media">
        {/* eslint-disable-next-line @next/next/no-img-element -- PPT 내보낸 SVG(비트맵 포함) */}
        <img src={item.photo} alt="" className="onsite-drive__art" loading="lazy" />
      </div>
      <h3 className="onsite-drive__title">{item.title}</h3>
      <ul className="onsite-drive__lines">
        {item.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </li>
  );
}

function BoothCard({ item }: { item: (typeof ONSITE_BOOTHS)[number] }) {
  const logoClass = item.logoOnDark
    ? "onsite-booth__logo onsite-booth__logo--invert"
    : "onsite-booth__logo";

  return (
    <li className="onsite-booth">
      <div className="onsite-booth__frame">
        <Image
          src={item.photo}
          alt=""
          width={480}
          height={720}
          className="onsite-booth__art"
          sizes="(max-width: 720px) 88vw, 280px"
        />
        <div className="onsite-booth__shade" aria-hidden />
        <div className="onsite-booth__copy">
          {item.logo ? (
            <Image
              src={item.logo}
              alt=""
              width={200}
              height={48}
              className={logoClass}
            />
          ) : null}
          <p className="onsite-booth__partner">{item.partner}</p>
          <h3 className="onsite-booth__title">{item.title}</h3>
          <p className="onsite-booth__body">{item.body}</p>
        </div>
      </div>
    </li>
  );
}

export function OnsiteProgramPage() {
  return (
    <main className="page onsite-page">
      <SideBanner kicker="PROGRAM" title="현장프로그램" en="ON-SITE" />
      <div className="page__body wrap onsite-page__body">
        <section className="onsite-block" aria-labelledby="onsite-drive-heading">
          <p className="kicker">DRIVE</p>
          <h2 id="onsite-drive-heading">체험 · 주행</h2>
          <ul className="onsite-drive-grid">
            {ONSITE_DRIVE.map((item) => (
              <DriveCard key={item.id} item={item} />
            ))}
          </ul>
        </section>
        <section className="onsite-block" aria-labelledby="onsite-booth-heading">
          <p className="kicker">BOOTH</p>
          <h2 id="onsite-booth-heading">부스 · 프로그램</h2>
          <ul className="onsite-booth-grid">
            {ONSITE_BOOTHS.map((item) => (
              <BoothCard key={item.id} item={item} />
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
