import { VIRTUAL_RUN_ASSETS } from "@/lib/virtual-run/assets";
import { KeyVisualCopyright } from "../../main/layout/KeyVisualCopyright";
import { ScrambleText } from "../fx/ScrambleText";

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
        <p className="kicker">
          <ScrambleText key={kicker} text={kicker} delay={120} duration={480} />
        </p>
        <h1 className="side-banner__title">
          <ScrambleText key={title} text={title} delay={220} duration={720} />
        </h1>
        <p className="side-banner__en">
          <ScrambleText key={en} text={en} delay={380} duration={760} />
        </p>
      </div>
      <KeyVisualCopyright />
    </section>
  );
}
