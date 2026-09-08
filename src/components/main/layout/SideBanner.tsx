import { MAIN_ASSETS } from "@/lib/assets";

export function SideBanner({
  kicker,
  title,
  en,
}: {
  kicker: string;
  title: string;
  en: string;
}) {
  return (
    <section className="side-banner">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={MAIN_ASSETS.sideBanner}
        alt=""
        width={1920}
        height={270}
        draggable={false}
        className="side-banner__art"
      />
      <div className="side-banner__copy">
        <p className="kicker">{kicker}</p>
        <h1 className="side-banner__title">{title}</h1>
        <p className="side-banner__en">{en}</p>
      </div>
    </section>
  );
}
