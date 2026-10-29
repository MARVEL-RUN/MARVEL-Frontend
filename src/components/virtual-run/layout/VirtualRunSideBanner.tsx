import { VIRTUAL_RUN_ASSETS } from "@/lib/virtual-run/assets";
import { KeyVisualCopyright } from "../../main/layout/KeyVisualCopyright";

export function VirtualRunSideBanner({
  kicker,
  title,
  en,
}: {
  kicker: string;
  title: string;
  en: string;
}) {
  return (
    <section className="side-banner side-banner--virtual-run">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={VIRTUAL_RUN_ASSETS.banner}
        alt=""
        width={1656}
        height={1065}
        draggable={false}
        className="side-banner__art"
      />
      <div className="side-banner__copy">
        <p className="kicker">{kicker}</p>
        <h1 className="side-banner__title">{title}</h1>
        <p className="side-banner__en">{en}</p>
      </div>
      <KeyVisualCopyright />
    </section>
  );
}
