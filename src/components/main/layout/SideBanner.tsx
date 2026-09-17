import { MAIN_ASSETS } from "@/lib/assets";
import { MOBILE_MQ } from "@/lib/viewport";
import { KeyVisualCopyright } from "./KeyVisualCopyright";

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
      <picture>
        <source
          media={MOBILE_MQ}
          srcSet={MAIN_ASSETS.sideBannerMobile}
          type="image/png"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MAIN_ASSETS.sideBanner}
          alt=""
          width={3099}
          height={405}
          draggable={false}
          className="side-banner__art"
        />
      </picture>
      <div className="side-banner__copy">
        <p className="kicker">{kicker}</p>
        <h1 className="side-banner__title">{title}</h1>
        <p className="side-banner__en">{en}</p>
      </div>
      <KeyVisualCopyright />
    </section>
  );
}
